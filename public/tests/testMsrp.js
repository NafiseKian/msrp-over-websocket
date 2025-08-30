const  { generateRandomString } = require ('../utilities/generators');
const { NmsrpPacketManager } = require('../messageBuilder');
const { MsrpParser } = require('../messageParser');

function buildMessage(text, type) {
    if (!text.trim()) return;

    const manager = new NmsrpPacketManager();
    const msg = manager.createEmptyMessage();
    manager.setMethod(msg, 'SEND');
    manager.setTransactionId(msg, generateRandomString(8));
    manager.setToPath(msg, "msrp://127.0.0.1:3456;tcp");
    manager.setFromPath(msg, "msrp://127.0.0.1:3316;tcp");
    manager.setMessageId(msg, generateRandomString(8));
    manager.setContentType(msg, type);

    manager.setBody(msg, text);

    manager.calculateBodyLength(msg);
    console.log('Body Length:', msg.bodyLength);

    manager.setByteRanges(msg, 1, msg.bodyLength, msg.bodyLength);
    console.log(manager.messageToString(msg));

    return manager.messageToString(msg);
}



function parseMessage(message) 
{
    console.log('Received:', message);
    const msg = MsrpParser.parse(message);

    if (!msg.cmn) {
        console.log("message cmn is null");
    } else {
        console.log("We parsed the message");
    }

    switch (msg.cmn?.method) {
        case 1:
            console.log("We have a send message with content : "+ msg.msgContent);
            break;
        case 2:
            console.log("We have a report message");
            break;
        case 401:
            console.log("Auth needs to be done");
            break;
        case 200:
            console.log("We have a 200 message");
            break;
        default:
            console.log("We have an unknown message");
            break;
    }
}

const msg = buildMessage("hello I am MSRP client" , "text/plain");
parseMessage(msg);