/*
** file : msrp message builder under java script 
** author : Nafise Kian
** date : August 2024
*/

class MsrpMessage 
{
    constructor() 
    {
        this.state = 0;
        this.byteRangeStart = 0;
        this.byteRangeEnd = 0;
        this.byteRangeTotal = 0;
        this.contFlag = 0;
        this.bodyLength = 0;
        this.storeInFile = false;
        this.fileToStore = null;
        this.cmn = new MsrpCommons();
        this.transaction = null;
        this.prev = null;
        this.next = null;
        this.headers = {};
        this.msgContent = '';
    }

    setHeader(key, value) {
        this.headers[key] = value;
    }

    getHeader(key) {
        return this.headers[key];
    }

    setState(newState) {
        this.state = newState;
    }

    getState() {
        return this.state;
    }
}

class MsrpCommons 
{
    constructor() 
    {
        this.headers = [];
        this.stack = null;
        this.contentTotalLength = null;
        this.toPath = null;
        this.fromPath = null;
        this.contentType = null;
        this.contentId = null ;
        this.contentDisposition = null ;
        this.messageId = null;
        this.responseText = null;
        this.responseCode = 0;
        this.succReport = 0;
        this.failReport = 0;
        this.method = 0;
    }
}

class NmsrpMessageManager 
{
    static MSG_MANAGER_TABLE_SIZE = 128;

    constructor() 
    {
        this._msgTable = new Map();
    }

    createNewMessage() 
    {
        const handle = this._generateHandle();
        const msg = new MsrpMessage();
        this._msgTable.set(handle, msg);
        return msg;
    }

    getMessage(handle) 
    {
        return this._msgTable.get(handle);
    }

    shutdown() 
    {
        this._msgTable.clear();
    }

    _generateHandle() 
    {
        return Math.floor(Math.random() * NmsrpMessageManager.MSG_MANAGER_TABLE_SIZE);
    }
}

class NmsrpPacketManager 
{
    constructor() 
    {
        this.messageManager = new NmsrpMessageManager();
    }

    createEmptyMessage() 
    {
        const msg = this.messageManager.createNewMessage();
        msg.cmn = new MsrpCommons();
        return msg;
    }

    createMessageWithContent(msgBuffer) 
    {
        const msg = this.createEmptyMessage();
        this.setBody(msg, msgBuffer);
        return msg;
    }

    setBody(msg, msgBuffer) 
    {
        console.log("setting content to msg : "+msgBuffer);
        msg.msgContent = msgBuffer;
        console.log(msg.msgContent);
    }

    duplicateForChunking(base) 
    {
        const msg = this.messageManager.createNewMessage();
        msg.cmn = base.cmn;
        msg.transaction = 'new_id';
        msg.prev = base;
        base.next = msg;
        return msg;
    }

    setTransactionId(msg, transId) 
    {
        msg.transaction = transId;
    }

    setToPath(msg, toPath) 
    {
        msg.setHeader('To-Path', toPath);
    }

    setFromPath(msg, fromPath) 
    {
        msg.setHeader('From-Path', fromPath);
    }

    setMessageId(msg, id) 
    {
        msg.setHeader('Message-ID', id);
    }

    setContentType(msg, type) 
    {
        msg.setHeader('Content-Type', type);
    }

    setContentId(msg , contentId)
    {
        msg.setHeader('Content-ID' , contentId);
    }

    setContentDispo(msg , contentDispo)
    {
        msg.setHeader('Content-Disposition', contentDispo);
    }

    setMethod(msg, methodStr) 
    {
        msg.method = methodStr ;
        let status = 0;
        let respValue = 0;

        switch (methodStr.toLowerCase()) 
        {
            case 'send':
                msg.cmn.method = 1; // MSRP_METHOD_SEND
                break;
            case 'report':
                msg.cmn.method = 2; // MSRP_METHOD_REPORT
                break;
            case 'auth':
                msg.cmn.method = 3; // MSRP_METHOD_AUTH
                break;
            default:
                respValue = parseInt(methodStr, 10) || 0;
                if (respValue === 0) {
                    status = 506; // RESPCODE_506
                } else {
                    msg.cmn.responseCode = respValue;
                }
                break;
        }
    }

    setByteRanges(msg, brStart, brEnd, brTotal) 
    {
        let byteRange;
        
        if (brTotal === 0) 
        {
            //case for an empty body
            byteRange = '1-0/0';
        } 
        else 
        {
            byteRange = `${brStart}-${brEnd > 0 ? brEnd : '*'}/${brTotal}`;
        }
        
        msg.setHeader('Byte-Range', byteRange);
    }

    setContinuationFlag(msg , flag )
    {
        msg.contFlag = flag ; 
    }

    calculateBodyLength(msg) 
    {
        console.log("the content is : "+msg.msgContent);
        msg.bodyLength = msg.msgContent.length;
    }

    messageToString(msg) 
    {
        let buff = '';

        buff += `MSRP ${msg.transaction}`;
        switch (msg.cmn.method) {
            case 1:
                buff += ' SEND';
                break;
            case 2:
                buff += ' REPORT';
                break;
            case 3:
                buff += ' AUTH';
                break;
            default:
                buff += ' UNKNOWN';
                break;
        }
        buff += '\r\n';

        for (const [key, value] of Object.entries(msg.headers)) {
            buff += `${key}: ${value}\r\n`;
        }

        if (msg.msgContent) {
            buff += `\r\n${msg.msgContent}\r\n`;
        }

        buff += `-------${msg.transaction}${msg.contFlag === 1 ? '$' : '+'}\r\n`;

        return buff;
    }
}

module.exports = {
    MsrpMessage,
    MsrpCommons,
    NmsrpMessageManager,
    NmsrpPacketManager,
};
