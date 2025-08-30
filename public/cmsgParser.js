/*
** file : control message parser under java script 
** author : Nafise Kian
** date : August 2024
*/

const {
    CmTypes,
    RequestJobs,
    SubscriptionEvents,
    InformMethods,
    ControlMessage,
    AgentToAgentReqParams,
    SessionCloseReqParams,
    SessionTransferReqParams,
    ClientConnectedReqParams,
    MessageToReqParams,
    AgentConnectedReqParams,
    ClientDisconnectedReqParams,
    CancelOngoingReqParams,
    JoinChatroomReqParams,
    InviteMemberReqParams,
    LeaveChatroomReqParams,
    MessageEditReqParams,
    FileTransferReqParams,
    MessageHistoryReqParams,
    AgentListRespParams,
    FileTransferRespParams,
    MessageHistoryRespParams,
    InviteMemberRespParams,
    StartGroupChatRespParams,
    ChatListRespParams,
    NotifyMessage,
    NotifySeenParms

} = require('./cmsgTypes');


class ControlMessageParser 
{
    constructor() 
    {
        this.cmTypeStrings = Object.values(CmTypes);
        this.requestJobStrings = Object.values(RequestJobs);
        this.subscriptionEventStrings = Object.values(SubscriptionEvents);
        this.informMethodStrings = Object.values(InformMethods);
        
    }

    //If type exists we return it other wise we return unknown
    getControlMessageType(typeStr) {
        console.log("getting control message type enum value the type is --> " + typeStr);
        const trimmedTypeStr = typeStr.trim().toLowerCase();

        const matchedType = Object.values(CmTypes).find(enumValue => enumValue.str === trimmedTypeStr);
    
        console.log("Matched type: " + (matchedType || CmTypes.CMTYPE_UNKNOWN));
    
        return matchedType || CmTypes.CMTYPE_UNKNOWN;
    }


    getRequestJob(jobStr) 
    {
        console.log("getting request job enum value, the job is --> " + jobStr);
        const trimmedJobStr = jobStr.trim().toLowerCase();
    
        const matchedJob = Object.values(RequestJobs).find(enumValue => enumValue.str === trimmedJobStr);
    
        console.log("Matched job: " + (matchedJob || RequestJobs.REQJOB_UNKNOWN));
        
        return matchedJob || RequestJobs.REQJOB_UNKNOWN;
    }
    

    getSubscriptionEvent(eventStr) 
    {
      console.log("getting event enum value, the event is --> " + eventStr);
      const trimmedEventStr = eventStr.trim().toLowerCase();

      const matchedEvent = Object.values(SubscriptionEvents).find(enumValue => enumValue.str === trimmedEventStr);
  
      console.log("Matched event: " + (matchedEvent ? matchedEvent.enum : SubscriptionEvents.SUBSEVENT_UNKNOWN.enum));
  
      return matchedEvent ? matchedEvent.enum : SubscriptionEvents.SUBSEVENT_UNKNOWN.enum;
    }

    getInformMethod(methodStr) 
    {
      return this.informMethodStrings.includes(methodStr) ? methodStr : InformMethods.INF_METHOD_UNKNOWN;
    }

  /*
  ** this function will parse the raw json body that we get from packet body to a cmsg 
  ** parameters : json body and its length 
  */
  parseDataForControlMessage(data, dlen) 
  {
    const allData = 
    {
      str: data,
      length: dlen,
    };

    let jmsg;
    try 
    {
      console.log('cmsgParser :: Parsing JSON body of control message \n');
      jmsg = JSON.parse(data);
    } 
    catch (error) 
    {
      console.error('cmsgParser :: Parsing error JSON data at:', data);
      return null;
    }

    const id = jmsg.id;
    if (!id) 
    {
      console.error('cmsgParser :: No "id" included in control message, mandatory field missing');
      return null;
    }

    const typeStr = jmsg.type;
    if (!typeStr) 
    {
      console.error('cmsgParser :: No "type" included in control message, mandatory field missing');
      return null;
    }

  
    const type = this.getControlMessageType(typeStr);


    const controlMessage = new ControlMessage({
      type, 
      parserObj: jmsg,
      allData,
      id,
    });

    console.log('cmsgParser :: switching on cmsg type the type is --> '+jmsg.type);
    switch (type) 
    {
      case CmTypes.CMTYPE_REQUEST:
      {
        controlMessage.cm = this._obtainDataForRequestMessage(jmsg);
        const jobStr = jmsg.job;
        if (!jobStr) 
        {
          console.error('cmsgParser :: No "job" included in request control message, mandatory field missing');
          return null;
        }
        const job = this.getRequestJob(jobStr);
        controlMessage.job = job ; 
      }
        break;
      case CmTypes.CMTYPE_RESPONSE:
      {
        controlMessage.cm = this._obtainDataForResponseMessage(jmsg);
        const jobStr = jmsg.job;
        if (!jobStr) 
        {
          console.error('cmsgParser :: No "job" included in response control message, mandatory field missing');
          return null;
        }
        const job = this.getRequestJob(jobStr);
        controlMessage.job = job ; 
      }
        break;
      case CmTypes.CMTYPE_NOTIFY:
      {
        controlMessage.cm = this._obtainDataForNotifyMessage(jmsg);
        const eventStr = jmsg.event;
        if(!eventStr)
        {
          console.log('cmsgParser :: No "event" included in notify control message, mandatory field missing');
          return null ; 
        }
        const event = this.getSubscriptionEvent(eventStr);
        controlMessage.event = event ; 
      }
        break;
      default:
        console.error('Unknown control message type');
        return null;
    }

    return controlMessage;
  }

  _obtainDataForRequestMessage(jmsg) 
  {
    const jobStr = jmsg.job;
    console.log("job value is : "+jmsg.job);
    const job = this.getRequestJob(jobStr);

    switch (job) 
    {
        case RequestJobs.REQJOB_AGENT_TO_AGENT:
            return new AgentToAgentReqParams(this._requestObtainAgentToAgentParms(jmsg));
        case RequestJobs.REQJOB_SESSION_CLOSE :
            return new SessionCloseReqParams(this._requestObtainSessionCloseParms(jmsg));
        case RequestJobs.REQJOB_SESSION_TRANSFER:
            return new SessionTransferReqParams(this._requestObtainSessionTransferParms(jmsg));
        case RequestJobs.REQJOB_CLIENT_CONNECTED:
            return new ClientConnectedReqParams(this._requestObtainClientConnectedParms(jmsg));
        case RequestJobs.REQJOB_MESSAGE_TO:
            return new MessageToReqParams(this._requestObtainMessageToParms(jmsg));
        case RequestJobs.REQJOB_AGENT_CONNECTED:
            return new AgentConnectedReqParams(this._requestObtainAgentConnectedParms(jmsg));
        case RequestJobs.REQJOB_CLIENT_DISCONNECTED :
            return new ClientDisconnectedReqParams(this._requestObtainClientDisconnectedParms(jmsg));
        case RequestJobs.REQJOB_CANCEL_ONGOING : 
            return new CancelOngoingReqParams(this._requestObtainCancelOngoingParms(jmsg));
        case RequestJobs.REQJOB_JOIN_CHAT : 
            return new JoinChatroomReqParams(this._requestObtainJoinChatParms(jmsg));
        case RequestJobs.REQJOB_INVITE_MEMBER :
            return new InviteMemberReqParams(this._requestObtainInviteMemberParms(jmsg));
        case RequestJobs.REQJOB_LEAVE_CHAT:
            return new LeaveChatroomReqParams(this._requestObtainLeaveChatParms(jmsg));
        case RequestJobs.REQJOB_EDIT_MESSAGE :
            return new MessageEditReqParams (this._requestObtainEditMessageParms(jmsg));
        case RequestJobs.REQJOB_FILE_TRANSFER :
            return new FileTransferReqParams (this._requestObtainFileTransferParms(jmsg));
        default:
            console.error('Unknown request job type');
        return null;
    }
  }

  _obtainDataForResponseMessage(jmsg) 
  {
    const resp = {};

    const respToStr = jmsg['response-to'];
    const detailStr = jmsg['detail'];
    const job = this.getRequestJob(detailStr);

    const respTo = this.getControlMessageType(respToStr);
    resp.response_to = respTo;

    switch (respTo) 
    {
        case CmTypes.CMTYPE_REQUEST:
            resp.detail = { job: job };
            break;
        case CmTypes.CMTYPE_SUBSCRIBE:
            resp.detail = { sevent: this.getSubscriptionEvent(detailStr) };
            break;
        default:
            console.error('Unknown control message type in response');
            return null;
    }

    resp.result_code = jmsg['result-code'] || 0;
    resp.result_text = jmsg['result-text'] || '';

    if (respTo === CmTypes.CMTYPE_REQUEST) 
    {
      if (job === RequestJobs.REQJOB_FILE_TRANSFER) 
      {
          resp.parms = new FileTransferRespParams(this._responseObtainFileTransferParams(jmsg));
      } 
      else if (job === RequestJobs.REQJOB_AGENT_LIST) 
      {
          resp.parms = new AgentListRespParams(this._responseObtainAgentListParams(jmsg));
      } 
      else if (job === RequestJobs.REQJOB_MESSAGE_HISTORY) 
      {
          resp.parms = new MessageHistoryRespParams(this._responseObtainMessageHistoryParams(jmsg));
      } 
      else if (job === RequestJobs.REQJOB_INVITE_MEMBER) 
      {
          resp.parms = new InviteMemberRespParams(this._responseObtainInviteMemberParams(jmsg));
      }
      else if (job === RequestJobs.REQJOB_CHAT_LIST) 
      {
          resp.parms = new ChatListRespParams(this._responseObtainChatListParams(jmsg));
      } 
      else if (job === RequestJobs.REQJOB_CREATE_TICKET) 
      {
          resp.parms = new CreateTicketRespParams(this._responseObtainCreateTicketParams(jmsg));
      } 
      else if (job === RequestJobs.REQJOB_TICKET_LIST) 
      {
          resp.parms = new TicketListRespParams(this._responseObtainTicketListParams(jmsg));
      } 
      else if (job === RequestJobs.REQJOB_START_GROUPCHAT) 
      {
          resp.parms = new StartGroupChatRespParams(this._responseObtainStartGroupChatParams(jmsg));
      }
  }  

    return resp;
  }


  _obtainDataForNotifyMessage(jmsg) 
  {
    const eventStr = jmsg.event;
    const sevent = this.getSubscriptionEvent(eventStr);

    let notifyMessage = new NotifyMessage({ sevent });

    if (sevent === SubscriptionEvents.SUBSEVENT_MESSAGE_SEEN.enum)
    { 
      console.log("cmsgParser :: we have a message seen notify message ");
      notifyMessage.source = jmsg.source || '';
      notifyMessage.notifier = jmsg.notifier || '';
      notifyMessage.parms = this._notfObtainMessageSeenParms(jmsg);
    }
    else
    {
      notifyMessage.source = jmsg.source || '';
      notifyMessage.notifier = jmsg.notifier || '';

    }

  return notifyMessage;
  }

  _requestObtainAgentToAgentParms(jmsg) 
  {
    console.log("cmsgParser :: obtainign agent to agent request params \n");
    const parms = jmsg.parameters;

    if (!parms) 
    {
      console.error('Missing "parameters" in agent-to-agent request');
      return {};
    }

    return {
      fromName: parms['from-name'],
      agentName: parms['agent-name'],
      reason: parms.reason,
      realtime: parms['real-time'],
    };
  }

  _requestObtainSessionCloseParms(jmsg) 
  {
    console.log("cmsgParser :: obtaining session close request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in session-close request');
        return {};
    }

    return {
        fromName: parms['from-name'],
        targetName: parms['target-name'],
        reason: parms['reason'],
    };
  }

  _requestObtainSessionTransferParms(jmsg) 
  {
    console.log("cmsgParser :: obtaining session transfer request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in session transfer request');
        return {};
    }

    return {
        fromName: parms['from-name'],
        targetName: parms['target-name'],
        transfereeName: parms['transferee-name'],
        reason: parms['reason'],
        historyAdded : parms['history-added']
    };
  }


  _requestObtainClientConnectedParms(jmsg) {
    console.log("cmsgParser :: obtaining client connected request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in client connected request');
        return {};
    }

    return {
        clientName: parms['client-name'],
        keywords: parms['keywords'],
        secsInQueue: parms['seconds-in-queue'],
    };
  }

  _requestObtainMessageToParms(jmsg) {
    console.log("cmsgParser :: obtaining message to request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in message to request');
        return {};
    }

    return {
        fromName: parms['from-name'],
        toName: parms['to-name'],
        messageToType: parms['message-to-type'],
    };
  }

  _requestObtainAgentConnectedParms(jmsg) {
    console.log("cmsgParser :: obtaining agent connected request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in agent connected request');
        return {};
    }

    return {
        agentName: parms['agent-name'],
    };
  }

  _requestObtainClientDisconnectedParms(jmsg) 
  {
    console.log("cmsgParser :: obtaining client disconnected request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in client disconnected request');
        return {};
    }

    return {
        clientName: parms['client-name'],
        reason: parms['reason'],
    };
  }

  _requestObtainCancelOngoingParms(jmsg)
  {
    console.log("cmsgParser :: obtaining cancel ongoing request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in cancel ongoing request');
        return {};
    }

    return {
        jobToCancel: parms['job-to-cancel'],
        responseRequired: parms['response-required'],
    };

  }

  _requestObtainJoinChatParms(jmsg)
  {
    console.log("cmsgParser :: obtaining join chat request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in join chat request');
        return {};
    }

    return {
        chatroomId: parms['chatroom-id'],
        fromName: parms['from-name'],
        chatroomType: parms['chat-type'],
    };

  }

  _requestObtainInviteMemberParms(jmsg)
  {
    console.log("cmsgParser :: obtaining invite member request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in invite member request');
        return {};
    }

    return {
        toName : parms['to-name'],
        fromName: parms['from-name'],
        chatroomId: parms['chatroom-id'],
        chatType: parms['chat-type'],
    };

  }

  _requestObtainLeaveChatParms(jmsg)
  {
    console.log("cmsgParser :: obtaining leave chat request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in leave chat request');
        return {};
    }

    return {
        name : parms['name'],
        chatId: parms['chat-id'],
        chatType: parms['chat-type'],
    };

  }

  _requestObtainEditMessageParms(jmsg)
  {
    console.log("cmsgParser :: obtaining edit message request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in edit message request');
        return {};
    }

    return {
        currentMessageId : parms['current-message-id'],
        fromName: parms['from-name'],
        toName: parms['to-name'],
        chatType: parms['chat-type'],
    };
  }

  _requestObtainFileTransferParms(jmsg)
  {
    console.log("cmsgParser :: obtaining file transfer request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in file transfer request');
        return {};
    }

    return {
        dir : parms['direction'],
        fromName: parms['from-name'],
        targetName: parms['target-name'],
        fname: parms['file-name'],
        ftype: parms['file-type'],
        fsize: parms['file-size'],
        fhash: parms['file-hash'],
        fxferId: parms['file-transfer-id'],
        fdispos: parms['file-disposition'],
        fcrDate: parms['file-creation-date'],
        fmodDate: parms['file-modification-date'],
        frdDate : parms['file-read-date']
    };

  }


  _responseObtainFileTransferParams(jmsg) 
  {
    console.log("cmsgParser :: obtaining file transfer request params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in file transfer request');
        return {};
    }

    return {
        dir : parms['direction'],
        fromName: parms['from-name'],
        targetName: parms['target-name'],
        fname: parms['file-name'],
        ftype: parms['file-type'],
        fsize: parms['file-size'],
        fhash: parms['file-hash'],
        fxferId: parms['file-transfer-id'],
        fdispos: parms['file-disposition']
    };
  }


  _responseObtainAgentListParams(jmsg) 
  {
    const agentListParams = new AgentListRespParams({ agentList: [], statusList: [] });

    const parms = jmsg.parameters;
    if (!parms) 
    {
        throw new Error("'parameters' mandatory for agent-list");
    }

    const agentList = parms['agent-list'];

    if (!agentList || agentList.length === 0) 
    {
        throw new Error("No 'agent-list' provided or it's empty");
    }

    agentList.forEach((agent) => 
    {
        const agentName = agent['agent-name'];
        const agentStatus = agent['agent-status'];

        if (agentName && agentStatus) 
        {
            agentListParams.agentList.push(agentName);
            agentListParams.statusList.push(agentStatus);
        }
    });

    return agentListParams;
  }


  _responseObtainMessageHistoryParams(jmsg) 
  {
    console.log("cmsgParser :: obtaining message history response params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in message history response ');
        return {};
    }

    return {
      toName : parms['to-name'],
      fromName : parms['from-name'],
      startTime : parms['start-time'],
      endTime : parms['end-time'],
    };
  }

  _responseObtainInviteMemberParams(jmsg) 
  {
    console.log("cmsgParser :: obtaining invite member response params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in invite member response ');
        return {};
    }

    return {
        member : parms['member'],
    };

  }

  responseObtainStartConferenceParams(jmsg) {
    
    return {};
  }

  _responseObtainChatListParams(jmsg) 
  {
    console.log("cmsgParser :: obtaining chat list response params \n");
    const chatListParams = new ChatListRespParams({ chatList: [], chatType: null });

    const parms = jmsg.parameters;
    if (!parms) 
    {
        throw new Error("'parameters' mandatory for chat-list");
    }

    const chatList = parms['chat-list'];
    const chatType = parms['chat-type'];

    if (!chatList || chatList.length === 0) 
    {
        throw new Error("No 'chat-list' provided or it's empty");
    }

    chatList.forEach((chat) => 
    {
        chatListParams.chatList.push(chat);
    });

    if (chatType) 
    {
        chatListParams.chatType = chatType;
    }

    return chatListParams;
}


  _responseObtainStartGroupChatParams(jmsg) 
  {
    console.log("cmsgParser :: obtaining start group response params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in start group response ');
        return {};
    }

    return {
      groupchatId : parms['groupchat-id'],
    };
    
  }

  _notfObtainMessageSeenParms(jmsg)
  {
    console.log("cmsgParser :: obtaining message seen notify params \n");
    const parms = jmsg.parameters;

    if (!parms) {
        console.error('Missing "parameters" in message seen notify  ');
        return {};
    }

    return {
      toName : parms['to-name'],
      seenTime : parms['seen-time'],
      sessKey : parms['sessionkey'],
      chatType : parms['chat-type']
    };

  }
}


module.exports = ControlMessageParser ;
