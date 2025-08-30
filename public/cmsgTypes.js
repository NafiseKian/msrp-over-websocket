/*
** file : control message types under java script 
** author : Nafise Kian
** date : August 2024
*/


// Enums for different message types
const CmTypes = Object.freeze({
    CMTYPE_REQUEST: { enum: 'CMTYPE_REQUEST', str: 'request' },
    CMTYPE_RESPONSE: { enum: 'CMTYPE_RESPONSE', str: 'response' },
    CMTYPE_UPDATE: { enum: 'CMTYPE_UPDATE', str: 'update' },
    CMTYPE_SUBSCRIBE: { enum: 'CMTYPE_SUBSCRIBE', str: 'subscribe' },
    CMTYPE_PUBLISH: { enum: 'CMTYPE_PUBLISH', str: 'publish' },
    CMTYPE_NOTIFY: { enum: 'CMTYPE_NOTIFY', str: 'notify' },
    CMTYPE_UNKNOWN: { enum: 'CMTYPE_UNKNOWN', str: 'unkwn' },
});

const RequestJobs = Object.freeze({
    REQJOB_AGENT_TO_AGENT: { enum: 'REQJOB_AGENT_TO_AGENT', str: 'agent-to-agent' },
    REQJOB_FILE_TRANSFER: { enum: 'REQJOB_FILE_TRANSFER', str: 'file-transfer' },
    REQJOB_SESSION_CLOSE: { enum: 'REQJOB_SESSION_CLOSE', str: 'session-close' },
    REQJOB_SESSION_TRANSFER: { enum: 'REQJOB_SESSION_TRANSFER', str: 'session-transfer' },
    REQJOB_AGENT_LIST: { enum: 'REQJOB_AGENT_LIST', str: 'agent-list' },
    REQJOB_CLIENT_CONNECTED: { enum: 'REQJOB_CLIENT_CONNECTED', str: 'client-connected' },
    REQJOB_MESSAGE_TO: { enum: 'REQJOB_MESSAGE_TO', str: 'message-to' },
    REQJOB_AGENT_CONNECTED: { enum: 'REQJOB_AGENT_CONNECTED', str: 'agent-connected' },
    REQJOB_CLIENT_DISCONNECTED: { enum: 'REQJOB_CLIENT_DISCONNECTED', str: 'client-disconnected' },
    REQJOB_CANCEL_ONGOING: { enum: 'REQJOB_CANCEL_ONGOING', str: 'cancel-ongoing' },
    REQJOB_MESSAGE_HISTORY: { enum: 'REQJOB_MESSAGE_HISTORY', str: 'message-history' },
    REQJOB_JOIN_CHAT: { enum: 'REQJOB_JOIN_CHAT', str: 'join-chat' },
    REQJOB_INVITE_MEMBER: { enum: 'REQJOB_INVITE_MEMBER', str: 'invite-member' },
    REQJOB_LEAVE_CHAT: { enum: 'REQJOB_LEAVE_CHAT', str: 'leave-chat' },
    REQJOB_DELETE_CHAT: { enum: 'REQJOB_DELETE_CHAT', str: 'delete-chat' },
    REQJOB_START_CONFERENCE: { enum: 'REQJOB_START_CONFERENCE', str: 'start-conference' },
    REQJOB_EDIT_MESSAGE: { enum: 'REQJOB_EDIT_MESSAGE', str: 'edit-message' },
    REQJOB_CREATE_TICKET: { enum: 'REQJOB_CREATE_TICKET', str: 'create-ticket' },
    REQJOB_CLOSE_TICKET: { enum: 'REQJOB_CLOSE_TICKET', str: 'close-ticket' },
    REQJOB_UPDATE_TICKET: { enum: 'REQJOB_UPDATE_TICKET', str: 'update-ticket' },
    REQJOB_TICKET_LIST: { enum: 'REQJOB_TICKET_LIST', str: 'ticket-list' },
    REQJOB_UNSUBSCRIBE: { enum: 'REQJOB_UNSUBSCRIBE', str: 'unsubscribe' },
    REQJOB_START_GROUPCHAT: { enum: 'REQJOB_START_GROUPCHAT', str: 'start-groupchat' },
    REQJOB_FORWARD_MESSAGE: { enum: 'REQJOB_FORWARD_MESSAGE', str: 'forward-message' },
    REQJOB_USER_SIGNUP: { enum: 'REQJOB_USER_SIGNUP', str: 'user-signup' },
    REQJOB_CHAT_LIST: { enum: 'REQJOB_CHAT_LIST', str: 'chat-list' },
    REQJOB_UNKNOWN: { enum: 'REQJOB_UNKNOWN', str: 'unkwn' },
});

const SubscriptionEvents = Object.freeze({
    SUBSEVENT_AGENT_LOGIN: { enum: 'SUBSEVENT_AGENT_LOGIN', str: 'agent-login' },
    SUBSEVENT_AGENT_LOGOUT: { enum: 'SUBSEVENT_AGENT_LOGOUT', str: 'agent-logout' },
    SUBSEVENT_AGENT_SUSPEND: { enum: 'SUBSEVENT_AGENT_SUSPEND', str: 'agent-suspend' },
    SUBSEVENT_AGENT_BREAK: { enum: 'SUBSEVENT_AGENT_BREAK', str: 'agent-break' },
    SUBSEVENT_AGENT_FULL: { enum: 'SUBSEVENT_AGENT_FULL', str: 'agent-full' },
    SUBSEVENT_AGENT_EMPTY: { enum: 'SUBSEVENT_AGENT_EMPTY', str: 'agent-empty' },
    SUBSEVENT_AGENT_HELP_REQ: { enum: 'SUBSEVENT_AGENT_HELP_REQ', str: 'agent-help-req' },
    SUBSEVENT_AGENT_AVAILABLE: { enum: 'SUBSEVENT_AGENT_AVAILABLE', str: 'agent-available' },
    SUBSEVENT_USER_LEFT: { enum: 'SUBSEVENT_USER_LEFT', str: 'user-left' },
    SUBSEVENT_MESSAGE_SEEN: { enum: 'SUBSEVENT_MESSAGE_SEEN', str: 'message-seen' },
    SUBSEVENT_ALL_EVENT: { enum: 'SUBSEVENT_ALL_EVENT', str: 'all-event' },
    SUBSEVENT_UNKNOWN: { enum: 'SUBSEVENT_UNKNOWN', str: 'unkwn' },
});

const InformMethods = Object.freeze({
    INF_METHOD_EMAIL: { enum: 'INF_METHOD_EMAIL', str: 'e-mail' },
    INF_METHOD_SMS: { enum: 'INF_METHOD_SMS', str: 'sms' },
    INF_METHOD_PUSH_NOTIFICATION: { enum: 'INF_METHOD_PUSH_NOTIFICATION', str: 'push-notification' },
    INF_METHOD_UNKNOWN: { enum: 'INF_METHOD_UNKNOWN', str: 'unkwn' },
});


// Control Message class to represent the structure of a control message
class ControlMessage 
{
    constructor({
        type,
        parserObj,
        allData,
        id = null,
        length = null,
        cm = null,
    }) {
        this.type = type;
        this.job = '' ;
        this.event = ''; 
        this.parserObj = parserObj;
        this.allData = allData;
        this.id = id;
        this.length = length;
        this.cm = cm;
    }
}

// File Transfer Request Parameters
class FileTransferReqParams {
    constructor({
        dir,
        fromName = null,
        targetName,
        fname,
        ftype,
        fsize = null,
        fhash,
        fdispos,
        fxferId,
        fcrDate = null,
        fmodDate = null,
        frdDate = null,
    }) {
        this.dir = dir; 
        this.fromName = fromName;
        this.targetName = targetName; 
        this.fname = fname; 
        this.ftype = ftype; 
        this.fsize = fsize;
        this.fhash = fhash; 
        this.fdispos = fdispos; 
        this.fxferId = fxferId; 
        this.fcrDate = fcrDate;
        this.fmodDate = fmodDate;
        this.frdDate = frdDate;
    }
}

// Agent to Agent Request Parameters
class AgentToAgentReqParams 
{
    constructor({ fromName, agentName, reason, realtime }) 
    {
        this.fromName = fromName;
        this.agentName = agentName;
        this.reason = reason;
        this.realtime = realtime;
    }
}

// Session Close Request Parameters
class SessionCloseReqParams 
{
    constructor({ fromName, targetName, reason}) 
    {
        this.fromName = fromName;
        this.targetName = targetName;
        this.reason = reason;
    }
}

// Session Transfer Request Parameters
class SessionTransferReqParams 
{
    constructor({ fromName, targetName, transfereeName, reason, historyAdded }) 
    {
        this.fromName = fromName;
        this.targetName = targetName;
        this.transfereeName = transfereeName;
        this.reason = reason;
        this.historyAdded = historyAdded;
    }
}

// Agent List Request Parameters
class AgentListReqParams 
{
    constructor({ fromName, filter = null, startDate = null, endDate = null }) 
    {
        this.fromName = fromName;
        this.filter = filter;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

// Client Connected Request Parameters
class ClientConnectedReqParams 
{
    constructor({ clientName, keywords = null, secsInQueue }) 
    {
        this.clientName = clientName;
        this.keywords = keywords;
        this.secsInQueue = secsInQueue;
    }
}

// Message To Request Parameters
class MessageToReqParams 
{
    constructor({ fromName, toName, messageToType, messageId }) 
    {
        this.fromName = fromName;
        this.toName = toName;
        this.messageToType = messageToType;
    }
}

// Agent Connected Request Parameters
class AgentConnectedReqParams 
{
    constructor({ agentName }) 
    {
        this.agentName = agentName;
    }
}

// Client Disconnected Request Parameters
class ClientDisconnectedReqParams {
    constructor({ clientName, reason }) 
    {
        this.clientName = clientName;
        this.reason = reason;
    }
}

// Cancel Ongoing Request Parameters
class CancelOngoingReqParams {
    constructor({ jobToCancel, responseRequired = null }) 
    {
        this.jobToCancel = jobToCancel;
        this.responseRequired = responseRequired;
    }
}

// Message History Request Parameters
class MessageHistoryReqParams 
{
    constructor({ toName, fromName, startTime, endTime, chatType }) 
    {
        this.toName = toName;
        this.fromName = fromName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.chatType = chatType;
    }
}

// Join Chatroom Request Parameters
class JoinChatroomReqParams 
{
    constructor({ chatroomId, fromName, chatroomType }) 
    {
        this.chatroomId = chatroomId;
        this.fromName = fromName;
        this.chatroomType = chatroomType;
    }
}

// Invite Member Request Parameters
class InviteMemberReqParams 
{
    constructor({ fromName, toName, chatroomId, chatType }) 
    {
        this.fromName = fromName;
        this.toName = toName;
        this.chatroomId = chatroomId;
        this.chatType = chatType;
    }
}

// Leave Chatroom Request Parameters
class LeaveChatroomReqParams 
{
    constructor({ name, chatId, chatType }) 
    {
        this.name = name;
        this.chatId = chatId;
        this.chatType = chatType;
    }
}

// Delete Chatroom Request Parameters
class DeleteChatroomReqParams 
{
    constructor({ chatId, chatType }) 
    {
        this.chatId = chatId;
        this.chatType = chatType;
    }
}

// Start Conference Request Parameters
class StartConferenceReqParams 
{
    constructor({ fromName, conferenceId, userlist, clientName = null }) 
    {
        this.fromName = fromName;
        this.conferenceId = conferenceId;
        this.userlist = userlist;
        this.clientName = clientName;
    }
}

// Chat List Request Parameters
class ChatListReqParams 
{
    constructor({ fromName, chatType }) 
    {
        this.fromName = fromName;
        this.chatType = chatType;
    }
}

// Create Ticket Request Parameters
class CreateTicketReqParams 
{
    constructor({ creatorName, customerName, priority, category }) 
    {
        this.creatorName = creatorName;
        this.customerName = customerName;
        this.priority = priority;
        this.category = category;
    }
}

// Close Ticket Request Parameters
class CloseTicketReqParams 
{
    constructor({ ticketId }) 
    {
        this.ticketId = ticketId;
    }
}

// Update Ticket Request Parameters
class UpdateTicketReqParams 
{
    constructor({ ticketId, referenceTicketId, status, manager, note }) 
    {
        this.ticketId = ticketId;
        this.referenceTicketId = referenceTicketId;
        this.status = status;
        this.manager = manager;
        this.note = note;
    }
}

// Ticket List Request Parameters
class TicketListReqParams 
{
    constructor({ manager, status }) 
    {
        this.manager = manager;
        this.status = status;
    }
}

// Unsubscribe Request Parameters
class UnsubscribeReqParams 
{
    constructor({ eventKey }) 
    {
        this.eventKey = eventKey;
    }
}

// Start Group Chat Request Parameters
class StartGroupChatReqParams 
{
    constructor({ fromName, groupChatId, userlist }) 
    {
        this.fromName = fromName;
        this.groupChatId = groupChatId;
        this.userlist = userlist;
    }
}

// Message Edit Request Parameters
class MessageEditReqParams 
{
    constructor({ currentMessageId, fromName, toName, chatType, editTime }) 
    {
        this.currentMessageId = currentMessageId;
        this.fromName = fromName;
        this.toName = toName;
        this.chatType = chatType;
    }
}


//File Transfer Response Parameters
class FileTransferRespParams 
{
    constructor({ dir, fromName = null, targetName = null, fname, ftype = null, fsize = null, fhash, fdispos = null, fxferId }) 
    {
        this.dir = dir;
        this.fromName = fromName;
        this.targetName = targetName;
        this.fname = fname; 
        this.ftype = ftype;
        this.fsize = fsize;
        this.fhash = fhash; 
        this.fdispos = fdispos;
        this.fxferId = fxferId;
    }
}

//Agent List Response Parameters
class AgentListRespParams 
{
    constructor({ agentList = [], statusList = [] }) 
    {
        this.agentList = agentList; 
        this.statusList = statusList; 
    }
}

//Message History Response Parameters
class MessageHistoryRespParams 
{
    constructor({ toName = null, fromName = null, startTime = null, endTime = null }) 
    {
        this.toName = toName;
        this.fromName = fromName;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

//Invite Member Response Parameters
class InviteMemberRespParams 
{
    constructor({ member }) 
    {
        this.member = member; 
    }
}

//Chat List Response Parameters
class ChatListRespParams 
{
    constructor({ chatList = [], chatType = null }) 
    {
        this.chatList = chatList; 
        this.chatType = chatType;
    }
}

//Create Ticket Response Parameters
class CreateTicketRespParams 
{
    constructor({ ticketId }) 
    {
        this.ticketId = ticketId;
    }
}

//Start Group Response Parameters
class StartGroupChatRespParams 
{
    constructor({ groupchatId }) 
    {
        this.groupchatId = groupchatId; // group chat ID
    }
}

class NotifyMessage {
    constructor({ sevent, source = '', notifier = '', parms = null }) {
        this.sevent = sevent; 
        this.source = source;
        this.notifier = notifier;
        this.parms = parms; 
    }
}

class NotifySeenParms {
    constructor({ toName = null, seenTime = null, sessKey = null, chatType = null }) 
    {
        this.toName = toName;
        this.seenTime = fromName;
        this.sessKey = startTime;
        this.chatType = endTime;
    }
}

module.exports = {
    CmTypes,
    RequestJobs,
    SubscriptionEvents,
    InformMethods,
    ControlMessage,
    FileTransferReqParams,
    AgentToAgentReqParams,
    SessionCloseReqParams,
    SessionTransferReqParams,
    AgentListReqParams,
    ClientConnectedReqParams,
    MessageToReqParams,
    AgentConnectedReqParams,
    ClientDisconnectedReqParams,
    CancelOngoingReqParams,
    MessageHistoryReqParams,
    JoinChatroomReqParams,
    InviteMemberReqParams,
    LeaveChatroomReqParams,
    DeleteChatroomReqParams,
    StartConferenceReqParams,
    ChatListReqParams,
    CreateTicketReqParams,
    CloseTicketReqParams,
    UpdateTicketReqParams,
    TicketListReqParams,
    UnsubscribeReqParams,
    StartGroupChatReqParams,
    MessageEditReqParams,
    FileTransferRespParams ,
    AgentListRespParams,
    MessageHistoryRespParams,
    InviteMemberRespParams,
    ChatListRespParams,
    CreateTicketRespParams,
    StartGroupChatRespParams ,
    NotifyMessage,
    NotifySeenParms
};
