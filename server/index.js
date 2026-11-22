import express from "express";
import cors from "cors";
import { createHandshakeServer } from "api-handshake/express";

const app = express();
const port = Number(process.env.PORT || 3000);
const frontendOrigin = "http://localhost:5173";

// This CORS middleware is for the demo's normal API routes.
// The handshake adapter independently handles CORS for its own endpoint.
app.use(cors({ origin: frontendOrigin }));

app.use(
  "/api",
  createHandshakeServer({
    apiVersion: "1.0.0",
    environment: "local-demo",
    allowedOrigins: [frontendOrigin],
    credentials: false
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "api-handshake-demo" });
});

app.listen(port, () => {
  console.log(`Demo API listening at http://localhost:${port}`);
  console.log(`Handshake endpoint: http://localhost:${port}/api/__api_handshake`);
});
