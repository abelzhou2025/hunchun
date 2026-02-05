/**
 * 珲春春节对联生成器 - Cloudflare Workers API
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

        // 调用 DeepSeek API（国际端点，Cloudflare Workers 可访问）
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
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 150,
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

        const couplet = JSON.parse(content);

        if (!couplet.upper || !couplet.lower || !couplet.horizontal) {
          throw new Error('DeepSeek API 返回格式无效');
        }

        return new Response(
          JSON.stringify(couplet),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('生成对联文本失败:', error);
        return new Response(
          JSON.stringify({ error: error.message || '生成对联文本失败' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 生成对联图片
    if (path === '/api/generate-couplet-image') {
      if (request.method !== 'POST') {
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const { upper, lower, horizontal } = await request.json();

        const prompt = `A traditional Chinese New Year couplet image with high artistic quality.

COUPLET TEXT:
- Upper scroll (right side, 上联): "${upper}"
- Lower scroll (left side, 下联): "${lower}"
- Horizontal scroll (top center, 横批): "${horizontal}"

REQUIREMENTS:
- Traditional red paper texture with gold speckles
- Elegant golden Chinese calligraphy
- Right to left text orientation for vertical scrolls
- Professional photography quality, 4K resolution
- Festive Chinese New Year atmosphere
- Traditional Chinese decorative elements: lanterns, clouds, patterns
- Warm lighting with golden highlights
- Cinematic composition
- Sharp focus on the couplet text
- Random angle variation between 60-90 degrees for dynamic presentation`;

        console.log('Calling Nano Banana API for couplet image...');
        console.log('URL:', 'http://zx2.52youxi.cc:3000/v1/chat/completions');
        console.log('Prompt length:', prompt.length);

        // 使用 Nano Banana 的 /v1/chat/completions 端点（OpenAI 兼容格式）
        const nanoBananaKey = env.NANO_BANANA_API_KEY || 'sk-5VHmN7OWykDPc9MZgCUdCCbcMoBTZjJxvCiVtDh7rpJgSudH';
        console.log('Using API key:', nanoBananaKey.substring(0, 10) + '...');

        const response = await fetch('http://zx2.52youxi.cc:3000/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nanoBananaKey}`,
          },
          body: JSON.stringify({
            model: 'gemini-2.0-flash-exp',  // Try different model
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.8,
          }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Nano Banana API 错误: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Nano Banana API response received');

        const content = result.choices?.[0]?.message?.content;

        // 提取 Base64 图片
        const base64Match = content.match(/!\[image\]\(data:image\/[^;]+;base64,([^\)]+)\)/);
        let resultImageUrl;
        if (base64Match && base64Match[1]) {
          const mimeType = content.match(/data:image\/([^;]+)/)?.[1] || 'jpeg';
          resultImageUrl = `data:image/${mimeType};base64,${base64Match[1]}`;
        } else {
          throw new Error('未获取到生成的图片');
        }

        return new Response(
          JSON.stringify({ imageUrl: resultImageUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('生成对联图片失败:', error);
        return new Response(
          JSON.stringify({ error: error.message || '生成对联图片失败' }),
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

        console.log('Calling Nano Banana API...');
        console.log('URL:', 'http://zx2.52youxi.cc:3000/v1/chat/completions');
        console.log('Prompt length:', prompt.length);

        // 使用 Nano Banana 的 /v1/chat/completions 端点（OpenAI 兼容格式）
        // 图片使用 OpenAI 标准的 image_url 格式
        const nanoBananaKey = env.NANO_BANANA_API_KEY || 'sk-5VHmN7OWykDPc9MZgCUdCCbcMoBTZjJxvCiVtDh7rpJgSudH';
        console.log('Using API key:', nanoBananaKey.substring(0, 10) + '...');

        const response = await fetch('http://zx2.52youxi.cc:3000/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nanoBananaKey}`,
          },
          body: JSON.stringify({
            model: 'gemini-2.0-flash-exp',  // Try different model
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

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Nano Banana API 错误: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Nano Banana API response received for selfie');

        const content = result.choices?.[0]?.message?.content;

        // 提取 Base64 图片
        const base64Match = content.match(/!\[image\]\(data:image\/[^;]+;base64,([^\)]+)\)/);
        let resultImageUrl;
        if (base64Match && base64Match[1]) {
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
        console.error('生成自拍失败:', error);
        return new Response(
          JSON.stringify({ error: error.message || '生成自拍失败' }),
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
