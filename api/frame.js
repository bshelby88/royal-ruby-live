/*
 * Royal Ruby — Farcaster Frame server
 * -----------------------------------
 * Serves a Farcaster Frame that lets Warpcast users mint Ruby Wisdom Drops
 * directly from a cast. One GET returns the meta tags; one POST handles
 * button clicks from the Warpcast client.
 *
 * Routes:
 *   GET  /api/frame?drop=1      → frame HTML for drop #1
 *   POST /api/frame?drop=1      → button click handler (mint / view / next)
 *
 * Frame protocol reference: https://docs.farcaster.xyz/reference/frames/spec
 *
 * Env vars needed:
 *   FRAME_HOST                  e.g. https://royalruby.co
 *   WISDOM_CONTRACT_ADDRESS     0x... (after deploy)
 *
 * Usage in a cast:
 *   Post to Warpcast: "Royal Ruby Wisdom Drop #1 — mint on Base. https://royalruby.co/api/frame?drop=1"
 *   Warpcast will auto-render the frame inline.
 */

export const config = { runtime: 'edge' };

const TOTAL_DROPS = 10;
const HOST = process.env.FRAME_HOST || 'https://royalruby.co';
const CHAIN_ID = 8453; // Base mainnet
const MINT_PRICE_WEI = '2500000000000000'; // 0.0025 ETH

const DROPS = [
  { id: 1,  title: 'Myth #1 — The Soft Pull' },
  { id: 2,  title: 'Before/After — 540 to 680' },
  { id: 3,  title: 'Do Not Close It' },
  { id: 4,  title: 'The 30% Rule Is a Lie' },
  { id: 5,  title: 'To the One Watching at Midnight' },
  { id: 6,  title: "Don't Pay to Delete" },
  { id: 7,  title: 'The 1-in-5 Report' },
  { id: 8,  title: 'Eleven Days to Delete' },
  { id: 9,  title: 'Stewardship Is Spiritual' },
  { id: 10, title: 'Four Documents, One USB' },
];

function frameHtml({ dropId, imageUrl, message }) {
  const drop = DROPS[dropId - 1];
  const title = drop ? drop.title : 'Ruby Wisdom Drop';
  const nextId = dropId < TOTAL_DROPS ? dropId + 1 : 1;
  const prevId = dropId > 1 ? dropId - 1 : TOTAL_DROPS;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title} — Royal Ruby</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:description" content="${message || 'Mint on Base — 0.0025 ETH'}" />

  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1:1" />
  <meta property="fc:frame:post_url" content="${HOST}/api/frame?drop=${dropId}" />

  <meta property="fc:frame:button:1" content="Mint — 0.0025 ETH" />
  <meta property="fc:frame:button:1:action" content="tx" />
  <meta property="fc:frame:button:1:target" content="${HOST}/api/frame-tx?drop=${dropId}" />

  <meta property="fc:frame:button:2" content="← Prev" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:button:2:target" content="${HOST}/api/frame?drop=${prevId}" />

  <meta property="fc:frame:button:3" content="Next →" />
  <meta property="fc:frame:button:3:action" content="post" />
  <meta property="fc:frame:button:3:target" content="${HOST}/api/frame?drop=${nextId}" />

  <meta property="fc:frame:button:4" content="View" />
  <meta property="fc:frame:button:4:action" content="link" />
  <meta property="fc:frame:button:4:target" content="${HOST}/nft" />
</head>
<body>
  <h1>${title}</h1>
  <p>This is a Farcaster Frame for Ruby Wisdom Drop #${dropId}.</p>
  <p><a href="${HOST}/nft">View the collection →</a></p>
</body>
</html>`;
}

export default async function handler(req) {
  const url = new URL(req.url);
  const dropId = Math.max(1, Math.min(TOTAL_DROPS, parseInt(url.searchParams.get('drop') || '1', 10)));
  const imageUrl = `${HOST}/nft/wisdom-drops/art/${dropId}.png`;

  let message = '';
  if (req.method === 'POST') {
    // Button click from Warpcast — could add validation of frame signature here
    // For now we just re-render the selected drop
    try {
      const body = await req.json().catch(() => ({}));
      const fid = body?.untrustedData?.fid;
      if (fid) {
        message = `Hey fid:${fid} — minting Drop #${dropId}`;
      }
    } catch {}
  }

  return new Response(frameHtml({ dropId, imageUrl, message }), {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
