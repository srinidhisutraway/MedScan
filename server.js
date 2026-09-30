const express = require("express");
const path = require("path");
const db = require("./data.json");

const app = express();
const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

app.get("/api/search", (req, res) => {
  const q = norm(req.query.search_query);
  const pincode = String(req.query.pincode || "").trim();

  if (!q) return res.status(400).json({ error: "search_query is required" });
  if (!/^\d{6}$/.test(pincode))
    return res.status(400).json({ error: "pincode must be a 6-digit number" });

  const results = db
    // 1. Pincode filter
    .filter((i) => i.available_pincodes.includes(pincode))
    // 2. Match standalone tests AND packages containing the test
    .filter(
      (i) =>
        norm(i.item_name).includes(q) ||
        i.included_tests.some((t) => norm(t).includes(q))
    )
    // 3. Compute true price (fee only applies if home collection is offered)
    .map((i) => {
      const fee = i.logistics.home_collection ? i.logistics.home_collection_fee : 0;
      return { ...i, total_final_price: i.pricing.offer_price + fee, applied_fee: fee };
    })
    .sort((a, b) => a.total_final_price - b.total_final_price || a.provider_name.localeCompare(b.provider_name));

  res.json({ count: results.length, results });
});

app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
