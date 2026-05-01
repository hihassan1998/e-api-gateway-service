const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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
