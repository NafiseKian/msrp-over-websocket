const httpHandShake = require('./httpHSK'); 
const MsrpAuth = require('./msrpAuth');
const {WebSocketMessage ,WEBSOCKET_OPCODE} = require('./websocketManager');
const  { NmsrpPacketManager } = require ('./messageBuilder');

class AuthSessionManager 
{
    constructor(endpoint) 
    {
        this.manager = new NmsrpPacketManager();
        this.state = 'INITIAL';
        this.endpoint = endpoint;
        this.auth = new MsrpAuth(
            this.endpoint,
            false 
        );
    }

    startAuth() 
    {
        console.log('Starting authentication process...');
        this.state = 'AUTH_HANDSHAKE';
        this.endpoint.state = 'AUTH_HANDSHAKE';
        
        const handshake = new httpHandShake();
        const result = handshake.performWebSocketUpgrade(this.endpoint.authHost, 'msrp');
        this.endpoint.sendMessage('ws', result, 0);
        console.log("auth state is --> "+this.state);
    }

    handleProtocolSwitch() 
    {
        console.log('Protocol switched to WebSocket. Now we are going to build MSRP auth packets.');
        this.state = 'SWITCHING_PROTOCOL';
        this.endpoint.state = 'AUTH';

    
        const authMsg = this.auth.buildAuthRequest(
            this.endpoint.toPath.toString(),
            this.endpoint.fromPath.toString()
        );

        this.endpoint.addPendingMessage(authMsg.transaction, authMsg);

        console.log('Sending MSRP AUTH message over WebSocket');
        this.endpoint.sendMessage('ws', this.manager.messageToString(authMsg) , 1);
        
    }

    handle401response(rawMessage)
    {
        console.log("we need to handle 401 respnse ");
        const msg = this.auth.handle401Unauthorized(rawMessage);
        console.log("auth message is ready = "+this.manager.messageToString(msg));
        this.endpoint.addPendingMessage(msg.transaction , msg);
        

        this.endpoint.sendMessage('ws', this.manager.messageToString(msg) , 1);
        this.endpoint.state = 'AUTH_200';

    }

    handle200Auth(rawMessage)
    {
        const msg = this.auth.handle200Ok(rawMessage);

        console.log("empty body packet to send is : "+this.manager.messageToString(msg));
        this.completeAuth();

       
        console.log('Sending MSRP AUTH message over WebSocket');
        this.endpoint.sendMessage('ws', this.manager.messageToString(msg), 1);
        


    }
    

    completeAuth() 
    {
        console.log('Authentication complete');
        this.state = 'AUTH_COMPLETE';
        this.endpoint.state = 'AUTH_COMPLETE';
    }

    failAuth() 
    {
        console.log('Authentication failed try to enter correct credentials !');
        this.state = 'AUTH_FAILED';
    }

    getState() 
    {
        return this.state;
    }
}

module.exports = AuthSessionManager;
