export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const redisUrl = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    // 获取所有ID
    const listRes = await fetch(`${redisUrl}/lrange/interview:list/0/-1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();
    const ids = listData.result || [];

    if (ids.length === 0) return res.status(200).json([]);

    // 获取每条记录
    const items = await Promise.all(ids.map(async id => {
      const r = await fetch(`${redisUrl}/get/interview:${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      if (!d.result) return null;
      try {
        // result 可能是字符串或已解析的对象
        return typeof d.result === 'string' ? JSON.parse(d.result) : d.result;
      } catch {
        return null;
      }
    }));

    return res.status(200).json(items.filter(Boolean));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
