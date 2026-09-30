LIVE LINK: https://medscan-uumi.onrender.com/

# Mini Lab Aggregator

Search a lab test by pincode and compare results sorted by the **true lowest price** (`offer_price + home_collection_fee`).

## Run locally
```bash
npm install
npm start          # http://localhost:3000
```
API: `GET /api/search?search_query=Lipid%20Profile&pincode=110001`

## How the logic works (server.js)
1. **Pincode filter** – keeps only items whose `available_pincodes` contains the pincode.
2. **Search catch** – case-insensitive match on `item_name` OR any entry in `included_tests`, so a "Lipid Profile" search also returns packages containing it.
3. **Sorting catch** – `total_final_price = offer_price + home_collection_fee` (fee counted only when `home_collection` is true), sorted ascending, ties broken by provider name.
4. Input validation: empty query or non-6-digit pincode returns HTTP 400 with a readable message.

## Tech choices
Node + Express with a plain HTML/CSS/JS frontend served from the same server: one deployable, no build step, and the JSON file stands in for the DB. Swapping it for Postgres later only touches the filter/query in one place.

## Step 4: Scraping without getting blocked
I'd first look for official or partner APIs and affiliate feeds, and check robots.txt and terms, since a licensed feed beats an arms race. Where scraping is necessary, I'd call the sites' internal JSON endpoints (visible in the network tab) instead of rendering pages, and use headless browsers (Playwright) only when unavoidable. The scraper would run as a distributed queue of workers with rotating residential proxies, realistic headers and per-domain rate limits with jitter, so traffic looks like normal users. Prices are cached and refreshed on a schedule (hot pincodes and popular tests more often) so we make far fewer requests than user searches. Finally I'd add monitoring for block rates and schema changes, with fallbacks to last-known prices marked "updated X hrs ago" when a source fails.

## Deploy
Push to GitHub, create a Render/Railway Web Service: build `npm install`, start `npm start`. The frontend is served by the same app, so nothing else is needed.
