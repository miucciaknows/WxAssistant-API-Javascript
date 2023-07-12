//Setting the requirements to use Watson Assistant V2 from IBM

const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

//Setting the requirements to use enviroment variables
const dotenv = require("dotenv");
dotenv.config();

// AssistantV2 constructor
const assistant = new AssistantV2({
  version: "2023-05-25", //The version that i'm using, the format is Year/Month/Day
  authenticator: new IamAuthenticator({
    apikey: process.env.api_key,
  }),
  serviceUrl: process.env.url,
});


let sessionId = null;
//I use context to keep the conversation active between user and Watson Assistant
let context = {};

const assistantId = process.env.wa_id

async function createAssistantSession(assistantId) {
  //Setting a new session ID
  try {
    const session = await assistant.createSession({
      assistantId: assistantId
    });
    sessionId = session.result.session_id;
    context = {};
    return sessionId;
  } catch (err) {
    console.error(err);
    throw new Error('Error');
  }
}

async function askAssistantQuestion(question) {
/*   Function to send a question to Watson Assistant. 
  Set maxWaitTime to wait Watson Assistant return all the answers, 
  if i'm using a extesion to search the answer or fill the request i have to wait more to see the full answer. */
  const maxWaitTime = 70000;
  const responses = [];

  const messageInput = {
    messageType: 'text',
    text: question,
  };

  try {
    let response = await assistant.message({
      assistantId: assistantId,
      sessionId,
      input: messageInput,
      context,
    });

    context = response.result.context;
    responses.push(getResponseText(response.result));

    const startTime = Date.now();
    let elapsedTime = 0;

    while (elapsedTime < maxWaitTime && response.result.output.generic.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));

      response = await assistant.message({
        assistantId: assistantId,
        sessionId,
        input: messageInput,
        context,
      });

      elapsedTime = Date.now() - startTime;

      if (response.result.output.generic.length > 0) {
        responses.push(getResponseText(response.result));
      }
    }

    return responses;
  } catch (err) {
    console.error(err);
    throw new Error('Erro ao enviar mensagem');
  }
}

function getResponseText(result) {
  /* Getting WA's answer. I catch everything and then make an array return all that WA returned in that request */
  const responseText = [];

  if (result.output && result.output.generic) {
    result.output.generic.forEach(response => {
      if (response.response_type === 'text') {
        responseText.push(response.text);
      }
    });
  }

  return responseText;
}

module.exports = {
  createAssistantSession,
  askAssistantQuestion,
};