export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const redisUrl = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    const listRes = await fetch(`${redisUrl}/lrange/interview:list/0/-1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();
    let ids = listData.result || [];

    // 有些 id 本身是 JSON 字符串如 '["123"]'，需要展开
    ids = ids.flatMap(id => {
      try { const p = JSON.parse(id); return Array.isArray(p) ? p : [id]; }
      catch { return [id]; }
    });

    if (ids.length === 0) return res.status(200).json([]);

    const items = await Promise.all(ids.map(async id => {
      try {
        const r = await fetch(`${redisUrl}/get/interview:${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = await r.json();
        if (!d.result) return null;

        // 剥掉所有层的包装，直到拿到对象
        let raw = d.result;
        while (typeof raw === 'string') {
          try { raw = JSON.parse(raw); } catch { break; }
        }
        if (Array.isArray(raw)) raw = raw[0];
        while (typeof raw === 'string') {
          try { raw = JSON.parse(raw); } catch { break; }
        }

        return raw;
      } catch { return null; }
    }));

    return res.status(200).json(items.filter(Boolean));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
