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

    await fetch(`${redisUrl}/set/interview:${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, time: new Date().toLocaleString('zh-CN'), conversation, summary })
    });

    await fetch(`${redisUrl}/lpush/interview:list`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([id])
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
