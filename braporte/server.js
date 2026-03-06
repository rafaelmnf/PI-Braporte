const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
};

function serveStatic(filePath, res) {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - Arquivo não encontrado');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

function readBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch { resolve({}); }
        });
    });
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;
    const method = req.method;

    if (method === 'GET' && (pathname === '/' || pathname === '/login')) {
        return serveStatic(path.join(__dirname, 'views', 'login.html'), res);
    }
    if (method === 'GET' && pathname === '/mapa') {
        return serveStatic(path.join(__dirname, 'views', 'mapa.html'), res);
    }

    // API
    if (method === 'POST' && pathname === '/api/login') {
        const body = await readBody(req);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ sucesso: true, mensagem: 'Login realizado' }));
    }
    if (method === 'POST' && pathname === '/api/reportes') {
        const body = await readBody(req);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ sucesso: true, mensagem: 'Reporte criado' }));
    }
    if (method === 'GET' && pathname === '/api/reportes') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ reportes: [] }));
    }

    const staticPath = path.join(__dirname, 'public', pathname);
    if (method === 'GET' && fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
        return serveStatic(staticPath, res);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Pagina nao encontrada');
});

server.listen(PORT, () => {
    console.log(`\n  🗺️  Braporte rodando em http://localhost:${PORT}\n`);
    console.log(`  Rotas:`);
    console.log(`    GET  /login  → Tela de login`);
    console.log(`    GET  /mapa   → Tela do mapa`);
    console.log(`    POST /api/login`);
    console.log(`    POST /api/reportes`);
    console.log(`    GET  /api/reportes\n`);
});
