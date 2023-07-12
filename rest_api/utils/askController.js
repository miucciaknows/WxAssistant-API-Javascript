const assistantService = require('./assistantService.js');


async function askQuestion(req, res) {
  /* Function to send a Question to WA in the POST route /ask */
  const { question } = req.body;

  try {
    const responses = await assistantService.askAssistantQuestion(question);
    res.setHeader('Content-Type', 'application/json');
    res.send({ responses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "There is a error while sending your question to Watson Assistant, please try again!"});
  }
}

module.exports = {
  askQuestion,
};