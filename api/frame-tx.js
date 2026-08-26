/* Royal Ruby — disabled Farcaster transaction endpoint. */

export const config = { runtime: 'edge' };

export default async function handler() {
  return new Response(JSON.stringify({ error: 'coming soon' }), {
    status: 503,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}
