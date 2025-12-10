const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Expo } = require('expo-server-sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const TOKENS_FILE = path.join(__dirname, 'tokens.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialiser le client Expo
const expo = new Expo();

// Fonction pour lire les tokens depuis le fichier JSON
function readTokens() {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const data = fs.readFileSync(TOKENS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la lecture des tokens:', error);
    return [];
  }
}

// Fonction pour écrire les tokens dans le fichier JSON
function writeTokens(tokens) {
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (error) {
    console.error('Erreur lors de l\'écriture des tokens:', error);
  }
}

// Endpoint pour enregistrer un token
app.post('/tokens', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token manquant' });
  }

  // Vérifier que le token est valide
  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: 'Token Expo invalide' });
  }

  const tokens = readTokens();
  
  // Éviter les doublons
  if (!tokens.includes(token)) {
    tokens.push(token);
    writeTokens(tokens);
    console.log(`Token enregistré: ${token.substring(0, 20)}...`);
  }

  res.json({ success: true, message: 'Token enregistré' });
});

// Endpoint pour lister tous les tokens
app.get('/tokens', (req, res) => {
  const tokens = readTokens();
  res.json({ tokens, count: tokens.length });
});

// Endpoint pour envoyer une notification
app.post('/send', async (req, res) => {
  const { title, message, token } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Titre et message requis' });
  }

  let targetTokens = [];

  if (token) {
    // Envoyer à un token spécifique
    if (!Expo.isExpoPushToken(token)) {
      return res.status(400).json({ error: 'Token Expo invalide' });
    }
    targetTokens = [token];
  } else {
    // Envoyer à tous les tokens enregistrés
    targetTokens = readTokens();
  }

  if (targetTokens.length === 0) {
    return res.status(400).json({ error: 'Aucun token disponible' });
  }

  // Créer les messages de notification
  const messages = targetTokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: message,
      data: { timestamp: new Date().toISOString() },
    }));

  // Envoyer les notifications via l'API Expo
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  try {
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
      }
    }

    // Vérifier les erreurs dans les tickets
    const errors = tickets.filter(ticket => ticket.status === 'error');
    if (errors.length > 0) {
      console.error('Erreurs dans les tickets:', errors);
    }

    res.json({
      success: true,
      message: `${messages.length} notification(s) envoyée(s)`,
      sent: messages.length,
      errors: errors.length,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi des notifications' });
  }
});

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});













