const WebSocket = require('ws');
const crypto = require('crypto');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', message => {
    console.log('Received:', message.toString());
    const msg = parseMsrpMessage(message.toString());

    if (msg.method === 'AUTH') {
      if (msg.headers['authorization']) {
        console.log('Authorization header found, processing authorization...');
        // Simulate successful authentication
        ws.send(`MSRP ${msg.tid} 200 OK\r\nTo-Path: ${msg.headers['from-path']}\r\nFrom-Path: ${msg.headers['to-path']}\r\nUse-Path: msrp://0.0.0.0:3456/X9ag1ci1BJ9dHJvK;tcp\r\nAuthentication-Info: rspauth="${generateRspAuth(msg)}"\r\nExpires: 900\r\n-------${msg.tid}$`);
      } else {
        console.log('No authorization header found, sending 401 Unauthorized...');
        // Respond with 401 Unauthorized and WWW-Authenticate header
        ws.send(`MSRP ${msg.tid} 401 Unauthorized\r\nTo-Path: ${msg.headers['from-path']}\r\nFrom-Path: ${msg.headers['to-path']}\r\nWWW-Authenticate: Digest realm="example.com", qop="auth", nonce="${generateNonce()}"\r\n-------${msg.tid}$`);
      }
    } else {
      console.log('Unexpected method:', msg.method);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

function generateRspAuth(msg) {
  // Simplified rspauth generation for demonstration
  return crypto.createHash('md5').update('dummy').digest('hex');
}

function parseMsrpMessage(rawMessage) {
  const lines = rawMessage.split('\r\n');
  const [method, tid] = lines[0].split(' ');

  const headers = {};
  for (let i = 1; i < lines.length; i++) {
    const [key, value] = lines[i].split(': ');
    if (key) {
      headers[key.toLowerCase()] = value;
    }
  }

  return { method, tid, headers };
}

console.log('WebSocket server is running on ws://localhost:8080');
