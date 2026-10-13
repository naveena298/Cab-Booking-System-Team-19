const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript'
};

http.createServer((req, res) => {
  let file = req.url === '/' ? 'index.html' : req.url.slice(1);
  let filePath = path.join(__dirname, file);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'text/plain' });
      res.end(content);
    }
  });
}).listen(PORT, () => {
  console.log(`\n🚀 RideGo Running on: http://localhost:${PORT}\n`);
});