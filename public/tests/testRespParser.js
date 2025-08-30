

const fs = require('fs');
const path = require('path');
const { ControlMessageParser } = require('../cmsgParser');


const agentAgentMessage = `MSRP HAy2gCf4KO SEND
To-Path: msrp://127.0.0.1:9916/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/adn1p2zrBQ2QMZIW;tcp
Message-ID: iOcIGOtbay
Byte-Range: 1-122/122
Content-Type: application/rechat.cntl+json

{
    "id":"p7iWJN5P",
    "type":"response",
    "response-to":"request",
    "detail":"agent-to-agent",
    "result-code":200,
    "result-text":"OK"
}
-------HAy2gCf4KO$`;

const agentListMessage = `MSRP 3MTeKUET14 SEND
To-Path: msrp://127.0.0.1:9916/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/adn1p2zrBQ2QMZIW;tcp
Message-ID: g1pNxHPyP2
Byte-Range: 1-910/910
Content-Type: application/rechat.cntl+json

{"id":"jBDoPKF7",
"type":"response",
"response-to":"request",
"detail":"agent-list",
"result-code":200,
"result-text":"OK",
"parameters":{
    "agent-list":[
        {"agent-name":"adile@comtechmax.com","agent-status":"agent-logout"},
        {"agent-name":"yilmaz@comtechmax.com","agent-status":"agent-logout"},
        {"agent-name":"fatos@comtechmax.com","agent-status":"agent-logout"},
        {"agent-name":"agent2","agent-status":"agent-logout"},
        {"agent-name":"agent3","agent-status":"agent-logout"},
        {"agent-name":"agent1","agent-status":"agent-logout"},
        {"agent-name":"saharAgent","agent-status":"agent-logout"},
        {"agent-name":"nazhinAgent","agent-status":"agent-logout"},
        {"agent-name":"agent4","agent-status":"agent-logout"},
        {"agent-name":"agent5","agent-status":"agent-logout"},
        {"agent-name":"FarahAgent","agent-status":"agent-logout"},
        {"agent-name":"AhmadAgent","agent-status":"agent-logout"},
        {"agent-name":"Ege","agent-status":"agent-available"}
    ]
}
}
-------3MTeKUET14$`;


const inviteMemMessage = `MSRP QxujAY4DVt SEND
To-Path: msrp://0.0.0.0:3456/bVZwcLbkXJ0hJ8KK;tcp
From-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
Message-ID: OqJXxoyR
Byte-Range: 1-208/208
Content-Type: application/rechat.cntl+json

{
    "id": "ffwewcw",
    "type": "response",
    "response-to": "request",
    "detail": "invite-member",
    "result-code": 200,
    "result-text": "OK",
    "parameters": {
        "member": "Ege"
    }
}
-------QxujAY4DVt$ 
`;

const leaveChatMessage = `MSRP VidXaayic0 SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/bVZwcLbkXJ0hJ8KK;tcp
Message-ID: 2E1iVY7FJF
Byte-Range: 1-118/118
Content-Type: application/rechat.cntl+json

{
    "id":"TkxFBfN1",
    "type":"response",
    "response-to":"request",
    "detail":"leave-chat",
    "result-code":200,
    "result-text":"OK"
}
-------VidXaayic0$`;

const deleteChatMessage = `MSRP hxzhP33lPR SEND
To-Path: msrp://127.0.0.1:9916/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/adn1p2zrBQ2QMZIW;tcp
Message-ID: YmxRwktzju
Byte-Range: 1-140/140
Content-Type: application/rechat.cntl+json

{
    "id":"QKlqqSTI",
    "type":"response",
    "response-to":"request",
    "detail":"delete-chat",
    "result-code":200,
    "result-text":"Chat Deletion Succesful"
}
-------hxzhP33lPR$
`;

const cancelMessage = `MSRP HJYgI8Kvv6 SEND
To-Path: msrp://0.0.0.0:3456/JVBAgFbUMJ92AKF9;tcp
From-Path: msrp://127.0.0.1:9916/jWzNLkrL5G;tcp
Message-ID: Af8pBektPB
Byte-Range: 1-159/159
Content-Type: application/rechat.cntl+json

{
    "id": "QpQ48IH9",
    "type": "response",
    "response-to": "request",
    "detail": "cancel-ongoing",
    "result-code": 200,
    "result-text": "OK"
}
-------HJYgI8Kvv6$ 
`;

const editmsgMessage = `MSRP AYF94sJdCr SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/gufa0A6qfulxwhpT;tcp
Message-ID: ceTuuEDDVv
Byte-Range: 1-122/122
Content-Type: application/rechat.cntl+json

{
    "id":"eCXzgs5J",
    "type":"response",
    "response-to":"request",
    "detail":"edit-message",
    "result-code":200,
    "result-text":"Sent"
}
-------AYF94sJdCr$`;

const startGrpMessage = `MSRP XcsIPbgGjx SEND
To-Path: msrp://127.0.0.1:9916/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/JVBAgFbUMJ92AKF9;tcp
Message-ID: pmZfngHigj
Byte-Range: 1-171/171
Content-Type: application/rechat.cntl+json

{
    "id":"tZihgNk2",
    "type":"response",
    "response-to":"request",
    "detail":"start-groupchat",
    "result-code":302,
    "result-text":"OK",
    "parameters":
    {
        "groupchat-id":"Ege's Groupchat"
    }
}
-------XcsIPbgGjx$`;


const chatListMessage = `MSRP 1MmzRMEaE4 SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/gufa0A6qfulxwhpT;tcp
Message-ID: 50wL7ygQha
Byte-Range: 1-189/189
Content-Type: application/rechat.cntl+json

{
    "id":"wFEL44fj",
    "type":"response",
    "response-to":"request",
    "detail":"chat-list",
    "result-code":200,
    "result-text":"OK",
    "parameters":
    {
        "chat-list":["Ege's Groupchat"],
        "chat-type":"group-chat"
    }
}
-------1MmzRMEaE4$
`;


const joinChatMessage = `MSRP KXTD4f2jbA SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/gufa0A6qfulxwhpT;tcp
Message-ID: NQMGMhroCJ
Byte-Range: 1-117/117
Content-Type: application/rechat.cntl+json

{
    "id":"2wUCc41s",
    "type":"response",
    "response-to":"request",
    "detail":"join-chat",
    "result-code":200,
    "result-text":"OK"
}
-------KXTD4f2jbA$
`;

const historyMessage = `MSRP 9qRbehS4Rr SEND
To-Path: msrp://0.0.0.0:3456/gb5ZJxRaj068iuLm;tcp
From-Path: msrp://127.0.0.1:9814/pO83MARCtG;tcp
Message-ID: qhrPRgTmHn
Byte-Range: 1-548/548
Content-Type: application/rechat.cntl+json

    {
        "id":"7Z8y2Wgr",
        "type":"response",
        "response-to":"request",
        "detail":"message-history",
        "result-code":200,
        "result-text":"OK",
        "parameters":
        {
            "to-name":"merve",
            "from-name":"Ege",
            "start-time":1724066652,
            "end-time":1724066674}
        }


-------z7uF53R4RP$
`;

const fileTransMessage = `MSRP Ba1jObqoBs SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/vhbRBcWiRN4NtHFT;tcp
Message-ID: TzerlGjOnO
Byte-Range: 1-437/437
Content-Type: application/rechat.cntl+json

{
    "id":"EY3EblaB",
    "type":"response",
    "response-to":"request",
    "detail":"file-transfer",
    "result-code":200,
    "result-text":"OK",
    "parameters":
    {
        "direction":"recv",
        "from-name":"nafise",
        "target-name":"Ege",
        "file-name":"ticket-2.pdf",
        "file-type":"application/pdf",
        "file-size":38503,
        "file-hash":"sha-1:0C:02:45:F4:72:C5:C5:5F:97:BB:44:F3:9E:90:55:BB:3D:9A:7E:E1",
        "file-disposition":"attachment",
        "file-transfer-id":"O8uItQTqd1aBfMZ7wVjPjSvQ5K4DrYsj"
    }
}
-------Ba1jObqoBs$ 
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
    agentListMessage,
    inviteMemMessage,
    leaveChatMessage,
    deleteChatMessage,
    cancelMessage,
    editmsgMessage,
    startGrpMessage,
    joinChatMessage,
    chatListMessage,
    historyMessage,
    fileTransMessage
];

parseMsrpMessages(msrpMessages);
