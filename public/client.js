function generateTid() {
  return Math.random().toString(36).substring(2, 15);
}

function buildMsrpPacket(method, toPath, fromPath, headers = {}, body = '') {
  const tid = generateTid();
  let packet = `MSRP ${tid} ${method}\r\n`;
  packet += `To-Path: ${toPath}\r\n`;
  packet += `From-Path: ${fromPath}\r\n`;
  
  if (body) {
      const byteRange = `1-${body.length}/${body.length}`;
      headers['Byte-Range'] = byteRange;
  }

  for (const [key, value] of Object.entries(headers)) {
      packet += `${key}: ${value}\r\n`;
  }

  packet += `-------${tid}$\r\n`;
  if (body) {
      packet += `${body}\r\n`;
  }

  return packet;
}

function calculateDigestResponse(username, password, realm, nonce, uri, cnonce, nc, qop) {
  const ha1 = CryptoJS.MD5(`${username}:${realm}:${password}`).toString();
  const ha2 = CryptoJS.MD5(`AUTH:${uri}`).toString();
  return CryptoJS.MD5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).toString();
}

let ws;
let nonce;

function connect() {
  ws = new WebSocket('ws://localhost:8080');

  ws.onopen = () => {
      console.log('Connected to server');
      sendAuth();
  };

  ws.onmessage = (event) => {
      console.log('Received:', event.data);
      const msg = parseMsrpMessage(event.data);

      if (msg.status === '401') {
          nonce = msg.headers['www-authenticate'].split('nonce="')[1].split('"')[0];
          console.log('Received 401 Unauthorized, sending authorization...');
          sendAuthWithCredentials();
      } else if (msg.status === '200') {
          console.log('Authentication successful');
      } else {
          console.log('Unexpected status:', msg.status);
      }
  };

  ws.onclose = () => {
      console.log('Disconnected from server');
  };
}

function sendAuth() {
  const tid = generateTid();
  const authMessage = buildMsrpPacket('AUTH', 'msrp://example.com:3456;tcp', 'msrp://localhost:8080/jWzNLkrL5G;tcp');
  console.log('Sending AUTH request:', authMessage);
  ws.send(authMessage);
}

function sendAuthWithCredentials() {
  const username = 'user';
  const password = 'pass';
  const realm = 'example.com';
  const uri = 'msrp://example.com:3456;tcp';
  const nc = '00000001';
  const cnonce = generateTid();
  const response = calculateDigestResponse(username, password, realm, nonce, uri, cnonce, nc, 'auth');

  const headers = {
      Authorization: `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}", qop=auth, nc=${nc}, cnonce="${cnonce}"`
  };

  const tid = generateTid();
  const authMessage = buildMsrpPacket('AUTH', 'msrp://example.com:3456;tcp', 'msrp://localhost:8080/jWzNLkrL5G;tcp', headers);
  console.log('Sending AUTH request with credentials:', authMessage);
  ws.send(authMessage);
}

function parseMsrpMessage(rawMessage) {
  const lines = rawMessage.split('\r\n');
  const [method, tid, status] = lines[0].split(' ');

  const headers = {};
  for (let i = 1; i < lines.length; i++) {
      const [key, value] = lines[i].split(': ');
      if (key) {
          headers[key.toLowerCase()] = value;
      }
  }

  return { method, tid, status, headers };
}

// Expose functions to global scope
window.connect = connect;
