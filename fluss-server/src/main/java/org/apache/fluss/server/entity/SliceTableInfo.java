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

package org.apache.fluss.server.entity;

import org.apache.fluss.metadata.TablePath;

import java.util.Objects;

/** Information about a table to be snapshotted from source to derived table. */
public class SliceTableInfo {

    private final long tableId;
    private final TablePath sourceTablePath;
    private final TablePath derivedTablePath;
    private final long snapshotEpoch;

    public SliceTableInfo(
            long tableId,
            TablePath sourceTablePath,
            TablePath derivedTablePath,
            long snapshotEpoch) {
        this.tableId = tableId;
        this.sourceTablePath = sourceTablePath;
        this.derivedTablePath = derivedTablePath;
        this.snapshotEpoch = snapshotEpoch;
    }

    public long getTableId() {
        return tableId;
    }

    public TablePath getSourceTablePath() {
        return sourceTablePath;
    }

    public TablePath getDerivedTablePath() {
        return derivedTablePath;
    }

    public long getSnapshotEpoch() {
        return snapshotEpoch;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        SliceTableInfo that = (SliceTableInfo) o;
        return tableId == that.tableId
                && snapshotEpoch == that.snapshotEpoch
                && Objects.equals(sourceTablePath, that.sourceTablePath)
                && Objects.equals(derivedTablePath, that.derivedTablePath);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tableId, sourceTablePath, derivedTablePath, snapshotEpoch);
    }

    @Override
    public String toString() {
        return "SliceTableInfo{"
                + "tableId="
                + tableId
                + ", sourceTablePath="
                + sourceTablePath
                + ", derivedTablePath="
                + derivedTablePath
                + ", snapshotEpoch="
                + snapshotEpoch
                + '}';
    }
}
