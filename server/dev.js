const http = require('http');
const { spawn } = require('child_process');
require('dotenv').config({ quiet: true });
const api = require('./groq');

const apiServer = http.createServer((request, response) => {
  const routes = {
    '/api/ai/summarize': api.summarize,
    '/api/ai/translate': api.translate,
    '/api/ai/transcribe': api.transcribe
  };
  const handler = routes[request.url?.split('?')[0]];
  if (!handler) {
    response.statusCode = 404;
    response.end('Not found');
    return;
  }
  handler(request, response);
});

apiServer.listen(5001, () => {
  console.log('Groq API proxy listening on http://localhost:5001');
  const webServer = spawn(
    process.execPath,
    ['node_modules/react-scripts/scripts/start.js'],
    {
      cwd: `${__dirname}/../web`,
      stdio: 'inherit',
      env: { ...process.env, PORT: process.env.WEB_PORT || '3000' }
    }
  );

  const shutdown = () => {
    webServer.kill('SIGTERM');
    apiServer.close();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  webServer.on('exit', (code) => {
    apiServer.close();
    process.exitCode = code || 0;
  });
});
