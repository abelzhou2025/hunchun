/**
 * 最简单的 Worker - 用于测试基本功能
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 最简单的健康检查
    if (url.pathname === '/health') {
      return new Response('OK', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 根路径
    if (url.pathname === '/') {
      return new Response(JSON.stringify({ status: 'ok', message: 'Worker is running' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};
