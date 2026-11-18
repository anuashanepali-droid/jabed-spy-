
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { templates, getTemplate } = require("./src/templates");
const { normalizeProfile } = require("./src/profile");
const { renderProfileCard } = require("./src/renderer");
const { saveProfile, getProfile } = require("./src/store");

const app = express();

const PORT = Number(process.env.PORT || 3000);

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);

app.use(express.json({ limit: "32kb" }));

// Rate Limiting
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    limit: Number(process.env.RATE_LIMIT_MAX || 30),
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

// Home
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "Jabed Spy Profile API",
    version: "1.0.0",
    status: "public",
    docs: "/api"
  });
});

// Health Check
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    status: "healthy"
  });
});

// API Documentation
app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    name: "Jabed Spy Profile API",
    authentication: "none",
    endpoints: [
      "GET /health",
      "GET /api/templates",
      "GET /api/profile/:uid",
      "POST /api/profile/render"
    ],
    renderBody: {
      profile: {
        uid: "10001",
        name: "Example User",
        username: "example",
        gender: "unknown"
      },
      template: "neon"
    },
    note: "This API renders profile data supplied by the client. It does not scrape Facebook or bypass privacy controls."
  });
});

// Templates
app.get("/api/templates", (_req, res) => {
  res.json({
    ok: true,
    total: templates.length,
    templates
  });
});

// Get Cached Profile
app.get("/api/profile/:uid", (req, res) => {
  const profile = getProfile(req.params.uid);

  if (!profile) {
    return res.status(404).json({
      ok: false,
      error: "PROFILE_NOT_CACHED",
      message: "No cached profile found for this UID. Submit profile data to POST /api/profile/render first."
    });
  }

  res.json({
    ok: true,
    profile
  });
});

// Render Profile
app.post("/api/profile/render", async (req, res, next) => {
  try {
    const profile = normalizeProfile(req.body?.profile);

    const templateId = String(
      req.body?.template || "neon"
    ).toLowerCase();

    const theme = getTemplate(templateId);

    if (!theme) {
      return res.status(400).json({
        ok: false,
        error: "INVALID_TEMPLATE",
        available: templates.map(t => t.id)
      });
    }

    const png = await renderProfileCard(
      profile,
      theme,
      templateId
    );

    saveProfile(profile);

    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="spy-profile-${profile.uid}.png"`,
      "Cache-Control": "no-store",
      "X-Profile-Template": templateId
    });

    res.send(png);

  } catch (error) {
    next(error);
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "NOT_FOUND",
    path: req.path
  });
});

// Error Handler
app.use((err, _req, res, _next) => {
  const status = Number(err.status || 500);

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    ok: false,
    error: status === 400
      ? "BAD_REQUEST"
      : "INTERNAL_SERVER_ERROR",
    message: status === 400
      ? err.message
      : "Something went wrong while processing the request."
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(
    `Jabed Spy Profile API listening on port ${PORT}`
  );
});
