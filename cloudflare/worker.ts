import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  DEEPSEEK_API_KEY: string;
  NANO_BANANA_API_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS 中间件
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Cloudflare Workers API 运行正常' });
});

/**
 * 生成对联文本 (DeepSeek API)
 * POST /api/generate-couplet-text
 * Body: { recipient: string, theme: string }
 */
app.post('/api/generate-couplet-text', async (c) => {
  try {
    const { recipient, theme } = await c.req.json();

    if (!recipient || !theme) {
      return c.json({ error: '缺少必要参数: recipient, theme' }, 400);
    }

    const couplet = await generateCoupletText(c.env, recipient, theme);
    return c.json(couplet);
  } catch (error) {
    console.error('生成对联文本失败:', error);
    return c.json({
      error: error.message || '生成对联文本失败',
      status: 'error'
    }, 500);
  }
});

/**
 * 生成手持对联自拍
 * POST /api/generate-selfie
 * Body: { imageUrl: string, couplet: { upper, lower, horizontal } }
 */
app.post('/api/generate-selfie', async (c) => {
  try {
    const { imageUrl, couplet } = await c.req.json();

    if (!imageUrl || !couplet) {
      return c.json({ error: '缺少必要参数: imageUrl, couplet' }, 400);
    }

    // 直接生成手持对联自拍
    const resultImageUrl = await generateSelfieWithCouplet(c.env, imageUrl, couplet);

    return c.json({
      couplet,
      originalImageUrl: imageUrl,
      resultImageUrl,
      status: 'completed',
    });
  } catch (error) {
    console.error('生成自拍失败:', error);
    return c.json({
      error: error.message || '生成自拍失败',
      status: 'error'
    }, 500);
  }
});

/**
 * 生成对联文本 (DeepSeek API)
 */
async function generateCoupletText(env: Env, recipient: string, theme: string) {
  const randomSeed = Math.floor(Math.random() * 1000000);
  const variations = [
    '每次请尝试不同的表达方式和词汇',
    '请使用不同的修辞手法和典故',
    '请换一个角度来诠释这个主题',
    '请创作具有新意的对联'
  ];
  const randomVariation = variations[Math.floor(Math.random() * variations.length)];

  const prompt = `请为${recipient}生成一副以"${theme}"为主题的中国新年对联。
返回JSON格式，包含三个字段：'upper'（上联）、'lower'（下联）和 'horizontal'（横批）。
确保内容喜庆、文化得体、简洁（每联建议7-9个字）。
${randomVariation}。避免使用常见的陈词滥调。
只输出JSON，不要额外文字。[参考ID: ${randomSeed}]`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一位中国文化和诗词专家，专门创作春节对联。你的任务是根据赠送对象和主题生成传统中国对联。对联需要严格遵循对仗和平仄规律。输出必须是有效的JSON格式。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 1.0,
      top_p: 0.9,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 错误: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('DeepSeek API 未返回内容');
  }

  // 提取 JSON（如果包含 markdown 代码块）
  if (content.includes('```json')) {
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      content = match[1];
    }
  } else if (content.includes('```')) {
    const match = content.match(/```\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      content = match[1];
    }
  }

  const parsed = JSON.parse(content);

  if (!parsed.upper || !parsed.lower || !parsed.horizontal) {
    throw new Error('DeepSeek API 返回格式无效');
  }

  return parsed;
}

/**
 * 生成手持对联自拍 (Nano Banana Img2Img)
 */
async function generateSelfieWithCouplet(env: Env, sourceImageUrl: string, couplet: any) {
  const sceneVariations = [
    // 手持姿势变体
    "holding TWO red couplet papers, one in each hand, arms extended forward at chest level, naturally displaying the couplet for a photo",
    "holding TWO red couplet papers, one in each hand, at chest level with a proud and happy expression",
    "holding TWO red couplet papers in both hands, selfie-style, slightly angled to show both papers clearly",
    "holding TWO red couplet papers, one in each hand, arms slightly bent at the elbows, papers visible at waist level",
    "holding TWO red couplet papers, one in each hand, diagonally positioned to create a dynamic composition",
    "holding TWO red couplet papers, one in each hand, with one arm extended and the other bent for natural pose",

    // 墙贴场景
    "TWO red couplet papers PASTED on a wall, the person is standing beside them with one hand pointing at the couplet, happy and proud expression",
    "TWO red couplet papers PASTED on a wall, the person is standing beside them with both arms open in celebration",
    "TWO red couplet papers PASTED on a traditional red door, the person is standing in front of the door",

    // 植物挂架场景
    "TWO red couplet papers HANGING on a decorative plant stand with lucky bamboo, the person is standing beside it with one hand gesturing",
    "TWO red couplet papers placed in a decorative couplet stand on a table, the person is holding the stand with both hands",

    // 混合创意场景
    "holding ONE red couplet paper in one hand, with the other paper PASTED on a visible wall in the background",
    "holding ONE red couplet paper in one hand, with the other paper in a decorative stand on a nearby table"
  ];

  const randomScene = sceneVariations[Math.floor(Math.random() * sceneVariations.length)];
  const randomSeed = Math.floor(Math.random() * 1000000);

  const coupletText = `${couplet.upper} ${couplet.lower}`;

  const prompt = `A photo of the person ${randomScene}.

CRITICAL - FACE PRESERVATION RULES:
- DO NOT MODIFY the person's face AT ALL
- DO NOT CHANGE facial expression, features, or appearance
- MAINTAIN the exact identity and likeness of the person
- DO NOT make the person look different from the source image
- PRESERVE age, ethnicity, gender, and unique facial characteristics

BACKGROUND ENHANCEMENT:
- Replace the background with a festive Chinese New Year atmosphere
- Add traditional Chinese New Year decorations: red lanterns, golden ornaments
- Ensure the background complements the festive mood
- Keep focus on the person and couplet papers

COUPLET PAPERS:
- Left paper (上联): "${couplet.upper}"
- Right paper (下联): "${couplet.lower}"
- Two red papers with gold speckles texture
- Chinese characters in elegant golden calligraphy
- Papers should look realistic and properly positioned
- Vertical text orientation on each paper

QUALITY:
- 4K ultra high definition
- Professional photography quality
- Cinematic lighting
- Sharp focus on person and couplet
- Natural skin texture preservation
- Festive and celebratory atmosphere

Random seed: ${randomSeed}`;

  console.log('调用 Nano Banana Img2Img...');
  console.log('Prompt length:', prompt.length);

  // 调用 Nano Banana API
  const response = await fetch('http://zx2.52youxi.cc:3000/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.NANO_BANANA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gemini-3-pro-image-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: sourceImageUrl } }
          ]
        }
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nano Banana API 错误: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Nano Banana API 响应成功');

  // 提取图片 URL 或 Base64
  if (result.choices && result.choices.length > 0) {
    const message = result.choices[0].message;
    const content = message.content;

    // 提取 Base64 图片
    const base64Match = content.match(/!\[image\]\(data:image\/[^;]+;base64,([^\)]+)\)/);
    if (base64Match && base64Match[1]) {
      const mimeType = content.match(/data:image\/([^;]+)/)?.[1] || 'jpeg';
      return `data:image/${mimeType};base64,${base64Match[1]}`;
    }

    // 提取 HTTP URL
    const urlMatch = content.match(/https?:\/\/[^\s\)]+\.(png|jpg|jpeg|webp|gif)/gi);
    if (urlMatch && urlMatch.length > 0) {
      return urlMatch[0];
    }
  }

  throw new Error('未获取到生成的图片');
}

export default app;
