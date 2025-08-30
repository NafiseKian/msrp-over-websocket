/*
** file : control message builder under java script 
** author : Nafise Kian
** date : August 2024
*/

const encoder = (data) => JSON.stringify(data, null, 4);

//this helper function is going to help us parse the parameters 
const parseParameters = (param) => {
  const params = {};
  const pairs = param.split(',');

  pairs.forEach(pair => {
    const [key, value] = pair.split(':').map(item => item.trim());
    if (key && value) {
      if (!isNaN(Number(value))) {
        params[key] = Number(value);
      } else if (value.toLowerCase() === 'true') {
        params[key] = true;
      } else if (value.toLowerCase() === 'false') {
        params[key] = false;
      } else {
        params[key] = value;
      }
    }
  });

  return params;
};


const createRequestControlMessage = (id, job, param) => {
  const params = parseParameters(param);
  const message = {
    id: id,
    type: 'request',
    job: job,
    parameters: params,
  };
  return encoder(message);
};

const createRequestControlMessageReadyParam = (id, job, params) => {
  const message = {
    id: id,
    type: 'request',
    job: job,
    parameters: params,
  };
  return encoder(message);
};

const createSubscribeControlMessage = (id,event,name,targetUser,expire,informMethod) => {
  const message = {
    id: id,
    type: 'subscribe',
    event: event,
    subscriber: name,
    'target-user': targetUser,
    expire: expire,
    'inform-method': informMethod,
  };
  return encoder(message);
};

const createNotifyControlMessage = (id, event, name) => {
  const message = {
    id: id,
    type: 'notify',
    event: event,
    name: name,
  };
  return encoder(message);
};

const createPublishControlMessage = (id, eventName, identity, param) => {
  const params = parseParameters(param);
  const message = {
    id: id,
    type: 'publish',
    event: eventName,
    publisher: identity,
    parameters: params,
  };
  return encoder(message);
};

const createUpdateControlMessage = (id, param) => {
  const params = parseParameters(param);
  const message = {
    id: id,
    type: 'update',
    parameters: params,
  };
  return encoder(message);
};

const createResponseControlMessage = (id,responseTo,detail,resultCode,resultText,param) => {
  const params = parseParameters(param);
  const message = {
    id: id,
    type: 'response',
    'response-to': responseTo,
    detail: detail,
    'result-code': resultCode,
    'result-text': resultText,
    parameters: params,
  };
  return encoder(message);
};

const createResponseControlMessageReadyParams = (id,responseTo,detail,resultCode,resultText,params) => {
  const message = {
    id: id,
    type: 'response',
    'response-to': responseTo,
    detail: detail,
    'result-code': resultCode,
    'result-text': resultText,
    parameters: params,
  };
  return encoder(message);
};

module.exports = {
  createRequestControlMessage,
  createRequestControlMessageReadyParam,
  createSubscribeControlMessage,
  createNotifyControlMessage,
  createPublishControlMessage,
  createUpdateControlMessage,
  createResponseControlMessage,
  createResponseControlMessageReadyParams,
};
