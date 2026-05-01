const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const { createProxyMiddleware } = require("http-proxy-middleware");
const setupSwagger = require("./utils/swagger");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);

function authenticateToken(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
}

app.use(
    "/auth",
    createProxyMiddleware({
        target: "http://localhost:3001",
        changeOrigin: true,

        onProxyReq: (proxyReq, req, res) => {
            const token = req.headers.authorization;
            if (token) {
                proxyReq.setHeader("Authorization", token);
            }
        },
    })
);

app.use(
    "/users",
    createProxyMiddleware({
        target: "http://localhost:3002",
        changeOrigin: true,

        onProxyReq: (proxyReq, req, res) => {
            const token = req.headers.authorization;
            if (token) {
                proxyReq.setHeader("Authorization", token);
            }
        },
    })
);


app.use(
  "/business",
  authenticateToken,
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
  })
);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Unauthorized
 */
app.get("/dashboard", authenticateToken, async (req, res) => {
    try {
        let user = null;
        let investments = [];

        try {
            const userResponse = await fetch("http://localhost:3002/users/me", {
                headers: { Authorization: req.headers.authorization },
            });

            if (userResponse.ok) {
                user = await userResponse.json();
            }
        } catch (e) {
            console.log("User service not ready");
        }

        try {
            const businessResponse = await fetch("http://localhost:3003/investments", {
                headers: { Authorization: req.headers.authorization },
            });

            if (businessResponse.ok) {
                investments = await businessResponse.json();
            }
        } catch (e) {
            console.log("Business service not ready");
        }

        return res.json({
            user,
            investments,
            note: "MVP mode (services may not be fully implemented yet)"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Gateway aggregation failure",
        });
    }
});


// GET / - fetch astring as a swager docs example
/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *         - Get basic data string
 *     summary: Get basic string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success with message
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
app.get('/', (req, res) => {
    res.send('Hello from the e-api-gateway-service express app!\n Try /docs to retrive all docs.')
})


app.listen(3000, () => {
    console.log(`API Gateway service running on ${PORT}`);
});
