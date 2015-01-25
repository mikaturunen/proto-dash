/* global console, require, __dirname, process, module */
/* jshint node: true */
/* jshint esnext: true */

"use strict";

module.exports = {
    events: {
        socket: {
            getDasboard: "dash.get.dashboard",
            refreshDashboard: "dash.refresh.dashboard",
            connected: "connection",
            disconnected: "disconnect"
        }
    }
};