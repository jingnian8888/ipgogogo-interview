export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const redisUrl = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  // 读 list
  const listRes = await fetch(`${redisUrl}/lrange/interview:list/0/-1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const listData = await listRes.json();

  // 读第一条原始数据
  let firstRaw = null;
  const ids = listData.result || [];
  if (ids.length > 0) {
    const r = await fetch(`${redisUrl}/get/interview:${ids[0]}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    firstRaw = await r.json();
  }

  res.status(200).json({ listData, firstRaw });
}
