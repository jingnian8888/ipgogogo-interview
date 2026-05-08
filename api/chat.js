export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { messages, system } = req.body;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: system
          ? [{ role: 'system', content: system }, ...messages]
          : messages,
        max_tokens: 1000,
        temperature: 0.5,
      }),
    });

    const data = await response.json();

    // 转换成 Anthropic 格式（兼容你的前端代码）
    if (data.error) {
  return res.status(503).json({ error: data.error.message || 'API服务繁忙，请稍后重试' });
}
if (data.choices && data.choices[0] && data.choices[0].message) {
  return res.status(200).json({
    content: [{ type: 'text', text: data.choices[0].message.content }]
  });
}
return res.status(500).json({ error: '返回数据异常，请稍后重试' });
    
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
