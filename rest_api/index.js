const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const sessionController = require('./utils/sessionController.js');
const askController = require('./utils/askController.js');

// Rota para criar uma sessão
app.get('/session', sessionController.createSession);

// Rota para receber as perguntas
app.post('/ask', askController.askQuestion);

// Iniciar o servidor
const port = 3000;

app.listen(port, () => {
  console.log(`Localhost: ${port}`);
});