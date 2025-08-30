

const fs = require('fs');
const path = require('path');
const { ControlMessageParser } = require('../cmsgParser');


const notifyMessage = `MSRP pwxylWAEti SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/vhbRBcWiRN4NtHFT;tcp
Message-ID: nHL3Wq2iHf
Byte-Range: 1-92/92
Content-Type: application/rechat.cntl+json

{
    "id":"yyv9IHbJ",
    "type":"notify",
    "event":"user-left",
    "source":"Ege",
    "notifier":"conf:connf"
}
-------pwxylWAEti$`;

const seenNotifMessage = `MSRP y5VMx2BdF8 SEND
To-Path: msrp://127.0.0.1:9913/jWzNLkrL5G;tcp
From-Path: msrp://0.0.0.0:3456/vhbRBcWiRN4NtHFT;tcp
Message-ID: 9n82fKx8qm
Byte-Range: 1-198/198
Content-Type: application/rechat.cntl+json

{
    "id":"ATYYYL7U",
    "type":"notify",
    "event":"message-seen",
    "source":"212f5lhwqD",
    "notifier":"Ege",
    "parameters":
    {
        "to-name":"nafise",
        "seen-time":1111,
        "sessionkey":"Ege+nafise",
        "chat-type":"direct-chat"
    }
}
-------y5VMx2BdF8$
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
    notifyMessage,
    seenNotifMessage
];

parseMsrpMessages(msrpMessages);
