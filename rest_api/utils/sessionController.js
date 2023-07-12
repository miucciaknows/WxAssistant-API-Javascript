const assistantService = require('./assistantService.js');

const dotenv = require ("dotenv");

dotenv.config();

const assistantId = process.env.wa_id;


async function createSession(req, res) {
  /* Setting a Session to WA */
  try {
    const sessionId = await assistantService.createAssistantSession(assistantId);
    res.json({ sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "There is a problem while creating a new session. " });
  }
}

module.exports = {
  createSession,
};