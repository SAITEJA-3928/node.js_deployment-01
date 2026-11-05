"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || "0.0.0.0";
const START_TIME = Date.now();

// Helper to format uptime into days, hours, mins, secs
function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
}

// MIME types dictionary for static files
const MIME_TYPES = {
    ".html": "text/html; charset=UTF-8",
    ".css": "text/css; charset=UTF-8",
    ".js": "application/javascript; charset=UTF-8",
    ".json": "application/json; charset=UTF-8",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = parsedUrl.pathname;

    // Security & CORS Headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- API Route: /api ---
    if (pathname === "/api") {
        res.writeHead(200, { "Content-Type": "application/json" });
        const responseData = {
            success: true,
            message: "Hello Pavan Babu - DevOps Engine Online 🚀",
            app: "DevOps Node.js Production Suite",
            version: "2.0.0",
            status: "OPERATIONAL",
            timestamp: new Date().toISOString()
        };
        res.end(JSON.stringify(responseData, null, 2));
        return;
    }

    // --- API Route: /api/health ---
    if (pathname === "/api/health") {
        const memory = process.memoryUsage();
        const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);

        const healthData = {
            status: "HEALTHY",
            environment: process.env.NODE_ENV || "production",
            uptimeSeconds: uptimeSeconds,
            uptimeFormatted: formatUptime(uptimeSeconds),
            memory: {
                rssMB: (memory.rss / (1024 * 1024)).toFixed(2),
                heapTotalMB: (memory.heapTotal / (1024 * 1024)).toFixed(2),
                heapUsedMB: (memory.heapUsed / (1024 * 1024)).toFixed(2)
            },
            system: {
                platform: `${process.platform} (${process.arch})`,
                nodeVersion: process.version,
                pid: process.pid,
                cpus: os.cpus().length,
                freeMemMB: (os.freemem() / (1024 * 1024)).toFixed(2)
            },
            timestamp: new Date().toISOString()
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(healthData, null, 2));
        return;
    }

    // --- Static File Serving ---
    const targetFile = pathname === "/" ? "index.html" : path.basename(pathname);
    const filePath = path.join(__dirname, targetFile);
    const ext = path.extname(filePath).toLowerCase();

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "File not found", path: pathname }));
            return;
        }

        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400"
        });
        res.end(content);
    });
});

// Start Server
server.listen(PORT, HOST, () => {
    console.log(`[🚀 Server Started] Listening on http://${HOST}:${PORT}`);
    console.log(`[ℹ️  Environment] ${process.env.NODE_ENV || "production"}`);
    console.log(`[🩺 Health Endpoint] http://${HOST}:${PORT}/api/health`);
});

// Graceful Shutdown Handling (Essential for Docker / Kubernetes)
function handleShutdown(signal) {
    console.log(`\n[🛑 Received ${signal}] Shutting down gracefully...`);
    server.close(() => {
        console.log("[✅ Server Closed] All connections terminated cleanly.");
        process.exit(0);
    });

    // Force shutdown after 10 seconds timeout
    setTimeout(() => {
        console.error("[⚠️ Force Shutdown] Connections didn't close in time. Terminating.");
        process.exit(1);
    }, 10000);
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
