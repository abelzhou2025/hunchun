export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Proxy all /api/* requests to the Worker to avoid workers.dev blocks on mobile
  const upstreamUrl = new URL(`https://hunchun-api.abelzhou3399.workers.dev${url.pathname}${url.search}`);

  const headers = new Headers(request.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.arrayBuffer(),
  };

  const upstreamResponse = await fetch(upstreamUrl.toString(), init);
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: upstreamResponse.headers,
  });
};
