import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import frameHandler from '../api/frame.js';
import frameTxHandler from '../api/frame-tx.js';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const port = Number(process.env.PORT || 8080);
const aliases = new Map([['/', '/index.html'], ['/read', '/checklist.html'], ['/nft', '/nft.html']]);
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

async function sendWebResponse(nodeResponse, webResponse) {
  nodeResponse.writeHead(webResponse.status, Object.fromEntries(webResponse.headers));
  nodeResponse.end(Buffer.from(await webResponse.arrayBuffer()));
}

createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (url.pathname === '/api/frame') return sendWebResponse(response, await frameHandler(new Request(url, { method: request.method })));
  if (url.pathname === '/api/frame-tx') return sendWebResponse(response, await frameTxHandler());

  const pathname = aliases.get(url.pathname) || url.pathname;
  const relative = normalize(pathname).replace(/^[/\\]+/, '');
  const target = join(root, relative);
  if (!target.startsWith(root)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  try {
    const body = await readFile(target);
    response.writeHead(200, { 'content-type': contentTypes[extname(target)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Local production probe server: http://127.0.0.1:${port}`));
