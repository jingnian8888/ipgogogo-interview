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
      }),
    });

    const data = await response.json();

    // 转换成 Anthropic 格式（兼容你的前端代码）
    if (data.choices && data.choices[0]) {
      return res.status(200).json({
        content: [{ type: 'text', text: data.choices[0].message.content }]
      });
    } else {
      return res.status(500).json({ error: data.error?.message || '未知错误' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
