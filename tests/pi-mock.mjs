// Stand-in for Pi's platform API (api.minepi.com) during tests.
import http from "node:http";
const payments = new Map();
const json = (res, code, body) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(body)); };
http.createServer(async (req, res) => {
  let body = ""; for await (const c of req) body += c;
  const url = req.url ?? "";
  if (url === "/v2/me") {
    const m = /^Bearer pi-good-([a-z0-9]+)$/.exec(req.headers.authorization ?? "");
    return m ? json(res, 200, { uid: m[1], username: `pioneer_${m[1]}` }) : json(res, 401, { error: "invalid" });
  }
  if (url === "/__seed" && req.method === "POST") { const p = JSON.parse(body); payments.set(p.identifier, p); return json(res, 200, { ok: true }); }
  const ad = /^\/v2\/ads_network\/status\/([A-Za-z0-9_-]+)$/.exec(url);
  if (ad) {
    if (req.headers.authorization !== "Key test-pi-key") return json(res, 401, { error: "bad key" });
    return json(res, 200, { identifier: ad[1], mediator_ack_status: ad[1].startsWith("ad-good") ? "granted" : "not_granted" });
  }
  const pm = /^\/v2\/payments\/([A-Za-z0-9_-]+)(?:\/(approve|complete|cancel))?$/.exec(url);
  if (pm) {
    if (req.headers.authorization !== "Key test-pi-key") return json(res, 401, { error: "bad key" });
    const p = payments.get(pm[1]); if (!p) return json(res, 404, { error: "not found" });
    p.status ??= {};
    if (pm[2] === "approve") p.status.developer_approved = true;
    if (pm[2] === "complete") { p.status.developer_completed = true; p.transaction = { txid: JSON.parse(body || "{}").txid }; }
    if (pm[2] === "cancel") p.status.cancelled = true;
    return json(res, 200, p);
  }
  json(res, 404, { error: "unknown" });
}).listen(3999, () => console.log("pi mock on 3999"));
