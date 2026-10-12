
const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
    // Backend API
    if (req.url === "/api") {
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });

        res.end("Hello Pavan Babu");
        return;
    }

    // Frontend files
    const filePath = req.url === "/"
        ? path.join(__dirname, "index.html")
        : path.join(__dirname, path.basename(req.url.split("?")[0]));

    const ext = path.extname(filePath);

    const contentTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript"
    };

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, {
                "Content-Type": "text/plain"
            });
            res.end("File not found");
            return;
        }

        res.writeHead(200, {
            "Content-Type": contentTypes[ext] || "application/octet-stream"
        });

        res.end(content);
    });
});

server.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
});
