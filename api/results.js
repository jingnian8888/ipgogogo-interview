export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const redisUrl = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    const listRes = await fetch(`${redisUrl}/lrange/interview:list/0/-1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();
    const ids = listData.result || [];

    if (ids.length === 0) return res.status(200).json([]);

    const items = await Promise.all(ids.map(async id => {
      const r = await fetch(`${redisUrl}/get/interview:${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      if (!d.result) return null;
      try {
        // result 是数组，取第一个元素再解析
        const raw = Array.isArray(d.result) ? d.result[0] : d.result;
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        return null;
      }
    }));

    return res.status(200).json(items.filter(Boolean));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
