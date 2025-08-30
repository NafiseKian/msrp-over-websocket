/*
** file : msrp message parser under java script 
** author : Nafise Kian
** date : August 2024
*/
const { EventEmitter } = require('events');
const { MsrpMessage } = require('./messageBuilder');
const HTTPParser = require('http-parser-js').HTTPParser;

class MessageParser extends EventEmitter 
{
    constructor(endpoint)
    {
        super();
        this.endpoint = endpoint ; 
        console.log("message parser object is created");
    }

    parseHttp(request) 
    {
        const parser = new HTTPParser(HTTPParser.RESPONSE);
        const httpMessage = 
        {
            headers: {},
            body: '',
            statusCode: null,
            statusMessage: null,
            httpVersion: null,
        };

        parser[HTTPParser.kOnHeadersComplete] = (info) => 
        {
            httpMessage.statusCode = info.statusCode;
            httpMessage.statusMessage = info.statusMessage;
            httpMessage.httpVersion = `${info.versionMajor}.${info.versionMinor}`;

            for (let i = 0; i < info.headers.length; i += 2) 
            {
                const key = info.headers[i];
                const value = info.headers[i + 1];
                httpMessage.headers[key] = value;
            }
        };

        parser[HTTPParser.kOnBody] = (body) => {
            httpMessage.body += body;
        };

        parser[HTTPParser.kOnMessageComplete] = () => {
            console.log('Completed HTTP message parsing');
            this.emit('protocolSwitch', httpMessage);
        };

        parser.execute(Buffer.from(request), 0, request.length);
        
        return httpMessage; 
    }

    parseMsrp(rawMessage)
    {
        let respValue = 0;
        let status = 0;

        const lines = rawMessage.split('\r\n');
        const message = new MsrpMessage();
        const firstLineParts = lines[0].split(' ')

        if (firstLineParts.length < 3) {
            throw new Error('Invalid MSRP start line');
        }

        message.transaction = firstLineParts[1];

        const method = firstLineParts[2].trim();
        console.log("message method is " + method);

        const lastLine = lines[lines.length-2].trim();
        console.log("\nlast line is : "+lastLine);
        const contFlag = lastLine.slice(-1);

        if(contFlag == `+`) message.contFlag = 1 ;
        else if (contFlag == '$') message.contFlag = 0 ; 

        for (let i = 1; i < lines.length; i++) 
        {
            const line = lines[i];
            if (line.startsWith('To-Path: ')) {
                message.cmn.toPath = line.substring(9).trim();
            } else if (line.startsWith('From-Path: ')) {
                message.cmn.fromPath = line.substring(11).trim();
            } else if (line.startsWith('Message-ID: ')) {
                message.cmn.messageId = line.substring(12).trim();
            } else if (line.startsWith('Byte-Range: ')) {
                const byteRangeParts = line.substring(12).trim().split(/[-/]/);
                message.byteRangeStart = parseInt(byteRangeParts[0], 10);
                message.byteRangeEnd = parseInt(byteRangeParts[1], 10);
                message.byteRangeTotal = parseInt(byteRangeParts[2], 10);
            } else if (line.startsWith('Content-Type: ')) {
                message.cmn.contentType = line.substring(14).trim();
                console.log("content type is : "+message.cmn.contentType);
            } else if (line === '') {
                const contentLines = lines.slice(i + 1, lines.length - 1);
                message.msgContent = contentLines.join('\r\n').replace(/\r\n-------.*$/, '');

                break;
            }
        }

        switch (method) {
            case 'SEND':
                message.cmn.method = 1; // MSRP_METHOD_SEND
                this.emit('SEND', message);//TODO : change the logic to wait for chunks
                break;
            case 'REPORT':
                message.cmn.method = 2; // MSRP_METHOD_REPORT
                break;
            case '401':
                message.cmn.method = 401; // MSRP_METHOD_UNAUTH
                this.emit('401', rawMessage);
                break;
            case '403' :
                message.cmn.method = 403 ; 
                if(this.endpoint.state == 'AUTH_200')
                {
                    this.emit('403');
                }
            case '200':
                message.cmn.method = 200; // MSRP_METHOD_OK
                if(this.endpoint.state == 'AUTH_200')
                {
                    console.log("response to auth credential has arrived ");
                    this.emit('auth_200', rawMessage);
                }
                else
                {
                    console.log("200 response for a message has arrived ");
                    this.endpoint.removePendingMessage(message.transaction);
                }
                break;
            default:
                respValue = parseInt(firstLineParts[2], 10) || 0;
                if (respValue === 0) 
                {
                    status = 506; // RESPCODE_506
                } else {
                    message.cmn.responseCode = respValue;
                }
                break;
        }

        
    
        if (lines[lines.length - 1].startsWith('-------')) 
        {
            message.contFlag = lines[lines.length - 1].endsWith('$') ? 1 : 0;
        }
    
        
        return message;
    }

    parse(rawMessage) 
    {
        const lines = rawMessage.split('\r\n');
        console.log("packet header is "+lines[0]);

        if (lines[0].startsWith('MSRP')) 
        {
            return this.parseMsrp(rawMessage);
           
        }
        else if(lines[0].startsWith('HTTP'))
        {
            return this.parseHttp(rawMessage);
        }

        
    }
}

module.exports = MessageParser;