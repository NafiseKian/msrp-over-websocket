const ConnectionManager = require('./connectionManager');
const AuthSessionManager = require('./authManager');
const MessageParser = require('./messageParser');
const ControlMessageParser  = require('./cmsgParser');
const { NmsrpPacketManager } = require ('./messageBuilder');
const   generateRandomString  = require ('./utilities/generators');
const MsrpUri = require('./msrpUri');
const Wrapper = require('./msrpWrapper');
const { CmTypes } = require('./cmsgTypes');
const ChunkManager = require('./chunkManager');
const {WebSocketMessage ,WEBSOCKET_OPCODE} = require('./websocketManager');


class Endpoint {
    
    constructor(host, port, name, password, sessionId, authHost , authPort , authSessionId) {
        this.host = host;
        this.port = port;
        this.username = name; 
        this.password = password;
        this.authHost = authHost;
        this.authPort = authPort;
        this.authSessionId = sessionId ;
        this.sessionId = sessionId;
        this.fromPath = new MsrpUri('',host , port , sessionId , 'ws');
        this.toPath = new MsrpUri(name ,authHost ,authPort,authSessionId,'ws');
        this.usePath = null ; 
        this.connectionManager = new ConnectionManager(this);
        this.connectionManager.setPacketParser(new MessageParser(this));
        this.authSessionManager = new AuthSessionManager(this);
        this.state = 'DISCONNECTED';
        this.pendingMessages = {}; 
        this.messageTimers = {};
        this.manager = new NmsrpPacketManager();
        this.wrapper = new Wrapper();
        this.chunkManager =  null;
        this.isWaiting = false ; 

        // Listen for the all events 
        this.connectionManager.on('connected', (protocol) => {
            this.onConnectionEstablished();
        });

        this.connectionManager.on('protocolSwitch', () => {
            console.log('protocol switch event received');
            this.authSessionManager.handleProtocolSwitch();
        });

        this.connectionManager.on('401', (rawMessage) => {
            console.log('401 Unauthorized event received');
            this.authSessionManager.handle401response(rawMessage);
        });

        this.connectionManager.on('403', () => {
            console.log('403 Forbiden event received');
            this.authSessionManager.failAuth();
        });

        this.connectionManager.on('auth_200', (rawMessage) =>{
            console.log('200 auth arrived ');
            this.authSessionManager.handle200Auth(rawMessage);

        });

        this.connectionManager.on('SEND', (message) => {
            console.log('on message event received');
            this.onMessage(message);
        });
    }

    connect(protocol) {
        this.connectionManager.openConnection(protocol, this.authHost, this.authPort);
        this.state = 'CONNECTING';
        console.log("state is --->" + this.state + "\n");
    }

    onConnectionEstablished() {
        console.log('Connection established');
        this.state = 'CONNECTED';
        console.log("state is --->" + this.state);

        if (this.authSessionManager.getState() === 'INITIAL') {
            this.authSessionManager.startAuth();
        }
    }

    onAuthComplete() {
        this.authSessionManager.completeAuth();
        this.state = 'AUTHENTICATED';
    }

    onAuthFailed() 
    {
        this.authSessionManager.failAuth();
        this.state = 'AUTH_FAILED';
    }

    getMimeTypeFromFileExtension(fileExt) 
    {
        const mimeTypes = {
          '.txt': 'text/plain',
          '.jpg': 'image/jpeg',
          '.png': 'image/png',
          '.pdf': 'application/pdf',
        };
      
        return mimeTypes[fileExt.toLowerCase()] || 'application/octet-stream';
    }

    sendFileMessage(filePath , contentId , contentDispo)
    {
        if (!filePath) 
        {
            console.error('No file name provided');
            return;
        }
        
          
        let fileStat;
          
        try {
            fileStat = fs.statSync(filePath);
          
        } catch (err) {
            console.error(`Error obtaining file stats for ${filePath}: ${err.message}`);
            return; 
        }
        
        console.log(`File size: ${fileStat.size}, Last modified: ${fileStat.mtime}`);
        
        const fileName = path.basename(filePath);
        const fileExt = path.extname(fileName);
        
        const mimeType = this.getMimeTypeFromFileExtension(fileExt);
        console.log(`File MIME type: ${mimeType}`);
        
        let fileContent;
        try {
            fileContent = (fs.readFileSync(filePath)).toString('base64');
        } catch (err) {
            console.error(`Error reading file ${filePath}: ${err.message}`);
            return;
        }

        if(fileContent.length > 2048)
        {
            console.log("file packet needs chunking");

            const msgId = generateRandomString(10);
            const chmng = new ChunkManager();
            chmng.createChunks(fileContent);

            let currentChunk = chmng.getChunkHead();

            while(currentChunk !== null )
            {
                console.log("\n-----------------------------------------------------\n");

                const msg = this.manager.createEmptyMessage();
                this.manager.setTransactionId(msg, generateRandomString(8));
                this.manager.setMethod(msg, 'SEND');
                this.manager.setToPath(msg , this.toPath.toString(),);
                this.manager.setFromPath(msg , this.fromPath.toString(),);
                this.manager.setMessageId(msg , msgId);
                this.manager.setContentId(msg , contentId);
                this.manager.setContentDispo(msg , contentDispo);
                this.manager.setBody(msg , currentChunk.msgContent);
                this.manager.calculateBodyLength(msg);
                this.manager.setByteRanges(msg, currentChunk.byteRangeStart, currentChunk.byteRangeEnd, currentChunk.byteRangeTotal);
                this.manager.setContentType(msg , type);
                this.manager.setContinuationFlag(msg , currentChunk.contFlag);

                console.log("this is the message to be sent" +this.manager.messageToString(msg) );
                this.addPendingMessage(msg.transaction , msg);

                this.sendMessage('ws' , this.manager.messageToString(msg),1);

                currentChunk = currentChunk.next ; 

                console.log("\n-----------------------------------------------------\n");
            }

        }
        else 
        {
            console.log("no need for chunking file packet , body size is : "+fileContent.length );
            const msg = this.manager.createEmptyMessage();
            this.manager.setTransactionId(msg, generateRandomString(8));
            this.manager.setMethod(msg, 'SEND');
            this.manager.setToPath(msg , this.toPath.toString(),);
            this.manager.setFromPath(msg , this.fromPath.toString(),);
            this.manager.setMessageId(msg , generateRandomString(10));
            this.manager.setContentId(msg , contentId);
            this.manager.setContentDispo(msg , contentDispo);
            this.manager.setBody(msg , fileContent);
            this.manager.calculateBodyLength(msg);
            this.manager.setByteRanges(msg, 1, msg.bodyLength, msg.bodyLength);
            this.manager.setContentType(msg , type);
            this.manager.setContinuationFlag(msg , 1);

            console.log("this is the message to be sent" +this.manager.messageToString(msg) );
            this.addPendingMessage(msg.transaction , msg);

            this.sendMessage('ws' , this.manager.messageToString(msg),1);
        }


    }

    createAndSendMessage(body , type)
    {

        if(body.length > 2048 )
        {
            console.log("packet needs chunking");

            const msgId = generateRandomString(10);
            const chmng = new ChunkManager();
            chmng.createChunks(body);

            let currentChunk = chmng.getChunkHead();

            while(currentChunk !== null )
            {
                console.log("\n-----------------------------------------------------\n");

                const msg = this.manager.createEmptyMessage();
                this.manager.setTransactionId(msg, generateRandomString(8));
                this.manager.setMethod(msg, 'SEND');
                this.manager.setToPath(msg , this.toPath.toString(),);
                this.manager.setFromPath(msg , this.fromPath.toString(),);
                this.manager.setMessageId(msg , msgId);
                this.manager.setBody(msg , currentChunk.msgContent);
                this.manager.calculateBodyLength(msg);
                this.manager.setByteRanges(msg, currentChunk.byteRangeStart, currentChunk.byteRangeEnd, currentChunk.byteRangeTotal);
                this.manager.setContentType(msg , type);
                this.manager.setContinuationFlag(msg , currentChunk.contFlag);

                console.log("this is the message to be sent" +this.manager.messageToString(msg) );
                this.addPendingMessage(msg.transaction , msg);

                this.sendMessage('ws' , this.manager.messageToString(msg),1);

                currentChunk = currentChunk.next ; 

                console.log("\n-----------------------------------------------------\n");
            }

        }
        else 
        {
            console.log("no need for chunking body size is : "+body.length);
            const msg = this.manager.createEmptyMessage();
            this.manager.setTransactionId(msg, generateRandomString(8));
            this.manager.setMethod(msg, 'SEND');
            this.manager.setToPath(msg , this.toPath.toString(),);
            this.manager.setFromPath(msg , this.fromPath.toString(),);
            this.manager.setMessageId(msg , generateRandomString(10));
            this.manager.setBody(msg , body);
            this.manager.calculateBodyLength(msg);
            this.manager.setByteRanges(msg, 1, msg.bodyLength, msg.bodyLength);
            this.manager.setContentType(msg , type);
            this.manager.setContinuationFlag(msg , 1);

            console.log("this is the message to be sent" +this.manager.messageToString(msg) );
            this.addPendingMessage(msg.transaction , msg);

            this.sendMessage('ws' , this.manager.messageToString(msg),1);
        }

        
    }

    sendMessage(protocol, message, wsTranslate) 
    {
        console.log("endPointManager :: trying to send the message, message length is =  "+message.length);

        if(wsTranslate)
        {
            const msg = new WebSocketMessage(WEBSOCKET_OPCODE.DATA_TEXT, true, true, Buffer.from(message));
            message = msg.build();
        }
        this.connectionManager.sendMessage(protocol, message);
    }

    onMessage(message)
    {
        console.log("an MSRP message arrived with content type : "+ message.cmn.contentType + " with flag :" +message.contFlag);

        var content_type = message.cmn.contentType ;

        if(message.contFlag == 1)
        {
            console.log("we received a chunk from a bigger message ");

            if(!this.isWaiting)
            {
                this.isWaiting = true  ; 
            }

            if(!this.chunkManager)
            {
                this.chunkManager = new ChunkManager();
            }

            this.chunkManager.addChunk(message);
            
        }
        else 
        {
            if(this.isWaiting)
            {
                console.log("waiting for last chunk ");
                this.chunkManager.addChunk(message);

                const cmplt = this.chunkManager.getAllContent();
                message.msgContent = cmplt ; 
                this.chunkManager = null ; 
                this.isWaiting = false ; 
            }
            
            if(content_type == "text/plain")
            {
                console.log("we have a simple text messge the content is : "+message.msgContent + "\n");
                //TODO : call a wrapper to pass this to UI side 
            }
            else if(content_type == "application/rechat.cntl+json")
            {
                console.log("we have a control messge \n");
                const parser = new ControlMessageParser();
                const parsedMessage = parser.parseDataForControlMessage(message.msgContent, message.msgContent.length);
    
                if (parsedMessage) 
                {
                    
    
                    switch(parsedMessage.type)
                    {
                        case CmTypes.CMTYPE_REQUEST: 
                            this.wrapper.passRequestDataToUp(parsedMessage);
                            break;
                        case CmTypes.CMTYPE_RESPONSE : 
                            this.wrapper.passResponseDataToUp(parsedMessage);
                            break ;
                        case CmTypes.CMTYPE_NOTIFY : 
                            this.wrapper.passNotifyDataToUp(parsedMessage);
                            break ; 
    
                    }
                } 
                else 
                {
                    console.error('Failed to parse the MSRP message.');
                }
            }
            //TODO : add multipart parser 
            
            
        }

        
    }

    addPendingMessage(transactionId, message) 
    {
        if (transactionId && message) 
        {
            this.pendingMessages[transactionId] = message;
            console.log(`Message with transaction ID ${transactionId} added to pending messages.`);

            const timer = setTimeout(() => {
                console.log(`Message with transaction ID ${transactionId} has expired.`);
                this.removePendingMessage(transactionId); //TODO
            }, 40000); 
 
            this.messageTimers[transactionId] = timer;
 
        } 
        else 
        {
            console.error('Invalid transaction ID or message.');
        }
    }

    removePendingMessage(transactionId) 
    {
        if (this.pendingMessages[transactionId]) 
        {
            delete this.pendingMessages[transactionId];
            console.log(`Message with transaction ID ${transactionId} removed from pending messages.`);

            if (this.messageTimers[transactionId]) 
            {
                clearTimeout(this.messageTimers[transactionId]);
                delete this.messageTimers[transactionId];
            }
 
        } 
        else 
        {
            console.warn(`No pending message found with transaction ID ${transactionId}.`);
        }
    }

    getPendingMessage(transactionId) 
    {
        return this.pendingMessages[transactionId];
    }

    closeConnection(protocol) 
    {
        this.connectionManager.closeConnection(protocol);
        this.state = 'DISCONNECTED';
        this.pendingMessages = {};
    }

    getState() 
    {
        return this.state;
    }
}

module.exports = Endpoint;
