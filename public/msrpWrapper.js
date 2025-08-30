const {
    RequestJobs,
} = require('./cmsgTypes');
const Endpoint = require('./endPointManager');

class Wrapper 
{
    constructor()
    {
        //this.endpoint = new Endpoint (host , port , name , pass , sessId , authHost , authPort , authSessId);
        //this.endpoint.connect('ws');
    }


    sendMsg (body , type)
    {
        this.endpoint.createAndSendMessage(body , type);
    }

    onMsg()
    {
        //TODO
    }

    passRequestDataToUp(parsedMessage)
    {
        console.log('Wrapper :: Parsed Message ID:', parsedMessage.id);
        console.log('Wrapper :: Parsed Message Type:', parsedMessage.type);
        console.log('Wrapper :: Parsed Message Job:', parsedMessage.job);
        console.log('Wrapper :: Parsed Message Data:', JSON.stringify(parsedMessage.cm, null, 2));

        switch(parsedMessage.job)
        {
            case RequestJobs.REQJOB_AGENT_TO_AGENT:
                console.log("pass data to ui ");
                break ; 
            case RequestJobs.REQJOB_SESSION_CLOSE :
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_SESSION_TRANSFER:
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_CLIENT_CONNECTED:
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_MESSAGE_TO:
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_AGENT_CONNECTED:
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_CLIENT_DISCONNECTED :
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_CANCEL_ONGOING : 
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_JOIN_CHAT : 
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_INVITE_MEMBER :
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_LEAVE_CHAT:
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_EDIT_MESSAGE :
                console.log("pass data to ui ");
                break ;
            case RequestJobs.REQJOB_FILE_TRANSFER :
                console.log("pass data to ui ");
                break ;
        }
    }


    passResponseDataToUp(parsedMessage)
    {

    }

    passNotifyDataToUp(parsedMessage)
    {

    }

    buildMessageAndSend(body , type)
    {

    }

}

module.exports = Wrapper ; 