/* Royal Ruby — Farcaster preview (commercial actions disabled). */

export const config = { runtime: 'edge' };

const HOST = 'https://royalruby.io';
const TOTAL_DROPS = 10;
const DROPS = [
  'Myth #1 — The Soft Pull',
  'Before/After — 540 to 680',
  'Do Not Close It',
  'The 30% Rule Is a Lie',
  'To the One Watching at Midnight',
  "Don't Pay to Delete",
  'The 1-in-5 Report',
  'Eleven Days to Delete',
  'Stewardship Is Spiritual',
  'Four Documents, One USB',
];

function frameHtml(dropId) {
  const title = DROPS[dropId - 1] || 'Ruby Wisdom Drop';
  const nextId = dropId < TOTAL_DROPS ? dropId + 1 : 1;
  const prevId = dropId > 1 ? dropId - 1 : TOTAL_DROPS;
  const imageUrl = `${HOST}/nft/wisdom-drops/art/${dropId}.png`;
  return `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8" />
  <title>${title} — Coming Soon | Royal Ruby</title>
  <meta property="og:title" content="${title} — Coming Soon" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:description" content="Royal Ruby Wisdom Drops are in development. No contract or purchase is available." />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1:1" />
  <meta property="fc:frame:post_url" content="${HOST}/api/frame?drop=${dropId}" />
  <meta property="fc:frame:button:1" content="← Prev" />
  <meta property="fc:frame:button:1:action" content="post" />
  <meta property="fc:frame:button:1:target" content="${HOST}/api/frame?drop=${prevId}" />
  <meta property="fc:frame:button:2" content="Next →" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:button:2:target" content="${HOST}/api/frame?drop=${nextId}" />
  <meta property="fc:frame:button:3" content="Coming Soon" />
  <meta property="fc:frame:button:3:action" content="link" />
  <meta property="fc:frame:button:3:target" content="${HOST}/nft.html" />
</head><body>
  <h1>${title}</h1>
  <p>Coming Soon — no contract or purchase is currently available.</p>
  <p><a href="${HOST}/nft.html">Status at royalruby.io</a></p>
</body></html>`;
}

export default async function handler(req) {
  const url = new URL(req.url);
  const parsed = Number.parseInt(url.searchParams.get('drop') || '1', 10);
  const dropId = Number.isFinite(parsed) ? Math.max(1, Math.min(TOTAL_DROPS, parsed)) : 1;
  return new Response(frameHtml(dropId), {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
