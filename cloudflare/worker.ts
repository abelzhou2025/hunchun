/**
 * 简化版 Worker - 用于测试部署
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 健康检查
    if (path === '/health' || path === '/') {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Worker is running!' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 生成对联文本
    if (path === '/api/generate-couplet-text') {
      if (request.method !== 'POST') {
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const { recipient, theme } = await request.json();

        // 调用 DeepSeek API
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
                content: '你是一位中国文化和诗词专家，专门创作春节对联。返回JSON格式，包含 upper（上联）、lower（下联）和 horizontal（横批）。'
              },
              {
                role: 'user',
                content: `请为${recipient}生成一副以"${theme}"为主题的中国新年对联。返回JSON格式。只输出JSON，不要额外文字。`
              }
            ],
            temperature: 1.0,
            max_tokens: 200,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API 错误: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;

        // 提取 JSON
        if (content.includes('```json')) {
          const match = content.match(/```json\s*([\s\S]*?)\s*```/);
          if (match) content = match[1];
        } else if (content.includes('```')) {
          const match = content.match(/```\s*([\s\S]*?)\s*```/);
          if (match) content = match[1];
        }

        const couplet = JSON.parse(content);

        return new Response(
          JSON.stringify(couplet),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 生成手持对联自拍
    if (path === '/api/generate-selfie') {
      if (request.method !== 'POST') {
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const { imageUrl, couplet } = await request.json();

        const sceneVariations = [
          "holding TWO red couplet papers, one in each hand",
          "TWO red couplet papers PASTED on a wall, standing beside them",
          "holding TWO red couplet papers at chest level",
        ];

        const randomScene = sceneVariations[Math.floor(Math.random() * sceneVariations.length)];

        const prompt = `A photo of the person ${randomScene}.

CRITICAL - DO NOT MODIFY the person's face. Keep exact identity and likeness.
BACKGROUND: Replace with festive Chinese New Year atmosphere, red lanterns, golden ornaments.
COUPLET: Left paper "${couplet.upper}", Right paper "${couplet.lower}". Red papers with gold speckles, golden Chinese calligraphy.
QUALITY: 4K ultra HD, professional photography, cinematic lighting.`;

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
                  { type: 'image_url', image_url: { url: imageUrl } }
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
        const content = result.choices?.[0]?.message?.content;

        // 提取 Base64 图片
        const base64Match = content.match(/!\[image\]\(data:image\/[^;]+;base64,([^\)]+)\)/);
        let resultImageUrl;
        if (base64Match) {
          const mimeType = content.match(/data:image\/([^;]+)/)?.[1] || 'jpeg';
          resultImageUrl = `data:image/${mimeType};base64,${base64Match[1]}`;
        } else {
          throw new Error('未获取到生成的图片');
        }

        return new Response(
          JSON.stringify({ couplet, originalImageUrl: imageUrl, resultImageUrl, status: 'completed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 404
    return new Response(
      JSON.stringify({ error: 'Not found', path }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};
