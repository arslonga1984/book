const http = require('http')
const fs = require('fs')
const path = require('path')

const DIST = path.join(__dirname, 'dist2')
const PORT = 8081

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
}

http.createServer((req, res) => {
  const url = req.url.split('?')[0]
  let filePath = path.join(DIST, url === '/' ? 'index.html' : url)

  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST, 'index.html')
  }

  const ext = path.extname(filePath)
  const contentType = MIME[ext] || 'application/octet-stream'

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', contentType)
  fs.createReadStream(filePath).pipe(res)
}).listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}`)
})
