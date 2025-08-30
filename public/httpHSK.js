const crypto = require('crypto');
const EventEmitter = require('events');

class httpHandShake extends EventEmitter {
    constructor() {
        super();
        this.wsHandshakingData = null;
    }

    performWebSocketUpgrade(host, upprot) {
        if (!this.wsHandshakingData) {
            this.wsHandshakingData = this.createWsHandshakingData();
        }

        const requestLines = [];
        requestLines.push(`GET /chat/ HTTP/1.1`);
        requestLines.push(`Host: ${host}`);
        requestLines.push(`Upgrade: websocket`);
        requestLines.push(`Connection: Upgrade`);

        if (!this.wsHandshakingData.currHandshakeKey) {
            this.wsHandshakingData.currHandshakeKey = Buffer.alloc(24);
            this.wsHandshakingData.keyAllocated = true;
        }

        this.wsHandshakingData.currHandshakeKey.fill(0);

        //TODO : build the key
        this.wsHandshakingData.currHandshakeKey.write('dGhlIHNhbXBsZSBub25jZQ==', 'utf8');
        this.wsHandshakingData.keyLen = 24;

        requestLines.push(`Sec-WebSocket-Key: ${this.wsHandshakingData.currHandshakeKey.toString()}`);
        requestLines.push(`Sec-WebSocket-Protocol: ${upprot}`);
        requestLines.push(`Sec-WebSocket-Version: 13`);
        const requestString = requestLines.join('\r\n') + '\r\n\r\n';

        console.log("hand shake packet is built");
        
        return requestString ; 
    }

    createWsHandshakingData() {
        return {
            currHandshakeKey: null,
            keyAllocated: false,
            keyLen: 0,
            hskTimerHandle: null,
            wsUpgradeSemaphore: null,
            hskResultCode: null
        };
    }
}

module.exports = httpHandShake;
