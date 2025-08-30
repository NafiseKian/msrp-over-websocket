const fs = require('fs');
const path = require('path');
const { ControlMessageParser } = require('../cmsgParser');


const agentAgentMessage = `MSRP KtWIVrIzrN SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/P1GVZ3xbZ39ZnH9Q;tcp
Message-ID: lWt34DAfgY
Byte-Range: 1-188/188
Content-Type: application/rechat.cntl+json

{
    "id": "cPFrIECt",
    "type": "request",
    "job": "session-close",
    "parameters": {
        "from-name": "nafise",
        "target-name": "Ege",
        "reason": "done"
    }
}
-------KtWIVrIzrN$`;

const sessionTransMessage = `MSRP KtWIVrIzrN SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/P1GVZ3xbZ39ZnH9Q;tcp
Message-ID: lWt34DAfgY
Byte-Range: 1-188/188
Content-Type: application/rechat.cntl+json

{
    "id": "cPFrIECt",
    "type": "request",
    "job": "session-transfer",
    "parameters": {
        "from-name": "agent1",
        "target-name": "agent4",
        "transferee-name": "merve",
        "reason": "tired",
        "history-added": true
    }
 
}
-------KtWIVrIzrN$`;


const clientConMessage = `MSRP VM82iLeQ3Z SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/SrJyNMaSdnWPrBVl;tcp
Message-ID: 7qUOTdZHFc
Byte-Range: 1-131/131
Content-Type: application/rechat.cntl+json

{"id":"xxRecF2",
"type":"request",
"job":"client-connected",
"parameters":
{
    "client-name":
    "merve",
    "keywords":"",
    "seconds-in-queue":16
}
}
-------VM82iLeQ3Z$
`;

const msgToMessage = `MSRP VM82iLeQ3Z SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/SrJyNMaSdnWPrBVl;tcp
Message-ID: 7qUOTdZHFc
Byte-Range: 1-131/131
Content-Type: application/rechat.cntl+json
{
    "id": "WzmGdzzY",
    "type": "request",
    "job": "message-to",
    "parameters": {
        "from-name": "nafise",
        "to-name": "merve",
        "message-to-type": "direct-chat"
    }
}
-------VM82iLeQ3Z$`;

const agentConnMessage = `MSRP rx2i1sCrR3 SEND
To-Path: msrp://127.0.0.1:9814/pO83MARCtG;tcp
From-Path: msrp://0.0.0.0:3456/PPXYO5y9PrpQC1T6;tcp
Message-ID: qiA1neymJ3
Byte-Range: 1-94/94
Content-Type: application/rechat.cntl+json

{
    "id":"Kg4kxFw",
    "type":"request",
    "job":"agent-connected",
    "parameters":
    {
        "agent-name":"nafise"
    }
}
-------rx2i1sCrR3$`;

const clientDicMessage = `MSRP iCWKZ7Wlmq SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/IHOplUYKh6p7Cxb0;tcp
Message-ID: Ntuf3B694b
Byte-Range: 1-115/115
Content-Type: application/rechat.cntl+json

{
    "id":"dNVLzWQ",
    "type":"request",
    "job":"client-disconnected",
    "parameters":
    {
        "client-name":"merve",
        "reason":"tired"
    }
}
-------iCWKZ7Wlmq$`;

const cancelOnMessage = `MSRP Od3rwjSKSg SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/IHOplUYKh6p7Cxb0;tcp
Message-ID: dGSREWVfND
Byte-Range: 1-131/131
Content-Type: application/rechat.cntl+json

{
    "id":"2GoRSpi8",
    "type":"request",
    "job":"cancel-ongoing",
    "parameters":
    {
        "job-to-cancel":"agent-to-agent",
        "response-required":"YES"
    }
}
-------Od3rwjSKSg$`;

const joinChatMessage = `MSRP hmyn3OS1NE SEND
To-Path: msrp://127.0.0.1:9916/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/XvovPOJggKjfkGm1;tcp
Message-ID: cYp90JHDGk
Byte-Range: 1-134/134
Content-Type: application/rechat.cntl+json

{
    "id":"1234567",
    "type":"request",
    "job":"join-chat",
    "parameters":
    {
        "from-name":"nafise",
        "chatroom-id":"erwer",
        "chat-type":"conference"
    }
}
-------hmyn3OS1NE$`;

const inviteMemMessage = `MSRP 3kPDQzVDUX SEND
To-Path: msrp://0.0.0.0:3456/XvovPOJggKjfkGm1;tcp
From-Path: msrp://127.0.0.1:9916/jWzNLkrL5G;tcp
Message-ID: ESKEiKOsgA
Byte-Range: 1-225/225
Content-Type: application/rechat.cntl+json

{
    "id": "J5rYSzGo",
    "type": "request",
    "job": "invite-member",
    "parameters": {
        "to-name": "nafise",
        "from-name": "Ege",
        "chatroom-id": "erwer",
        "chat-type": "conference"
    }
}
-------3kPDQzVDUX$ 
`;

const leaveChatMessage = `MSRP z7uF53R4RP SEND
To-Path: msrp://0.0.0.0:3456/XvovPOJggKjfkGm1;tcp
From-Path: msrp://127.0.0.1:9916/jWzNLkrL5G;tcp
Message-ID: PMUSdeIaT0
Byte-Range: 1-184/184
Content-Type: application/rechat.cntl+json

{
    "id": "OUgtmp7b",
    "type": "request",
    "job": "leave-chat",
    "parameters": {
        "name": "Ege",
        "chat-id": "erwer",
        "chat-type": "conference"
    }
}
-------z7uF53R4RP$
`;


const editMsgMessage = `MSRP z7uF53R4RP SEND
To-Path: msrp://0.0.0.0:3456/XvovPOJggKjfkGm1;tcp
From-Path: msrp://127.0.0.1:9916/jWzNLkrL5G;tcp
Message-ID: PMUSdeIaT0
Byte-Range: 1-184/184
Content-Type: application/rechat.cntl+json

{
    "id": "55JxIHk1",
    "type": "request",
    "job": "edit-message",
    "parameters": {
        "current-message-id": "zoSjiq1Swv",
        "from-name": "Ege",
        "to-name": "nafise",
        "chat-type": "direct-chat"
    }
}
-------z7uF53R4RP$
`;

const fileMsgMessage = `MSRP 9qRbehS4Rr SEND
To-Path: msrp://0.0.0.0:3456/gb5ZJxRaj068iuLm;tcp
From-Path: msrp://127.0.0.1:9814/pO83MARCtG;tcp
Message-ID: qhrPRgTmHn
Byte-Range: 1-548/548
Content-Type: application/rechat.cntl+json

{ 
    "id":"vovIleG4",
    "type":"request",
    "job":"file-transfer",
    "parameters":{
        "direction":"send",
        "from-name":"merve",
        "target-name":"nafise",
        "file-name":"Untitled document.pdf",
        "file-type":"application/pdf",
        "file-size":62473,
        "file-hash":"sha-1:F0:7C:59:A4:A3:A7:5E:D6:57:8B:DF:C5:65:79:AA:1A:76:9E:2F:5A",
        "file-transfer-id":"GK7jcDvm0adRrYLdZ0VMBb5VEkeEwG91",
        "file-disposition":"attachment",
        "file-creation-date":"Thu, 20 Jun 2024 15:32:11 +0000",
        "file-modification-date":"Thu, 20 Jun 2024 15:32:10 +0000",
        "file-read-date":"Mon, 19 Aug 2024 10:17:13 +0000"
    }
}

-------z7uF53R4RP$
`;

/*
** this is a test function to parse cmsgs 
*/
function parseMsrpMessages(msrpMessages) {
    const parser = new ControlMessageParser();
    let totalMessages = msrpMessages.length;
    let successCount = 0;
    let failureCount = 0;

    msrpMessages.forEach((msrpMessage, index) => {
        const contentStart = msrpMessage.indexOf('{');
        const contentEnd = msrpMessage.lastIndexOf('}');
        const jsonString = msrpMessage.slice(contentStart, contentEnd + 1);
        const contentLength = jsonString.length;

        console.log(`Parsing message ${index + 1}/${totalMessages}`);
        console.log('Raw JSON String:', jsonString);

        
        const parsedMessage = parser.parseDataForControlMessage(jsonString, contentLength);

        if (parsedMessage) {
            console.log('Parsed Message ID:', parsedMessage.id);
            console.log('Parsed Message Type:', parsedMessage.type);
            console.log('Parsed Message Data:', JSON.stringify(parsedMessage.cm, null, 2));
            successCount++;
        } else {
            console.error('Failed to parse the MSRP message.');
            failureCount++;
        }
        console.log("_____________________________________________________________\n");
    });

    console.log("Parsing Summary:");
    console.log(`Total Messages: ${totalMessages}`);
    console.log(`Successfully Parsed: ${successCount}`);
    console.log(`Failed to Parse: ${failureCount}`);
}

const msrpMessages = [
    agentAgentMessage,
    sessionTransMessage,
    clientConMessage,
    msgToMessage,
    agentConnMessage,
    clientDicMessage,
    cancelOnMessage,
    joinChatMessage,
    inviteMemMessage,
    leaveChatMessage,
    editMsgMessage,
    fileMsgMessage
];

parseMsrpMessages(msrpMessages);