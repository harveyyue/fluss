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

package org.apache.fluss.web;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ApiServlet extends HttpServlet {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final List<String> mockDatabases =
            Arrays.asList("default_database", "sales_db", "analytics_db");

    private final Map<String, List<String>> mockTables = new HashMap<>();

    public ApiServlet() {
        mockTables.put("default_database", Arrays.asList("orders", "customers", "products"));
        mockTables.put("sales_db", Arrays.asList("transactions", "revenue"));
        mockTables.put("analytics_db", Arrays.asList("metrics", "reports"));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")) {
            sendJson(resp, Map.of("message", "Fluss API"));
            return;
        }

        try {
            if (pathInfo.startsWith("/databases")) {
                handleListDatabases(resp);
            } else if (pathInfo.startsWith("/tables")) {
                String database = req.getParameter("database");
                if (database == null || database.isEmpty()) {
                    sendError(resp, "Missing required parameter: database");
                    return;
                }
                handleListTables(resp, database);
            } else if (pathInfo.startsWith("/table-schema")) {
                String database = req.getParameter("database");
                String table = req.getParameter("table");
                if (database == null || database.isEmpty() || table == null || table.isEmpty()) {
                    sendError(resp, "Missing required parameters: database and table");
                    return;
                }
                handleGetTableSchema(resp, database, table);
            } else {
                sendError(resp, "Not found: " + pathInfo);
            }
        } catch (Exception e) {
            sendError(resp, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo != null && pathInfo.startsWith("/query")) {
            handleExecuteQuery(resp, req);
        } else {
            sendError(resp, "Not found: " + pathInfo);
        }
    }

    private void handleListDatabases(HttpServletResponse resp) throws IOException {
        sendJson(resp, Map.of("databases", mockDatabases));
    }

    private void handleListTables(HttpServletResponse resp, String database) throws IOException {
        List<String> tables = mockTables.getOrDefault(database, new ArrayList<>());
        List<Map<String, String>> tableList = new ArrayList<>();
        for (String table : tables) {
            Map<String, String> t = new HashMap<>();
            t.put("name", table);
            t.put("type", "table");
            tableList.add(t);
        }
        sendJson(resp, Map.of("tables", tableList));
    }

    private void handleGetTableSchema(HttpServletResponse resp, String database, String tableName)
            throws IOException {
        Map<String, Object> schema = new HashMap<>();
        schema.put("name", tableName);

        List<Map<String, String>> columns = new ArrayList<>();
        if ("orders".equals(tableName)) {
            columns.add(createColumn("order_id", "BIGINT", "Order ID"));
            columns.add(createColumn("customer_id", "BIGINT", "Customer ID"));
            columns.add(createColumn("order_date", "TIMESTAMP", "Order Date"));
            columns.add(createColumn("total_amount", "DECIMAL(10,2)", "Total Amount"));
        } else if ("customers".equals(tableName)) {
            columns.add(createColumn("customer_id", "BIGINT", "Customer ID"));
            columns.add(createColumn("name", "STRING", "Customer Name"));
            columns.add(createColumn("email", "STRING", "Email"));
        } else if ("products".equals(tableName)) {
            columns.add(createColumn("product_id", "BIGINT", "Product ID"));
            columns.add(createColumn("name", "STRING", "Product Name"));
            columns.add(createColumn("price", "DECIMAL(10,2)", "Price"));
        } else {
            columns.add(createColumn("id", "BIGINT", "ID"));
            columns.add(createColumn("data", "STRING", "Data"));
        }

        schema.put("columns", columns);
        sendJson(resp, schema);
    }

    private Map<String, String> createColumn(String name, String type, String comment) {
        Map<String, String> col = new HashMap<>();
        col.put("name", name);
        col.put("type", type);
        col.put("comment", comment);
        return col;
    }

    private void handleExecuteQuery(HttpServletResponse resp, HttpServletRequest req)
            throws IOException {
        Map<String, Object> body = objectMapper.readValue(req.getInputStream(), Map.class);
        String sql = (String) body.get("sql");

        if (sql == null || sql.isEmpty()) {
            sendError(resp, "Missing required parameter: sql");
            return;
        }

        if (sql.toLowerCase().contains("select")) {
            List<Map<String, Object>> results = new ArrayList<>();
            Map<String, Object> row = new HashMap<>();
            row.put("id", 1);
            row.put("name", "Sample Data");
            results.add(row);
            sendJson(resp, Map.of("columns", Arrays.asList("id", "name"), "results", results));
        } else {
            sendJson(resp, Map.of("message", "Query executed successfully"));
        }
    }

    private void sendJson(HttpServletResponse resp, Object data) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(resp.getWriter(), data);
    }

    private void sendError(HttpServletResponse resp, String message) throws IOException {
        resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        sendJson(resp, Map.of("error", message));
    }
}
