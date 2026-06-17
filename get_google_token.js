require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets'
];

const code = process.argv[2];

if (!code) {
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  console.log("-----------------------------------");
  console.log("1. Abra o seguinte link no seu navegador para autorizar o acesso:");
  console.log(authorizeUrl);
  console.log("-----------------------------------");
  console.log("2. Após autorizar, você será redirecionado para localhost.");
  console.log("Copie o parâmetro 'code=' da URL e rode:");
  console.log("node get_google_token.js <SEU_CODIGO>");
  process.exit(0);
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
