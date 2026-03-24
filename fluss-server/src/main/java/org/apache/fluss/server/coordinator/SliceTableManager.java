/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.fluss.server.coordinator;

import org.apache.fluss.annotation.VisibleForTesting;
import org.apache.fluss.exception.FencedTieringEpochException;
import org.apache.fluss.exception.FlussRuntimeException;
import org.apache.fluss.exception.TableNotExistException;
import org.apache.fluss.metadata.TableInfo;
import org.apache.fluss.metadata.TablePath;
import org.apache.fluss.metrics.Counter;
import org.apache.fluss.metrics.MetricNames;
import org.apache.fluss.metrics.groups.MetricGroup;
import org.apache.fluss.server.entity.SliceTableInfo;
import org.apache.fluss.server.metrics.group.SliceMetricGroup;
import org.apache.fluss.server.utils.timer.DefaultTimer;
import org.apache.fluss.server.utils.timer.Timer;
import org.apache.fluss.server.utils.timer.TimerTask;
import org.apache.fluss.utils.clock.Clock;
import org.apache.fluss.utils.clock.SystemClock;
import org.apache.fluss.utils.concurrent.ExecutorThreadFactory;
import org.apache.fluss.utils.concurrent.ShutdownableThread;
import org.apache.fluss.utils.types.Tuple2;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import javax.annotation.concurrent.GuardedBy;

import java.util.ArrayDeque;
import java.util.Collections;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.ToLongFunction;

import static org.apache.fluss.utils.concurrent.LockUtils.inReadLock;
import static org.apache.fluss.utils.concurrent.LockUtils.inWriteLock;

/**
 * A manager to manage the periodic slice from primary key tables to derived append tables.
 *
 * <p>For a table with slice enabled, this manager schedules and coordinates the periodic snapshots
 * of the primary key table's current state to an associated append table.
 *
 * <p>There are several states for the slice:
 *
 * <ul>
 *   <li>New: when a new table with slice enabled is created
 *   <li>Initialized: when the coordinator server is restarted
 *   <li>Scheduled: waiting for the next slice interval
 *   <li>Pending: waiting for slice service to request the table
 *   <li>Snapshotting: when the slice service is creating a snapshot
 *   <li>Completed: when a slice round has completed successfully
 *   <li>Failed: when the slice failed
 * </ul>
 *
 * <p>The state machine of slice:
 *
 * <pre>{@code
 * ┌─────┐ ┌──────┐
 * │ New │ │ Init │
 * └──┬──┘ └──┬───┘
 *    ▼       ▼
 *  ┌──────────┐ (snapshot interval elapsed)
 *  │Scheduled ├─────┐
 *  └─────▲────┘     │
 *        │      ┌───▼───┐ (assign to snapshot service)  ┌──────────┐
 *        │      │Pending├──────────────────────────────►│Snapshotting├─┐
 *        │      └───▲───┘                              └────┬─────┘ │
 *        │          │                   ┌─────────────────────┘       │
 *        │          │                   │ (timeout or failure)        │ (finished)
 *        │          │                   ▼                             ▼
 *        │          │  (retry)   ┌─────────┐                  ┌───────────┐
 *        │          │◀───────────│ Failed  │                  │ Completed │
 *        │          │            └─────────┘                  └─────┬─────┘
 *        │          │                                               │
 *        │          │           (force finished)                    │
 *        │          └───────────────────────────────────────────────┘
 *        │                     (ready for next round)
 *        └────────────────────────────────────────────────────────────────────┘
 * }</pre>
 */
public class SliceTableManager implements AutoCloseable {

    private static final Logger LOG = LoggerFactory.getLogger(SliceTableManager.class);

    protected static final long SNAPSHOT_SERVICE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

    private final Timer snapshotScheduleTimer;
    private final ScheduledExecutorService snapshotServiceTimeoutChecker;
    private final Clock clock;
    private final Queue<Long> pendingSnapshotTables;
    private final SnapshotExpiredOperationReaper expirationReaper;

    // the snapshot state of the table to be derived,
    // from table_id -> snapshot state
    private final Map<Long, SnapshotState> snapshotStates;

    // table_id -> table path (source primary key table)
    private final Map<Long, TablePath> sourceTablePaths;

    // table_id -> derived table path
    private final Map<Long, TablePath> derivedTablePaths;

    // table_id -> snapshot interval
    private final Map<Long, Long> snapshotIntervals;

    // cache table_id -> snapshot epoch
    private final Map<Long, Long> snapshotEpochs;

    // table_id -> result of the last completed snapshot
    private final Map<Long, LastSnapshotResult> lastSnapshotResult;

    // table_id -> snapshot failure counter
    private final Map<Long, Counter> tableFailureCounters;

    // table_id -> start time (ms) of the currently in-progress snapshot round
    private final Map<Long, Long> currentSnapshotStartTime;

    // the live tables that are being snapshotted,
    // from table_id -> last heartbeat time by the snapshot service
    private final Map<Long, Long> liveSnapshotTableIds;

    // table_id -> delayed snapshot task
    private final Map<Long, DelayedSnapshot> delayedSnapshotByTableId;

    private final ReadWriteLock lock = new ReentrantReadWriteLock(true);

    private final SliceMetricGroup sliceMetricGroup;

    public SliceTableManager(SliceMetricGroup sliceMetricGroup) {
        this(
                new DefaultTimer("delay snapshot derive", 1_000, 20),
                Executors.newSingleThreadScheduledExecutor(
                        new ExecutorThreadFactory("fluss-snapshot-derive-timeout-checker")),
                SystemClock.getInstance(),
                sliceMetricGroup);
    }

    @VisibleForTesting
    protected SliceTableManager(
            Timer snapshotScheduleTimer,
            ScheduledExecutorService snapshotServiceTimeoutChecker,
            Clock clock,
            SliceMetricGroup sliceMetricGroup) {
        this.snapshotScheduleTimer = snapshotScheduleTimer;
        this.snapshotServiceTimeoutChecker = snapshotServiceTimeoutChecker;
        this.clock = clock;
        this.pendingSnapshotTables = new ArrayDeque<>();
        this.snapshotStates = new HashMap<>();
        this.liveSnapshotTableIds = new HashMap<>();
        this.sourceTablePaths = new HashMap<>();
        this.derivedTablePaths = new HashMap<>();
        this.snapshotIntervals = new HashMap<>();
        this.expirationReaper = new SnapshotExpiredOperationReaper();
        expirationReaper.start();
        this.snapshotServiceTimeoutChecker.scheduleWithFixedDelay(
                this::checkSnapshotServiceTimeout, 0, 15, TimeUnit.SECONDS);
        this.snapshotEpochs = new HashMap<>();
        this.lastSnapshotResult = new HashMap<>();
        this.delayedSnapshotByTableId = new HashMap<>();
        this.tableFailureCounters = new HashMap<>();
        this.currentSnapshotStartTime = new HashMap<>();
        this.sliceMetricGroup = sliceMetricGroup;
        registerMetrics();
    }

    private void registerMetrics() {
        sliceMetricGroup.gauge(
                MetricNames.SNAPSHOT_DERIVE_PENDING_TABLES_COUNT,
                () -> inReadLock(lock, pendingSnapshotTables::size));
        sliceMetricGroup.gauge(
                MetricNames.SNAPSHOT_DERIVE_RUNNING_TABLES_COUNT,
                () -> inReadLock(lock, liveSnapshotTableIds::size));
    }

    public void initWithSliceTables(List<Tuple2<TableInfo, TableInfo>> tableInfoPairs) {
        inWriteLock(
                lock,
                () -> {
                    for (Tuple2<TableInfo, TableInfo> sourceAndDerived : tableInfoPairs) {
                        TableInfo sourceTableInfo = sourceAndDerived.f0;
                        TableInfo derivedTableInfo = sourceAndDerived.f1;
                        registerSliceTable(sourceTableInfo, derivedTableInfo);
                        doHandleStateChange(
                                sourceTableInfo.getTableId(), SnapshotState.Initialized);
                        // schedule it to be snapshotted after the interval
                        doHandleStateChange(sourceTableInfo.getTableId(), SnapshotState.Scheduled);
                    }
                });
    }

    public void addNewSliceTable(TableInfo sourceTableInfo, TableInfo derivedTableInfo) {
        inWriteLock(
                lock,
                () -> {
                    registerSliceTable(sourceTableInfo, derivedTableInfo);
                    doHandleStateChange(sourceTableInfo.getTableId(), SnapshotState.New);
                    // schedule it to be snapshotted after the interval
                    doHandleStateChange(sourceTableInfo.getTableId(), SnapshotState.Scheduled);
                });
    }

    @GuardedBy("lock")
    private void registerSliceTable(TableInfo sourceTableInfo, TableInfo derivedTableInfo) {
        long sourceTableId = sourceTableInfo.getTableId();
        sourceTablePaths.put(sourceTableId, sourceTableInfo.getTablePath());
        derivedTablePaths.put(sourceTableId, derivedTableInfo.getTablePath());
        snapshotIntervals.put(
                sourceTableId, sourceTableInfo.getTableConfig().getSliceInterval().toMillis());
        lastSnapshotResult.put(sourceTableId, LastSnapshotResult.initial(clock.milliseconds()));
        snapshotEpochs.put(sourceTableId, 0L);

        // register table-level metrics
        registerTableMetrics(sourceTableId, sourceTableInfo.getTablePath());
    }

    @GuardedBy("lock")
    private void scheduleTableSnapshot(long tableId) {
        Long snapshotInterval = snapshotIntervals.get(tableId);
        LastSnapshotResult lastResult = lastSnapshotResult.get(tableId);
        if (snapshotInterval == null || lastResult == null) {
            // the table has been dropped, return directly
            return;
        }
        // Before reschedule, remove the existing DelayedSnapshot if present
        DelayedSnapshot existingDelayedSnapshot = delayedSnapshotByTableId.remove(tableId);
        if (existingDelayedSnapshot != null) {
            existingDelayedSnapshot.cancel();
        }
        long delayMs = snapshotInterval - (clock.milliseconds() - lastResult.snapshotTime);
        // if the delayMs is < 0, the DelayedSnapshot will be triggered at once without
        // adding into timing wheel.
        DelayedSnapshot delayedSnapshot = new DelayedSnapshot(tableId, delayMs);
        delayedSnapshotByTableId.put(tableId, delayedSnapshot);
        snapshotScheduleTimer.add(delayedSnapshot);
    }

    private void registerTableMetrics(long tableId, TablePath tablePath) {
        // create table-level metric group
        MetricGroup tableMetricGroup =
                sliceMetricGroup.addTableSliceMetricGroup(tableId, tablePath);

        // snapshotLag: milliseconds since last successful snapshot
        tableMetricGroup.gauge(
                MetricNames.SNAPSHOT_DERIVE_TABLE_SNAPSHOT_LAG,
                () ->
                        inReadLock(
                                lock,
                                () -> {
                                    LastSnapshotResult r = lastSnapshotResult.get(tableId);
                                    return r != null ? clock.milliseconds() - r.snapshotTime : -1L;
                                }));

        // snapshotDuration: duration of last snapshot job
        tableMetricGroup.gauge(
                MetricNames.SNAPSHOT_DERIVE_TABLE_SNAPSHOT_DURATION,
                () -> inReadLock(lock, () -> getLastResultField(tableId, r -> r.snapshotDuration)));

        // failuresTotal: total failure count for this table
        Counter failuresCounter =
                tableMetricGroup.counter(MetricNames.SNAPSHOT_DERIVE_TABLE_FAILURES_TOTAL);
        tableFailureCounters.put(tableId, failuresCounter);

        // recordCount: total record count of the last snapshot
        tableMetricGroup.gauge(
                MetricNames.SNAPSHOT_DERIVE_TABLE_RECORD_COUNT,
                () -> inReadLock(lock, () -> getLastResultField(tableId, r -> r.recordCount)));
    }

    /**
     * Returns the value of a single field from the {@link LastSnapshotResult} for the given table,
     * or {@code -1} if the table has no completed snapshot result (e.g. not yet snapshotted or
     * already removed).
     *
     * <p>Must be called under {@link #lock} (read or write).
     */
    @GuardedBy("lock")
    long getLastResultField(long tableId, ToLongFunction<LastSnapshotResult> fieldExtractor) {
        LastSnapshotResult r = lastSnapshotResult.get(tableId);
        return r != null ? fieldExtractor.applyAsLong(r) : -1L;
    }

    public void removeSliceTable(long sourceTableId) {
        inWriteLock(
                lock,
                () -> {
                    sourceTablePaths.remove(sourceTableId);
                    derivedTablePaths.remove(sourceTableId);
                    snapshotIntervals.remove(sourceTableId);
                    lastSnapshotResult.remove(sourceTableId);
                    currentSnapshotStartTime.remove(sourceTableId);
                    tableFailureCounters.remove(sourceTableId);
                    // close and remove the metric group to unregister metrics
                    sliceMetricGroup.removeTableSliceMetricGroup(sourceTableId);
                    snapshotStates.remove(sourceTableId);
                    liveSnapshotTableIds.remove(sourceTableId);
                    snapshotEpochs.remove(sourceTableId);
                    // Remove and cancel the delayed snapshot task if present
                    DelayedSnapshot delayedSnapshot =
                            delayedSnapshotByTableId.remove(sourceTableId);
                    if (delayedSnapshot != null) {
                        delayedSnapshot.cancel();
                    }
                });
    }

    /**
     * Update the snapshot interval for a table. This method should be called when the table's
     * snapshot interval property is changed via ALTER TABLE.
     *
     * @param tableId the source table id
     * @param newIntervalMs the new snapshot interval in milliseconds
     */
    public void updateTableSnapshotInterval(long tableId, long newIntervalMs) {
        inWriteLock(
                lock,
                () -> {
                    Long currentInterval = snapshotIntervals.get(tableId);
                    if (currentInterval == null) {
                        // the table is not a snapshot derive table or has been dropped, skip update
                        LOG.warn(
                                "Cannot update snapshot interval for table {} as it's not tracked by derived table manager.",
                                tableId);
                        return;
                    }

                    if (currentInterval.equals(newIntervalMs)) {
                        // no change, skip update
                        return;
                    }

                    snapshotIntervals.put(tableId, newIntervalMs);
                    LOG.info(
                            "Updated snapshot interval for table {} from {} ms to {} ms.",
                            tableId,
                            currentInterval,
                            newIntervalMs);

                    // If the table is in Scheduled state, we need to reschedule it with the new
                    // interval
                    SnapshotState currentState = snapshotStates.get(tableId);
                    if (currentState == SnapshotState.Scheduled) {
                        // Reschedule the table snapshot with the new interval
                        scheduleTableSnapshot(tableId);
                    }
                });
    }

    @VisibleForTesting
    protected void checkSnapshotServiceTimeout() {
        inWriteLock(
                lock,
                () -> {
                    long currentTime = clock.milliseconds();
                    Map<Long, TablePath> timeoutTables = new HashMap<>();
                    liveSnapshotTableIds.forEach(
                            (tableId, lastHeartbeat) -> {
                                if (currentTime - lastHeartbeat >= SNAPSHOT_SERVICE_TIMEOUT_MS) {
                                    timeoutTables.put(tableId, sourceTablePaths.get(tableId));
                                }
                            });
                    timeoutTables.forEach(
                            (tableId, tablePath) -> {
                                LOG.warn(
                                        "The snapshot service for table {}({}) is timeout, change it to PENDING.",
                                        sourceTablePaths.get(tableId),
                                        tableId);
                                doHandleStateChange(tableId, SnapshotState.Failed);
                                // then to pending state to enable other snapshot service can pick
                                // it
                                doHandleStateChange(tableId, SnapshotState.Pending);
                            });
                });
    }

    @Nullable
    public SliceTableInfo requestTable() {
        return inWriteLock(
                lock,
                () -> {
                    Long tableId = pendingSnapshotTables.poll();
                    // now no any pending table, return directly
                    if (tableId == null) {
                        return null;
                    }
                    TablePath sourceTablePath = sourceTablePaths.get(tableId);
                    TablePath derivedTablePath = derivedTablePaths.get(tableId);
                    // the table has been dropped, request again
                    if (sourceTablePath == null || derivedTablePath == null) {
                        return requestTable();
                    }
                    doHandleStateChange(tableId, SnapshotState.Snapshotting);
                    long snapshotEpoch = snapshotEpochs.get(tableId);
                    return new SliceTableInfo(
                            tableId, sourceTablePath, derivedTablePath, snapshotEpoch);
                });
    }

    public void finishTableSnapshot(long tableId, long snapshotEpoch, boolean isForceFinished) {
        inWriteLock(
                lock,
                () -> {
                    validateSnapshotServiceRequest(tableId, snapshotEpoch);
                    // to completed state firstly
                    doHandleStateChange(tableId, SnapshotState.Completed);
                    if (isForceFinished) {
                        // add to pending again since it's forced to finish
                        doHandleStateChange(tableId, SnapshotState.Pending);
                    } else {
                        // then to scheduled state to enable other snapshot service can pick it
                        doHandleStateChange(tableId, SnapshotState.Scheduled);
                    }
                });
    }

    public void reportSnapshotFail(long tableId, long snapshotEpoch) {
        inWriteLock(
                lock,
                () -> {
                    validateSnapshotServiceRequest(tableId, snapshotEpoch);
                    // to fail state firstly
                    doHandleStateChange(tableId, SnapshotState.Failed);
                    // then to pending state to enable other snapshot service can pick it
                    doHandleStateChange(tableId, SnapshotState.Pending);
                });
    }

    public void renewSnapshotHeartbeat(long tableId, long snapshotEpoch) {
        inWriteLock(
                lock,
                () -> {
                    validateSnapshotServiceRequest(tableId, snapshotEpoch);
                    SnapshotState snapshotState = snapshotStates.get(tableId);
                    if (snapshotState != SnapshotState.Snapshotting) {
                        throw new IllegalStateException(
                                String.format(
                                        "The table %d to renew snapshot heartbeat must in Snapshotting state, but in %s state.",
                                        tableId, snapshotState));
                    }
                    liveSnapshotTableIds.put(tableId, clock.milliseconds());
                });
    }

    private void validateSnapshotServiceRequest(long tableId, long snapshotEpoch) {
        Long currentEpoch = snapshotEpochs.get(tableId);
        // the table has been dropped, return false
        if (currentEpoch == null) {
            throw new TableNotExistException("The table " + tableId + " doesn't exist.");
        }
        if (snapshotEpoch != currentEpoch) {
            throw new FencedTieringEpochException(
                    String.format(
                            "The snapshot epoch %d is not match current epoch %d in coordinator for table %d.",
                            snapshotEpoch, currentEpoch, tableId));
        }
    }

    /**
     * Handle the state change of the snapshot derive table. The core state transitions for the
     * state machine are as follows:
     *
     * <p>New -> Scheduled:
     *
     * <p>-- When the snapshot derive table is newly created, do: schedule a timer to wait for a
     * snapshot interval configured in table which will transmit the table to Pending.
     *
     * <p>Initialized -> Scheduled：
     *
     * <p>-- When the coordinator server is restarted, for all existing snapshot derive table, if
     * the interval from last snapshot is not less than snapshot interval, do: transmit to Pending,
     * otherwise schedule a timer to wait for a interval which will transmit the table to Pending.
     *
     * <p>Scheduled -> Pending
     *
     * <p>-- The snapshot interval to wait has passed, do: transmit to Pending state
     *
     * <p>Failed -> Pending
     *
     * <p>-- The previous snapshot service failed to snapshot the table, retry to snapshot again,
     * do: transmit to Pending state
     *
     * <p>Pending -> Snapshotting
     *
     * <p>-- When the table is assigned to a snapshot service after snapshot service request the
     * table, do: transmit to Snapshotting state
     *
     * <p>Snapshotting -> Completed
     *
     * <p>-- When the snapshot service finished the table, do: transmit to Completed state
     *
     * <p>Snapshotting -> Failed
     *
     * <p>-- When the snapshot service timeout to report heartbeat or report failure for the table,
     * do: transmit to Failed state
     *
     * <p>Completed -> Pending
     *
     * <p>-- When the snapshot is force finished due to exceeding the specified snapshot duration,
     * do: transmit to Pending state to enable immediate re-snapshot
     *
     * <p>Completed -> Scheduled
     *
     * <p>-- When the snapshot is normally finished, do: transmit to Scheduled state to wait for the
     * next round of snapshot
     */
    private void doHandleStateChange(long tableId, SnapshotState targetState) {
        SnapshotState currentState = snapshotStates.get(tableId);
        if (!isValidStateTransition(currentState, targetState)) {
            LOG.error(
                    "Fail to change state for table {} from {} to {} as it's not a valid state change.",
                    tableId,
                    currentState,
                    targetState);
            return;
        }
        switch (targetState) {
            case New:
            case Initialized:
                // do nothing
                break;
            case Scheduled:
                scheduleTableSnapshot(tableId);
                break;
            case Pending:
                // increase snapshot epoch and initialize the heartbeat of the snapshot table
                snapshotEpochs.computeIfPresent(tableId, (t, v) -> v + 1);
                pendingSnapshotTables.add(tableId);
                break;
            case Snapshotting:
                liveSnapshotTableIds.put(tableId, clock.milliseconds());
                currentSnapshotStartTime.put(tableId, clock.milliseconds());
                break;
            case Completed:
                liveSnapshotTableIds.remove(tableId);
                currentSnapshotStartTime.remove(tableId);
                break;
            case Failed:
                Counter counter = tableFailureCounters.get(tableId);
                if (counter != null) {
                    counter.inc();
                }
                liveSnapshotTableIds.remove(tableId);
                currentSnapshotStartTime.remove(tableId);
                // do nothing
                break;
        }
        doStateChange(tableId, currentState, targetState);
    }

    private boolean isValidStateTransition(
            @Nullable SnapshotState curState, SnapshotState targetState) {
        if (targetState == SnapshotState.New || targetState == SnapshotState.Initialized) {
            // when target state is new or Initialized, it's valid when current state is null
            return curState == null;
        }
        if (curState == null) {
            // the table is dropped, shouldn't continue to do state transition
            return false;
        }
        return targetState.validPreviousStates().contains(curState);
    }

    private void doStateChange(long tableId, SnapshotState fromState, SnapshotState toState) {
        snapshotStates.put(tableId, toState);
        LOG.debug(
                "Successfully changed snapshot state for table {} from {} to {}.",
                tableId,
                fromState,
                toState);
    }

    @Override
    public void close() throws Exception {
        snapshotServiceTimeoutChecker.shutdown();
        expirationReaper.initiateShutdown();
        // improve shutdown time by waking up any ShutdownableThread(s) blocked on poll by
        // sending a no-op.
        snapshotScheduleTimer.add(
                new TimerTask(0) {
                    @Override
                    public void run() {}
                });
        try {
            expirationReaper.awaitShutdown();
        } catch (InterruptedException e) {
            throw new FlussRuntimeException(
                    "Error while shutdown snapshot derive expired operation manager", e);
        }

        snapshotScheduleTimer.shutdown();
        sliceMetricGroup.close();
    }

    private class DelayedSnapshot extends TimerTask {

        private final long tableId;

        public DelayedSnapshot(long tableId, long delayMs) {
            super(delayMs);
            this.tableId = tableId;
        }

        @Override
        public void run() {
            inWriteLock(
                    lock,
                    () -> {
                        // to pending state
                        doHandleStateChange(tableId, SnapshotState.Pending);
                        // Remove from map after execution
                        delayedSnapshotByTableId.remove(tableId);
                    });
        }
    }

    private class SnapshotExpiredOperationReaper extends ShutdownableThread {

        public SnapshotExpiredOperationReaper() {
            super("SnapshotDeriveExpiredOperationReaper", false);
        }

        @Override
        public void doWork() throws Exception {
            advanceClock();
        }

        private void advanceClock() throws InterruptedException {
            snapshotScheduleTimer.advanceClock(200L);
        }
    }

    @VisibleForTesting
    enum SnapshotState {
        // When a new snapshot derive table is created, the state will be New
        New {
            @Override
            public Set<SnapshotState> validPreviousStates() {
                return Collections.emptySet();
            }
        },
        // When the coordinator server is restarted, the state of existing snapshot derive table
        // will be Initialized
        Initialized {
            @Override
            public Set<SnapshotState> validPreviousStates() {
                return Collections.emptySet();
            }
        },
        // When the snapshot derive table is waiting to be snapshotted, such as waiting for the
        // period
        // of snapshot interval, the state will be Scheduled
        Scheduled {
            @Override
            public Set<SnapshotState> validPreviousStates() {
                return EnumSet.of(New, Initialized, Completed);
            }
        },
        // When the period of snapshot interval has passed, but no any snapshot service requesting
        // table, the state will be Pending
        Pending {
            @Override
            public Set<SnapshotState> validPreviousStates() {
                return EnumSet.of(Scheduled, Failed, Completed);
            }
        },
        // When one snapshot service is snapshotting the table, the state will be Snapshotting
        Snapshotting {
            @Override
            public Set<SnapshotState> validPreviousStates() {
                return EnumSet.of(Pending);
            }
        },

        // When one snapshot service has successfully snapshotted the table, the state will be
        // Completed
        Completed {
            @Override
            public Set<SnapshotState> validPreviousStates() {
                return EnumSet.of(Snapshotting);
            }
        },
        // When one snapshot service fail or timeout to snapshot the table, the state will be Failed
        Failed {
            @Override
            public Set<SnapshotState> validPreviousStates() {
                return EnumSet.of(Snapshotting);
            }
        };

        abstract Set<SnapshotState> validPreviousStates();
    }

    /**
     * Immutable snapshot of the statistics collected at the end of one completed snapshot round.
     * Written atomically when a table transitions to {@link SnapshotState#Completed}.
     */
    @VisibleForTesting
    static class LastSnapshotResult {

        /** Timestamp (ms) when this snapshot round completed. */
        final long snapshotTime;

        /** Wall-clock duration (ms) of this snapshot round; {@code -1} if unknown. */
        final long snapshotDuration;

        /**
         * Total record count of the snapshot; {@code -1} if not reported by the snapshot
         * implementation.
         */
        final long recordCount;

        LastSnapshotResult(long snapshotTime, long snapshotDuration, long recordCount) {
            this.snapshotTime = snapshotTime;
            this.snapshotDuration = snapshotDuration;
            this.recordCount = recordCount;
        }

        /**
         * Creates the initial placeholder used when a table is first registered. Only {@code
         * snapshotTime} is meaningful; all other stats are {@code -1} until the first round
         * completes.
         */
        static LastSnapshotResult initial(long snapshotTime) {
            return new LastSnapshotResult(snapshotTime, -1L, -1L);
        }
    }

    @VisibleForTesting
    int getPendingTablesCount() {
        return inReadLock(lock, pendingSnapshotTables::size);
    }

    @VisibleForTesting
    int getRunningTablesCount() {
        return inReadLock(lock, liveSnapshotTableIds::size);
    }

    @VisibleForTesting
    Long getTableLastSuccessTime(long tableId) {
        return inReadLock(
                lock,
                () -> {
                    LastSnapshotResult r = lastSnapshotResult.get(tableId);
                    return r != null ? r.snapshotTime : null;
                });
    }

    @VisibleForTesting
    Long getTableFailureCount(long tableId) {
        return inReadLock(
                lock,
                () -> {
                    Counter c = tableFailureCounters.get(tableId);
                    return c != null ? c.getCount() : 0L;
                });
    }

    @VisibleForTesting
    SnapshotState getTableState(long tableId) {
        return inReadLock(lock, () -> snapshotStates.get(tableId));
    }

    @VisibleForTesting
    long getLastSnapshotResultField(
            long tableId, ToLongFunction<LastSnapshotResult> fieldExtractor) {
        return inReadLock(lock, () -> getLastResultField(tableId, fieldExtractor));
    }
}
