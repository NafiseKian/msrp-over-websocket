const net = require('net');
const EventEmitter = require('events');
const { MsrpParser } = require('./messageParser');
const {WebSocketMessage ,WEBSOCKET_OPCODE} = require('./websocketManager');

class ConnectionManager extends EventEmitter 
{
    constructor(endpoint) {
        super();
        this.connections = new Map(); 
        this.packetParser = null;
        this.endpoint = endpoint; 
    }

    setPacketParser(parser) 
    {
        this.packetParser = parser;
 
        //emit job is to trigger named events
        if (this.packetParser) 
        {
            this.packetParser.on('protocolSwitch', (message) => 
            {
                this.emit('protocolSwitch', message);
            });

            this.packetParser.on('403', () => 
            {
                this.emit('403');
            });

            this.packetParser.on('401', (rawMessage) => 
            {
                this.emit('401', rawMessage);
            });

            this.packetParser.on('auth_200', (rawMessage) => 
            {
                this.emit('auth_200', rawMessage);
            });


            this.packetParser.on('SEND', (message) => 
            {
                this.emit('SEND', message);
            });
            
        }
    }

    openConnection(protocol, host, port) 
    {
        if ( protocol === 'ws') 
        {
            const socket = new net.Socket();

            socket.connect(port, host, () => 
            {
                console.log(`Connected to ${host}:${port} using ${protocol}`);
                this.connections.set(protocol, socket);
                this.emit('connected', protocol);
            });

            socket.on('data', (data) => 
            {
                if(this.endpoint.state != 'AUTH_HANDSHAKE'){
                    console.log("we have ws binary date we need to parse it \n");
                    data = WebSocketMessage.parse(data);

                }  
                console.log(`Received data on ${protocol}:`, data.toString());
                if (this.packetParser) {
                    try {
                        const parsedMessage = this.packetParser.parse(data.toString()); 
                        //console.log('Parsed message:', parsedMessage);
                    } catch (err) {
                        console.error('Failed to parse MSRP message:', err);
                    }
                }
            });

            socket.on('error', (err) => {
                console.error(`${protocol} connection error:`, err);
            });

            socket.on('close', () => {
                console.log(`${protocol} connection closed`);
                this.connections.delete(protocol);
            });
        } else {
            console.error('Unsupported protocol:', protocol);
        }
    }

    sendMessage(protocol, message) 
    {
        console.log("connectionManager :: send message function is called");
        const socket = this.connections.get(protocol);
        if (socket && socket.writable) 
        {
            socket.write(message, (err) => {
                if (err) 
                {
                    console.error(`Failed to send message over ${protocol}:`, err);
                } 
                else 
                {
                    console.info(`Successfully sent message over ${protocol}`);
                }
            });
        } 
        else 
        {
            console.warn(`No active connection found for protocol ${protocol}`);
        }
    }

    closeConnection(protocol) 
    {
        const socket = this.connections.get(protocol);
        if (socket) 
        {
            socket.end(() => 
            {
                console.log(`${protocol} connection closed`);
                this.connections.delete(protocol);
            });
        } 
        else 
        {
            console.warn(`No active connection found for protocol ${protocol}`);
        }
    }
}

module.exports = ConnectionManager;
