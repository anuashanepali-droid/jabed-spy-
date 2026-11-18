# Jabed Spy Profile API

Node.js + Express API that turns **authorized profile data** into a 1000×720 PNG profile card. Designed for deployment on Render and later use from Goat Bot v2.

## Important privacy note

This API is a card renderer. It does **not** scrape Facebook, bypass login, defeat privacy settings, or retrieve private profile information. The calling bot/client must provide information it is permitted to access (for example, Messenger user information returned by the bot platform). Only include fields the user has made available to the bot.

## Included

- `GET /health` — service health
- `GET /api` — endpoint guide
- `GET /api/templates` — six available designs
- `POST /api/profile/render` — render a PNG
- `GET /api/profile/:uid` — read a recently rendered profile from temporary in-memory cache

Templates: `neon`, `royal`, `midnight`, `ocean`, `crimson`, `emerald`.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000/health`.

## Render deployment

1. Create a Render **Web Service** connected to this GitHub repository.
2. Runtime: Node.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variable `NODE_VERSION` = `20` (if Render asks for it).
6. Add `API_KEY` with a long random secret. Keep it in Render Environment only; never commit it to GitHub.
7. Deploy, then test `/health` and `/api/templates`.

## Render a card

```bash
curl -X POST "https://YOUR-SERVICE.onrender.com/api/profile/render" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "template": "neon",
    "profile": {
      "uid": "10001",
      "name": "Example User",
      "username": "example",
      "gender": "unknown",
      "location": "Bangladesh",
      "relationship": "Not provided",
      "birthday": "Not provided",
      "followers": "—",
      "verified": false
    }
  }' \
  --output profile.png
```

The response is a PNG image. Do not share your API key in screenshots or public messages.

## Profile fields

Required: `profile.uid`, `profile.name`.

Optional: `username`, `gender` (`male`, `female`, `other`, `unknown`), `bio`, `birthday`, `relationship`, `location`, `followers`, `friends`, `verified`, `source`.

Missing values are shown as `Not provided` or `—`; the API does not invent profile facts.

## Notes

- The in-memory cache is temporary and is cleared when the service restarts or the instance sleeps.
- API key authentication is enforced when `API_KEY` is set.
- Rate limiting and JSON body size limits are enabled.
- The current artwork is a built-in full-body anime-inspired silhouette, not a user portrait. Replace it with licensed/authorized artwork when the final reference assets are added.
