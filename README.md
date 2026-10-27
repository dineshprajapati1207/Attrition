# Attrition + TA Funnel – live dashboard

`public/index.html` is the dashboard. `server.js` signs in to Google with a service
account, reads both Google Sheets (every visible tab), and serves them to the page.
The page re-syncs every 2 minutes; the server caches each sheet for 60 seconds.

| Sheet | ID |
|---|---|
| Attrition (employee master) | `1jT8Lo0SAdCnkhbg6oeqi-bVOIhEAIO1wrt2P1nakhwI` |
| TA Funnel (one tab per recruiter) | `1JELHBP1rJym7rxwgDGLzN45GzgULmrHZ15JhijXWtu8` |

## Run locally

1. Copy the service-account key JSON into this folder as `service-account.json`
   (both sheets must be shared with its `client_email` as Viewer).
2. In the Google Cloud project of that service account, enable the **Google Sheets API**.
3. `npm start` and open http://localhost:3000

## Settings (environment variables)

| Variable | Default |
|---|---|
| `PORT` / `HOST` | `3000` / `127.0.0.1` (use `0.0.0.0` when deploying) |
| `GOOGLE_APPLICATION_CREDENTIALS` | `./service-account.json` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | the key's JSON as a string (handy on hosting platforms) |
| `ATTRITION_SHEET_ID`, `TA_SHEET_ID` | the IDs above |
| `CACHE_SECONDS` | `60` |

Check the connection: http://localhost:3000/api/sheet/attrition and /api/sheet/ta
