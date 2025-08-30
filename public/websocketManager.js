const crypto = require('crypto');

const WEBSOCKET_FRAME_FLAG_MASK = 0x80;
const WEBSOCKET_MAX_HEADER_LENGTH = 14;

const WEBSOCKET_OPCODE = {
    CONTINUE: 0x00,
    DATA_TEXT: 0x01,
    DATA_BINARY: 0x02,
    CLOSE: 0x08,
    PING: 0x09,
    PONG: 0x0A,
};

class WebSocketMessage {
    constructor(opcode, fin = true, mask = true, payload = Buffer.alloc(0)) {
        this.fin = fin;
        this.opcode = opcode;
        this.mask = mask;
        this.payload = payload;
        this.maskingKey = this.mask ? crypto.randomBytes(4) : null;
        this.payloadLength = 0;
        this.headerLen = 0;
    }

    static parse(buffer) {
        if (buffer.length < 2) {
            throw new Error('Insufficient data to parse WebSocket message');
        }

        const message = new WebSocketMessage();
        const firstByte = buffer[0];
        const secondByte = buffer[1];

        message.fin = (firstByte & 0x80) !== 0;
        message.opcode = firstByte & 0x0f;

        message.mask = (secondByte & 0x80) !== 0;
        let payloadLength = secondByte & 0x7f;

        let offset = 2;
        if (payloadLength === 126) {
            if (buffer.length < 4) {
                throw new Error('Insufficient data to parse WebSocket header');
            }
            payloadLength = buffer.readUInt16BE(2);
            offset = 4;
        } else if (payloadLength === 127) {
            if (buffer.length < 10) {
                throw new Error('Insufficient data to parse WebSocket header');
            }
            payloadLength = buffer.readUInt32BE(6);
            offset = 10;
        }

        message.payloadLength = payloadLength;
        message.headerLen = offset;

        if (message.mask) {
            if (buffer.length < offset + 4) {
                throw new Error('Insufficient data to parse masking key');
            }
            message.maskingKey = buffer.slice(offset, offset + 4);
            offset += 4;
        }

        message.payload = buffer.slice(offset, offset + payloadLength);

        if (message.mask && message.maskingKey) {
            for (let i = 0; i < message.payload.length; i++) {
                message.payload[i] ^= message.maskingKey[i % 4];
            }
        }

        const payloadString = message.payload.toString('utf8');

        return payloadString;
    }


    build() {
        const payloadLength = this.payload.length;
        let headerLength = 2;
        let extendedPayloadLength = null;

        if (payloadLength >= 126 && payloadLength < 65536) {
            headerLength += 2;
            extendedPayloadLength = Buffer.alloc(2);
            extendedPayloadLength.writeUInt16BE(payloadLength);
        } else if (payloadLength >= 65536) {
            headerLength += 8;
            extendedPayloadLength = Buffer.alloc(8);
            extendedPayloadLength.writeBigUInt64BE(BigInt(payloadLength));
        }

        if (this.mask) headerLength += 4;

        const frame = Buffer.alloc(headerLength + payloadLength);
        let offset = 0;

        frame[offset++] = (this.fin ? 0x80 : 0x00) | this.opcode;
        frame[offset] = this.mask ? 0x80 : 0x00;

        if (extendedPayloadLength) {
            frame[offset++] |= extendedPayloadLength.length === 2 ? 126 : 127;
            extendedPayloadLength.copy(frame, offset);
            offset += extendedPayloadLength.length;
        } else {
            frame[offset++] |= payloadLength;
        }

        if (this.mask) {
            this.maskingKey.copy(frame, offset);
            offset += 4;

            for (let i = 0; i < payloadLength; i++) {
                frame[offset + i] = this.payload[i] ^ this.maskingKey[i % 4];
            }
        } else {
            this.payload.copy(frame, offset);
        }

        return frame;
    }
}

module.exports ={ WebSocketMessage,WEBSOCKET_OPCODE} ; 

