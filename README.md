# Watson Assistant API

This API provides a service for **Watson Assistant™️** provided by **IBM**, using **Node.js**

**Watson Assistant** combines **machine learning, natural language understanding**, and **an integrated dialog editor** to create **conversation flows between your apps and your users.**

T**AssistantV2 API** provides runtime methods that your client application can use to send user input to an assistant and receive a response.

You can learn more about it in IBM's [documentation](https://cloud.ibm.com/apidocs/assistant-v2?code=node).

## My Watson Assistant

I have created this **Assistant** to provide answers about certain medicines. I use **Watson Assistant**, **Watson Discovery**, and **NeuralSeek**, all available on IBM Cloud.

**Watson Assistant**: Used to build a virtual agent powered by AI.

**Watson Discovery**: Used to search and answer questions about business documents using custom NLP and Large Language Models from IBM Research.

**NeuralSeek**: Connects an existing **knowledge database**(in my case, Watson Discovery) and instantly generates **natural-language answers** to real **customer questions.**

The integration of **Watson Discovery** and **NeuralSeek** are done within **Watson Assistant.** I have [another project](https://github.com/miucciaknows/Medicine-Assistant) that demonstrates how to integrate Watson Assistant with your website, using these features.

I have used the same project to create an API connection.

### Setting up an API connection

This is my Assistant on my **IBM Cloud** Watson Assistant's instance.

-> I'm using a Plus instance to use an extension with [Watson Assistant](https://cloud.ibm.com/docs/assistant?topic=assistant-index). Please note that you need a Plus instance for this.

![Watson Assistant](./images/00.png)

When I made a request to **Watson Assistant** API, I faced an issue where I couldn't retrieve the text in the first request in my development environment. This is because when I send a question to Watson Assistant, it first goes to the "No action matches" node and then searches for the answer using **NeuralSeek.** I have set up **NeuralSeek** to find the answer in my knowledge base (Watson Discovery).

To understand this better, here's an architecture diagram:

![Architecture of my application](./images/02.png)

In the image above, you can see a few steps after sending the answer:

1. Extension called, returns to "No action matches".
2. Receives the answer back from Watson Assistant.

![Receiving the answer from WA](./images/01.png)

When I tried to retrieve the answer from **Watson Assistant**, all I was getting was an empty response because the "Extension called, return to **No action matches**" was the first response. To get the complete answer, I made a few adjustments to my code.

In the `assistantService.js` file, I initialized an empty object:

`let context = {};`

Then, I created `maxWaitTime` to set the time for **Watson Assistant** to provide the answer with more time. Additionally, I created an empty array to store all the answers:

`const maxWaitTime = 70000;
const responses = [];`

Following that, the code updates the conversation context with the context received from the Assistant's response and pushes the response text to the array:

`context = response.result.context;
responses.push(getResponseText(response.result));`

Next, the code records the start time and calculates the elapsed time. It then enters a loop that continues as long as the elapsed time is within the maximum wait time and the Assistant's response has no generic output.

``context = response. result. context;
responses.push (getResponseText (response.result));
const startTime = Date. now ();
let elapsedTime = 0;
while (elapsedTime < maxWaitTime && response.result.output.generic.length === 0) {
await new Promise(resolve => setTimeout (resolve, 100));`

After adds a short delay between each iteration of the loop to avoid excessive requests, it sends a new message to Assistant service and updates the response.

And finally, on the last line calculates the elapsed time based on the start time and the current timestamp.

`context = response. result. context;
responses.push (getResponseText (response.result));
const startTime = Date. now ();
let elapsedTime = 0;
while (elapsedTime < maxWaitTime && response.result.output.generic.length === 0) {
await new Promise(resolve => setTimeout (resolve, 100));
response = await assistant.message ({
assistantId: assistantId, sessionId, input: messageInput, context,
});
elapsedTime = Date.now() - startTime;`

if response has any generic output messages, and if there are any, it pushes the text from those messages into an array called `responses`. And it returns the `responses` array.

`if (response. result.output. generic. length > 0) {
responses.push (getResponseText (response.result));
}
}
return responses;`

And the last ppart of the code, it extracts the response text from the Watson Assistant `result` object. Then it iterates through the generic output messages and, if a message has a response type of 'text', it pushes the text content of that message into an array called `responseText`. Finally, returns the `responseText` array.

`const responseText = [];
if (result.output && result.output.generic) {
result.output.generic. forEach (response => {
if (response. response_type === 'text') {
responseText. push (response. text) ;
}
});
}
return responseText;`
