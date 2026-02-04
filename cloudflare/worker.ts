import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { contextStorage } from 'hono/context-storage';

type Env = {
  DEEPSEEK_API_KEY: string;
  NANO_BANANA_API_KEY: string;
  R2_BUCKET: R2Bucket;
  TASK_STATUS?: KVNamespace;
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
 * 生成 R2 预签名上传 URL
 * GET /api/upload-url?filename=photo.jpg
 */
app.get('/api/upload-url', async (c) => {
  const filename = c.req.query('filename');
  if (!filename) {
    return c.json({ error: '缺少 filename 参数' }, 400);
  }

  // 生成唯一文件名
  const key = `uploads/${Date.now()}-${filename}`;

  // R2 预签名 URL (有效期 1 小时)
  const url = await c.env.R2_BUCKET.signUrl(
    new Request(`https://dummy.com/${key}`),
    3600,
    { method: 'PUT' }
  );

  return c.json({
    uploadUrl: url.replace('https://dummy.com/', ''),
    key,
  });
});

/**
 * 生成手持对联自拍 (主流程)
 * POST /api/generate-selfie
 * Body: { imageUrl: string, recipient: string, theme: string }
 */
app.post('/api/generate-selfie', async (c) => {
  try {
    const { imageUrl, recipient, theme } = await c.req.json();

    if (!imageUrl || !recipient || !theme) {
      return c.json({ error: '缺少必要参数: imageUrl, recipient, theme' }, 400);
    }

    // 步骤 A: 调用 DeepSeek 生成对联文本
    const couplet = await generateCoupletText(c.env, recipient, theme);

    // 步骤 B: 调用 Nano Banana Img2Img 生成手持对联照片
    const resultImageUrl = await generateSelfieWithCouplet(c.env, imageUrl, couplet);

    // 保存到 R2 并返回公共 URL
    const finalKey = `generated/${Date.now()}-selfie.jpg`;

    // 下载生成的图片并上传到 R2
    const imageResponse = await fetch(resultImageUrl);
    const imageBlob = await imageResponse.blob();
    await c.env.R2_BUCKET.put(finalKey, imageBlob);

    // 返回公共 URL (需要 R2 公有访问配置或使用自定义域名)
    const publicUrl = `https://your-r2-domain.com/${finalKey}`;

    return c.json({
      couplet,
      originalImageUrl: imageUrl,
      resultImageUrl: publicUrl,
      status: 'completed',
    });
  } catch (error) {
    console.error('生成失败:', error);
    return c.json({
      error: error.message || '生成失败',
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
  const coupletText = `${couplet.upper} ${couplet.lower}`;

  const prompt = `A high-quality photo of the person in the source image holding a traditional red Chinese couplet with the text "${coupletText}" written in golden ink. The couplet should look realistic, positioned naturally in the person's hands. Cinematic lighting, festive Chinese New Year atmosphere, professional photography, 4K quality.`;

  console.log('调用 Nano Banana Img2Img...');
  console.log('Source image:', sourceImageUrl);
  console.log('Prompt:', prompt.substring(0, 100) + '...');

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

/**
 * 查询任务状态 (可选，用于异步任务)
 * GET /api/task-status/:id
 */
app.get('/api/task-status/:id', async (c) => {
  const taskId = c.req.param('id');

  if (!c.env.TASK_STATUS) {
    return c.json({ error: 'KV storage 未配置' }, 500);
  }

  const status = await c.env.TASK_STATUS.get(taskId, 'json');

  if (!status) {
    return c.json({ error: '任务不存在' }, 404);
  }

  return c.json(status);
});

export default app;
