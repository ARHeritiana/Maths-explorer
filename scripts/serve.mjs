import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../dist/", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
  ".zip": "application/zip",
  ".tex": "text/plain; charset=utf-8",
  ".sty": "text/plain; charset=utf-8",
  ".cls": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};
const server = http.createServer(async (req, res) => {
  try {
    let name = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (name.endsWith("/")) name += "index.html";
    const target = path.resolve(root, "." + name);
    if (!target.startsWith(root) || !(await stat(target)).isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const data = await readFile(target);
    res.writeHead(200, {
      "Content-Type": types[path.extname(target)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.listen(Number(process.env.PORT || 4173), "0.0.0.0", () =>
  console.log(`Maths Explorer: http://localhost:${server.address().port}`),
);
