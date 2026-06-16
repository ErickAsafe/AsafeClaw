const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const code = process.argv[2];

if (!code) {
  console.log("Por favor, passe o código como argumento.");
  process.exit(1);
}

async function getTokens() {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log('\nSUCESSO! Aqui estão seus tokens:');
    console.log('-----------------------------------');
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('-----------------------------------');
  } catch (err) {
    console.error('Erro ao pegar o token:', err.message);
  }
}

getTokens();
