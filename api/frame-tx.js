/*
 * Royal Ruby — Farcaster Frame transaction endpoint
 * -------------------------------------------------
 * When a Warpcast user clicks the "Mint — 0.0025 ETH" button on a Frame,
 * Warpcast POSTs here expecting a transaction-request response per the
 * Frames spec. We return an ABI-encoded call to RubyWisdomDrops.mint().
 *
 * Env:
 *   WISDOM_CONTRACT_ADDRESS     0x... — the deployed ERC-1155 contract
 */

export const config = { runtime: 'edge' };

const CHAIN_ID = 8453; // Base mainnet
const MINT_PRICE_WEI = '2500000000000000'; // 0.0025 ETH
const TOTAL_DROPS = 10;

// Function selector for mint(uint256,uint256) = first 4 bytes of keccak256("mint(uint256,uint256)")
// Pre-computed: 0x40c10f19 is mint(address,uint256) — WRONG
// For mint(uint256,uint256) the correct selector is:
const MINT_SELECTOR = '0x1b2ef1ca';

function encodeUint(value) {
  return BigInt(value).toString(16).padStart(64, '0');
}

export default async function handler(req) {
  const url = new URL(req.url);
  const dropId = Math.max(1, Math.min(TOTAL_DROPS, parseInt(url.searchParams.get('drop') || '1', 10)));
  const contract = process.env.WISDOM_CONTRACT_ADDRESS;

  if (!contract) {
    return new Response(JSON.stringify({ error: 'contract not deployed yet' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  const data = MINT_SELECTOR + encodeUint(dropId) + encodeUint(1);

  return new Response(
    JSON.stringify({
      chainId: `eip155:${CHAIN_ID}`,
      method: 'eth_sendTransaction',
      params: {
        abi: [
          {
            name: 'mint',
            type: 'function',
            stateMutability: 'payable',
            inputs: [
              { name: 'tokenId', type: 'uint256' },
              { name: 'quantity', type: 'uint256' },
            ],
            outputs: [],
          },
        ],
        to: contract,
        data,
        value: MINT_PRICE_WEI,
      },
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }
  );
}
