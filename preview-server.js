#!/usr/bin/env node
const http = require("http");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const port = process.env.PORT || 34115;
const baseDir = path.join(__dirname, "src", "com.courcelle.cryptoticker.sdPlugin");

function openBrowser(url) {
    let command;
    let args;
    if (process.platform === "win32") {
        command = "cmd";
        args = ["/c", "start", "", url];
    } else if (process.platform === "darwin") {
        command = "open";
        args = [url];
    } else {
        command = "xdg-open";
        args = [url];
    }
    try {
        const proc = child_process.spawn(command, args, {detached: true, stdio: "ignore"});
        proc.on("error", (e) => {
            console.warn("Warning: could not open browser automatically:", e.message);
        });
        proc.unref();
    } catch (e) {
        console.warn("Warning: could not open browser automatically:", e.message);
    }
}

const server = http.createServer((req, res) => {
    const urlPath = req.url.split("?")[0];
    const relPath = urlPath === "/" ? "dev/preview.html" : urlPath.replace(/^\/+/g, "");
    const filePath = path.join(baseDir, relPath);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("Not found");
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const mime = {
            ".html": "text/html",
            ".js": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".css": "text/css"
        }[ext] || "application/octet-stream";
        res.writeHead(200, {"Content-Type": mime});
        res.end(data);
    });
});

server.listen(port, () => {
    const url = `http://localhost:${port}/dev/preview.html`;
    console.log(`Preview server running at ${url}`);
    openBrowser(url);
});
