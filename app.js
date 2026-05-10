const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const { createProxyMiddleware } = require("http-proxy-middleware");
const setupSwagger = require("./utils/swagger");
const { Buffer } = require("buffer");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const gatewayLogger = require("./middleware/experimentLogger");

app.use(gatewayLogger);


app.use((req, res, next) => {
  const start = Date.now();

  const requestSize = Buffer.byteLength(
    JSON.stringify(req.body || {})
  );

  console.log("📥 INCOMING REQUEST:", {
    method: req.method,
    url: req.originalUrl,
    requestSizeBytes: requestSize,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log("📊 GATEWAY LOG:", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      responseSize: res.get("Content-Length"),
      userAgent: req.headers["user-agent"],
    });
  });

  next();
});

// setupSwagger(app); changes asysnc function from sync
// function authenticateToken(req, res, next) {
//     const token = req.headers["authorization"];

//     if (!token) {
//         return res.status(401).json({ message: "No token provided" });
//     }

//     try {
//         const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
//         req.user = verified;
//         next();
//     } catch (err) {
//         return res.status(403).json({ message: "Invalid token" });
//     }
// }



app.post("/auth/login", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Login failed through gateway" });
  }
});

app.use(
    "/users",
    createProxyMiddleware({
        target: "http://localhost:3001/users",
        changeOrigin: true,
    })
);

app.post("/auth/register", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Register failed through gateway" });
  }
});



app.get('/', (req, res) => {
    res.send('Hello from the e-api-gateway-service express app!\n Try /docs to retrive all docs.')
})


setupSwagger(app).then(() => {
    console.log("Mearged Swagger loaded successfully");
});


app.listen(3000, () => {
    console.log(`API Gateway service running on ${PORT}`);
});
