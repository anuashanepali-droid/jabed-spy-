const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { templates, getTemplate } = require("./src/templates");
const { normalizeProfile } = require("./src/profile");
const { renderProfileCard } = require("./src/renderer");
const { saveProfile, getProfile } = require("./src/store");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.API_KEY || "";

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "32kb" }));
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  limit: Number(process.env.RATE_LIMIT_MAX || 30),
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

function requireApiKey(req, res, next) {
  if (!API_KEY) return next();
  const supplied = req.get("x-api-key");
  if (!supplied || supplied !== API_KEY) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: "A valid x-api-key header is required." });
  }
  next();
}

app.get("/", (_req, res) => res.json({
  ok: true,
  name: "Jabed Spy Profile API",
  version: "1.0.0",
  docs: "/api"
}));

app.get("/health", (_req, res) => res.json({ ok: true, status: "healthy" }));

app.get("/api", (_req, res) => res.json({
  ok: true,
  endpoints: [
    "GET /health",
    "GET /api/templates",
    "GET /api/profile/:uid",
    "POST /api/profile/render"
  ],
  renderBody: {
    profile: { uid: "10001", name: "Example User", username: "example", gender: "unknown" },
    template: "neon"
  },
  note: "This service renders data supplied by an authorized client. It does not scrape Facebook or bypass privacy controls."
}));

app.get("/api/templates", (_req, res) => res.json({ ok: true, total: templates.length, templates }));

app.get("/api/profile/:uid", requireApiKey, (req, res) => {
  const profile = getProfile(req.params.uid);
  if (!profile) return res.status(404).json({
    ok: false,
    error: "PROFILE_NOT_CACHED",
    message: "No recently rendered profile is cached for this UID. Send authorized profile data to POST /api/profile/render."
  });
  res.json({ ok: true, profile });
});

app.post("/api/profile/render", requireApiKey, async (req, res, next) => {
  try {
    const profile = normalizeProfile(req.body?.profile);
    const templateId = String(req.body?.template || "neon").toLowerCase();
    const theme = getTemplate(templateId);
    if (!theme) return res.status(400).json({
      ok: false,
      error: "INVALID_TEMPLATE",
      available: templates.map(t => t.id)
    });

    const png = await renderProfileCard(profile, theme, templateId);
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

app.use((req, res) => res.status(404).json({ ok: false, error: "NOT_FOUND", path: req.path }));

app.use((err, _req, res, _next) => {
  const status = Number(err.status || 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    ok: false,
    error: status === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
    message: status === 400 ? err.message : "Something went wrong while processing the request."
  });
});

app.listen(PORT, () => console.log(`Jabed Spy Profile API listening on port ${PORT}`));
