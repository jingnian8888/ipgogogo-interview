export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { conversation, summary } = req.body;
    const id = Date.now().toString();
    const redisUrl = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    const data = JSON.stringify({ id, time: new Date().toLocaleString('zh-CN'), conversation, summary });

    // 存储数据
    const setRes = await fetch(`${redisUrl}/set/interview:${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
     body: JSON.stringify(data)
    });
    const setData = await setRes.json();

    // 添加到列表
    await fetch(`${redisUrl}/lpush/interview:list`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify([id])
});
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.status(200).json({ success: true, debug: setData });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
