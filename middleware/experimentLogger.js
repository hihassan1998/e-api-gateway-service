const fs = require("fs");

function gatewayLogger(req, res, next) {
  const start = Date.now();

  const requestSize = Buffer.byteLength(JSON.stringify(req.body || {}));

  res.on("finish", () => {
    const duration = Date.now() - start;

    const log = {
      layer: "API_GATEWAY",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      requestSizeBytes: requestSize,
      responseSize: res.get("Content-Length") || 0,
      time: new Date().toISOString(),
    };

    fs.appendFileSync(
      "gateway-logs.txt",
      JSON.stringify(log) + "\n"
    );

    console.log("📊 GATEWAY LOG:", log);
  });

  next();
}

module.exports = gatewayLogger;