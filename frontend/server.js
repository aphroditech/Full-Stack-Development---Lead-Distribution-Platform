// Minimal custom Next.js production server.
// Its only job beyond the default is to capture the real client IP: when no
// upstream proxy has set X-Forwarded-For, we set it from the TCP socket so the
// app (and the backend it calls) can record the visitor's real IP address.
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "8169", 10);
const hostname = "0.0.0.0";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    if (!req.headers["x-forwarded-for"]) {
      const ip = (req.socket && req.socket.remoteAddress) || "";
      if (ip) req.headers["x-forwarded-for"] = ip.replace(/^::ffff:/, "");
    }
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`Frontend server ready on http://${hostname}:${port}`);
  });
});
