// public/client.js

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
  const tid = MsrpUtils.generateTid();
  const authMessage = MsrpUtils.buildMsrpPacket('AUTH', 'msrp://example.com:3456;tcp', 'msrp://localhost:8080/jWzNLkrL5G;tcp');
  console.log('Sending AUTH request:', authMessage);
  ws.send(authMessage);
}

function sendAuthWithCredentials() {
  const username = 'user';
  const password = 'pass';
  const realm = 'example.com';
  const uri = 'msrp://example.com:3456;tcp';
  const nc = '00000001';
  const cnonce = MsrpUtils.generateTid();
  const response = MsrpUtils.calculateDigestResponse(username, password, realm, nonce, uri, cnonce, nc, 'auth');

  const headers = {
    Authorization: `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}", qop=auth, nc=${nc}, cnonce="${cnonce}"`
  };

  const tid = MsrpUtils.generateTid();
  const authMessage = MsrpUtils.buildMsrpPacket('AUTH', 'msrp://example.com:3456;tcp', 'msrp://localhost:8080/jWzNLkrL5G;tcp', headers);
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
