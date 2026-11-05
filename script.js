"use strict";

document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements - Status & Navigation
    var globalStatusPill = document.getElementById("globalStatusPill");
    var globalStatusText = document.getElementById("globalStatusText");

    // DOM Elements - Hero & Actions
    var callApiBtn = document.getElementById("callApiBtn");
    var refreshHealthBtn = document.getElementById("refreshHealthBtn");
    var apiMessage = document.getElementById("apiMessage");

    // DOM Elements - Metric Cards
    var healthStatus = document.getElementById("healthStatus");
    var envBadge = document.getElementById("envBadge");
    var uptimeValue = document.getElementById("uptimeValue");
    var memoryValue = document.getElementById("memoryValue");
    var rssMemorySub = document.getElementById("rssMemorySub");
    var latencyValue = document.getElementById("latencyValue");

    // DOM Elements - System Specs
    var specPlatform = document.getElementById("specPlatform");
    var specNode = document.getElementById("specNode");
    var specPid = document.getElementById("specPid");
    var specCpus = document.getElementById("specCpus");

    // DOM Elements - Terminal Console
    var terminalLog = document.getElementById("terminalLog");
    var autoRefreshToggle = document.getElementById("autoRefreshToggle");
    var clearConsoleBtn = document.getElementById("clearConsoleBtn");

    var pollInterval = null;

    // Helper: Append formatted line to terminal
    function appendLog(message, type) {
        if (!terminalLog) return;
        var line = document.createElement("div");
        line.className = "log-line " + (type ? "log-" + type : "log-info");
        
        var timeStr = new Date().toLocaleTimeString();
        line.textContent = "[" + timeStr + "] " + message;
        terminalLog.appendChild(line);
        terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    // Helper: Update Online/Offline Indicator
    function setSystemState(isOnline) {
        if (isOnline) {
            globalStatusPill.classList.remove("offline");
            globalStatusText.textContent = "OPERATIONAL";
            healthStatus.textContent = "HEALTHY";
            healthStatus.className = "metric-value status-text";
        } else {
            globalStatusPill.classList.add("offline");
            globalStatusText.textContent = "DISCONNECTED";
            healthStatus.textContent = "OFFLINE";
            healthStatus.className = "metric-value status-text";
            healthStatus.style.color = "var(--accent-red)";
        }
    }

    // Fetch Health & Telemetry Data
    async function fetchTelemetry() {
        var startTime = performance.now();
        try {
            var response = await fetch("/api/health");
            var latency = Math.round(performance.now() - startTime);

            if (!response.ok) {
                throw new Error("HTTP Status " + response.status);
            }

            var data = await response.json();

            // Update Metrics
            setSystemState(true);
            latencyValue.textContent = latency + " ms";
            uptimeValue.textContent = data.uptimeFormatted || (data.uptimeSeconds + "s");
            memoryValue.textContent = data.memory.heapUsedMB + " MB";
            rssMemorySub.textContent = "Total RSS: " + data.memory.rssMB + " MB";
            envBadge.textContent = "Env: " + (data.environment || "Production").toUpperCase();

            // Update System Architecture Specs
            specNode.textContent = data.system.nodeVersion;
            specPid.textContent = data.system.pid;
            specCpus.textContent = data.system.cpus + " vCPUs";
            specPlatform.textContent = data.system.platform;

            appendLog("TELEMETRY: Health check 200 OK (" + latency + "ms) - Uptime: " + data.uptimeFormatted, "success");
        } catch (error) {
            setSystemState(false);
            latencyValue.textContent = "-- ms";
            appendLog("TELEMETRY FAILED: " + error.message, "error");
        }
    }

    // Trigger API Message Call
    async function callBackendApi() {
        var startTime = performance.now();
        callApiBtn.disabled = true;
        callApiBtn.innerHTML = '<span class="btn-icon">⏳</span> Requesting...';

        try {
            var response = await fetch("/api");
            var latency = Math.round(performance.now() - startTime);

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            var data = await response.json();
            apiMessage.textContent = data.message;
            apiMessage.style.color = "var(--accent-green)";

            appendLog("API CALL: GET /api -> " + JSON.stringify(data.message) + " (" + latency + "ms)", "info");
        } catch (error) {
            apiMessage.textContent = "Failed to reach backend API endpoint.";
            apiMessage.style.color = "var(--accent-red)";
            appendLog("API CALL ERROR: " + error.message, "error");
        } finally {
            callApiBtn.disabled = false;
            callApiBtn.innerHTML = '<span class="btn-icon">🚀</span> Trigger API Call';
        }
    }

    // Auto-polling Management
    function setupPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }

        if (autoRefreshToggle && autoRefreshToggle.checked) {
            pollInterval = setInterval(fetchTelemetry, 5000);
        }
    }

    // Event Listeners
    if (callApiBtn) callApiBtn.addEventListener("click", callBackendApi);
    if (refreshHealthBtn) refreshHealthBtn.addEventListener("click", fetchTelemetry);
    if (autoRefreshToggle) autoRefreshToggle.addEventListener("change", setupPolling);
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener("click", function () {
            terminalLog.innerHTML = "";
            appendLog("Console cleared.", "system");
        });
    }

    // Initial Execution
    fetchTelemetry();
    setupPolling();
});
