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

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import java.net.URL;

public class UiServer {

    private final Server server;
    private final int port;

    public UiServer(int port) {
        this.port = port;
        this.server = new Server(port);
    }

    public void start() throws Exception {
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        server.setHandler(context);

        URL webAppUrl = UiServer.class.getClassLoader().getResource("webapp");
        if (webAppUrl != null) {
            context.setResourceBase(webAppUrl.toURI().toString());
        }

        context.addServlet(new ServletHolder(ApiServlet.class), "/api/*");

        context.addServlet(new ServletHolder(new DefaultServlet()), "/*");

        server.start();
        System.out.println("Fluss UI started at http://localhost:" + port);
    }

    public void join() throws InterruptedException {
        server.join();
    }

    public static void main(String[] args) throws Exception {
        int port = 8081;
        UiServer server = new UiServer(port);
        server.start();
        server.join();
    }
}
