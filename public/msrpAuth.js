const { createHash } = require ('crypto');
const  { NmsrpPacketManager } = require ('./messageBuilder');
const   generateRandomString  = require ('./utilities/generators');
const MsrpMessage = require('./messageBuilder');
const MsrpUri = require('./msrpUri')

class MsrpAuth 
{
    static maxNc = 5;
    static ncStr = ["00000001", "00000002", "00000003", "00000004", "00000005"];
    
    constructor(endpoint , secure = false ) {
        this.manager = new NmsrpPacketManager();
        this.endpoint = endpoint ; 
        this.username = this.endpoint.username;
        this.password = this.endpoint.password;
        this.sessionId = this.endpoint.sessionId;
        this.authTarget = this.endpoint.toPath.toString();
        this.secure = secure;
        this.state = 0;
        this.sentNonce = null;
        this.sentNonceInt = 0;
        this.ncCount = 0;
        
    }

    //this functions generates an MD5 hash of the input string.
    md5Hash(input) {
        return createHash('md5').update(input).digest('hex');
    }

    //this functions generates the HA1 hash, which is a combination of the username, realm, and password
    calculateHA1(realm) 
    {
        //console.log("user name is :" + this.username + " password is : "+this.password + " \n\n");
        const ha1Text = `${this.username}:${realm}:${this.password}`;
        return this.md5Hash(ha1Text);
    }
    

    calculateHA2(method, uri) 
    {
        //console.log("methis is :" + method + " uri is : "+ uri+ " \n\n");
        const ha2Text = `${method}:${uri}`;
        return this.md5Hash(ha2Text);
    }
    

    calculateResponse(ha1, nonce, nc, cnonce, qop, ha2) 
    {
        //console.log("ha1 is : "+ha1+"\n"
                     //+"nonce is : "+nonce + "\nnc is : "+ nc 
                     //+"\ncnonce is : "+cnonce + "\nqop is : "+ qop 
                     //+"\n ha2 is : "+ha2);
        const responseText = `${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`;
        return this.md5Hash(responseText);
    }

    buildAuthRequest(toPath , fromPath) 
    {
        const auth_msg = this.manager.createEmptyMessage();

        this.manager.setMethod(auth_msg, 'AUTH');
        this.manager.setTransactionId(auth_msg, generateRandomString(8));
        this.manager.setToPath(auth_msg, toPath);
        this.manager.setFromPath(auth_msg, fromPath);
        this.manager.setMessageId(auth_msg, generateRandomString(8));

        this.manager.setByteRanges(auth_msg, 1, auth_msg.bodyLength, auth_msg.bodyLength);
        console.log('Sending AUTH request: ' + this.manager.messageToString(auth_msg));

        return auth_msg;
    }

    buildAuthorization(realm, nonce, qop) 
    {
        //console.log("endpoint to path is : "+this.endpoint.fromPath.toString());
        console.log("building Authorization...");
        
        const ha1 = this.calculateHA1(realm);
        const uri = this.authTarget;
        const ha2 = this.calculateHA2("AUTH", uri);
    
        const cnonce = generateRandomString(16);
        const nc = MsrpAuth.ncStr[this.ncCount % MsrpAuth.maxNc];
        this.ncCount++;
    
        const response = this.calculateResponse(ha1, nonce, nc, cnonce, qop, ha2);
    
        const msg = this.manager.createEmptyMessage();
        this.manager.setTransactionId(msg, generateRandomString(8));
        this.manager.setMethod(msg, 'AUTH');
        msg.setHeader('To-Path', this.endpoint.toPath.toString());
        msg.setHeader('From-Path', this.endpoint.fromPath.toString());
        msg.setHeader('Authorization', `Digest username="${this.endpoint.username}", realm="${realm}", nonce="${nonce}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`);

        console.log('Authorization message built: ', this.manager.messageToString(msg));
        
    
        return msg;
    }
    

    handle401Unauthorized(rawMessage) 
    {
        console.log("Handling 401 Unauthorized...\n lets get www header from this packet " + rawMessage);
    
        const lines = rawMessage.split('\r\n');
    
        let realm = '';
        let qop = '';
        let nonce = '';
    
  
        for (const line of lines) 
        {
            if (line.startsWith('WWW-Authenticate: ')) 
            {
                const realmMatch = line.match(/realm="([^"]+)"/);
                const qopMatch = line.match(/qop="([^"]+)"/);
                const nonceMatch = line.match(/nonce="([^"]+)"/);
    
                if (realmMatch) realm = realmMatch[1];
                if (qopMatch) qop = qopMatch[1];
                if (nonceMatch) nonce = nonceMatch[1];
    
                break; 
            }
        }
    
        console.log(`Parsed values - realm: ${realm}, qop: ${qop}, nonce: ${nonce}`);
        return this.buildAuthorization(realm, nonce, qop);
    }
    

    handle200Ok(rawMessage) 
    {
        console.log("Handling 200 OK... Parsing the Use-Path and other headers.");

        const lines = rawMessage.split('\n');
    
        let usePath = '';
        let sessionId = '';
        let expires = 0;
        let authInfo = {};
    
    
        lines.forEach(line => 
            {
            if (line.startsWith('Use-Path:')) 
            {
                usePath = line.split(': ')[1].trim();
                console.log(`Use-Path header value: ${usePath}`);
                
                const uriParts = usePath.split('/');
                const sessionAndProtocol = uriParts.pop().split(';');
                const sessionId = sessionAndProtocol[0];
                const protocol = sessionAndProtocol[1]; 

                const hostPort = uriParts[2].split(':');
                const host = hostPort[0];
                const port = hostPort[1];

                console.log(`Host: ${host}`);
                console.log(`Port: ${port}`);
                console.log(`Session ID: ${sessionId}`);
                console.log(`Protocol: ${protocol}`);

                this.endpoint.toPath = new MsrpUri('', host, port, sessionId, protocol);
                console.log("New URI after auth is: " + this.endpoint.toPath.toString());
            }    
            else if (line.startsWith('Expires:')) 
            {
                expires = parseInt(line.split(': ')[1].trim(), 10);
                console.log(`Expires header value: ${expires}`);
            } else if (line.startsWith('Authentication-Info:')) {
                const authInfoParts = line.split(': ')[1].split(', ');
                authInfoParts.forEach(part => {
                    const [key, value] = part.split('=');
                    authInfo[key.trim()] = value.replace(/"/g, '');
                });
                console.log('Authentication-Info header data:', authInfo);
            }
        });

        this.endpoint.usePath = usePath;
        //this.endpoint.expires = expires;
        //this.endpoint.authInfo = authInfo; we can add this data to endpoint if needed 

        const transaction = generateRandomString(8);
        const msg = this.manager.createEmptyMessage();
        this.manager.setTransactionId(msg, transaction);
        this.manager.setMethod(msg, 'SEND');
        this.manager.setToPath(msg, this.endpoint.toPath.toString());
        this.manager.setFromPath(msg, this.endpoint.fromPath.toString());
        this.manager.setMessageId(msg , generateRandomString(8));
        this.manager.setByteRanges(msg , 1 ,0, 0);
        this.manager.setBody(msg , '');

        this.endpoint.addPendingMessage(transaction , msg );
    
        return msg;
        
    }
    

    extractValue(lines, key) 
    {
        for (const line of lines) 
        {
            if (line.startsWith(key)) 
            {
                const parts = line.split('=');
                if (parts.length > 1) 
                {
                    return parts[1].replace(/"/g, '').trim();
                }
            }
        }
        return '';
    }
}

module.exports =  MsrpAuth;
