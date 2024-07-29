// public/buildMessage.js

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

export { generateTid, buildMsrpPacket, calculateDigestResponse };
