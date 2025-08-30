class MsrpUri 
{
    constructor(userInfo, host, port, sessionId, transport) {
        this.scheme = "msrp";
        this.userInfo = userInfo || '';
        this.host = host || '';
        this.port = port || '';
        this.sessionId = sessionId || '';
        this.transport = transport || '';
    }

    setScheme(scheme) {
        this.scheme = scheme;
        return this;
    }

    setUserInfo(userInfo) {
        this.userInfo = userInfo;
        return this;
    }

    setHost(host) {
        this.host = host;
        return this;
    }

    setPort(port) {
        this.port = port;
        return this;
    }

    setSessionId(sessionId) {
        this.sessionId = sessionId;
        return this;
    }

    setTransport(transport) {
        this.transport = transport;
        return this;
    }

    toString() 
    {
        let uri = `${this.scheme}://`;

        if (this.userInfo !== '') {
            uri += `${this.userInfo}@`;
        }

        if (this.host !== '') {
            uri += this.host;
        }

        if (this.port !== '') {
            uri += `:${this.port}`;
        }

        if (this.sessionId !== '') {
            uri += `/${this.sessionId}`;
        }

        if (this.transport !== '') {
            uri += `;${this.transport}`;
        } else {
            uri = uri.replace(/;$/, '');  
        }

        return uri;
    }
}

module.exports = MsrpUri ; 