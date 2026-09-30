const http = require("http");

const server = http.createServer((req, res) => {

    if (req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });

        res.end("Hello Sai Teja");
    }

});

server.listen(5000, () => {
    console.log("Server running on port 3000");
});