const BACKEND_URL = 'http://localhost:3000';

// Éléments du DOM
const notificationForm = document.getElementById('notificationForm');
const titleInput = document.getElementById('title');
const messageInput = document.getElementById('message');
const tokenInput = document.getElementById('token');
const sendAllBtn = document.getElementById('sendAllBtn');
const sendOneBtn = document.getElementById('sendOneBtn');
const refreshTokensBtn = document.getElementById('refreshTokensBtn');
const resultDiv = document.getElementById('result');
const tokensListDiv = document.getElementById('tokensList');

// Charger les tokens au démarrage
loadTokens();

// Gestion du formulaire
notificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendNotification(false);
});

// Bouton envoyer à tous
sendAllBtn.addEventListener('click', async () => {
    await sendNotification(false);
});

// Bouton envoyer à un token spécifique
sendOneBtn.addEventListener('click', async () => {
    if (!tokenInput.value.trim()) {
        showResult('Veuillez entrer un token', 'error');
        return;
    }
    await sendNotification(true);
});

// Bouton rafraîchir les tokens
refreshTokensBtn.addEventListener('click', () => {
    loadTokens();
});

// Fonction pour envoyer une notification
async function sendNotification(sendToSpecificToken) {
    const title = titleInput.value.trim();
    const message = messageInput.value.trim();
    const token = tokenInput.value.trim();

    if (!title || !message) {
        showResult('Veuillez remplir le titre et le message', 'error');
        return;
    }

    if (sendToSpecificToken && !token) {
        showResult('Veuillez entrer un token', 'error');
        return;
    }

    // Désactiver les boutons pendant l'envoi
    sendAllBtn.disabled = true;
    sendOneBtn.disabled = true;
    sendAllBtn.textContent = 'Envoi en cours...';
    sendOneBtn.textContent = 'Envoi en cours...';

    try {
        const payload = {
            title,
            message,
        };

        if (sendToSpecificToken) {
            payload.token = token;
        }

        const response = await fetch(`${BACKEND_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            showResult(
                `Notification envoyée avec succès! ${data.sent} notification(s) envoyée(s)${data.errors > 0 ? ` (${data.errors} erreur(s))` : ''}`,
                'success'
            );
            // Réinitialiser le formulaire
            notificationForm.reset();
        } else {
            showResult(`Erreur: ${data.error || 'Erreur inconnue'}`, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showResult('Erreur de connexion au backend. Vérifiez que le serveur est démarré.', 'error');
    } finally {
        // Réactiver les boutons
        sendAllBtn.disabled = false;
        sendOneBtn.disabled = false;
        sendAllBtn.textContent = 'Envoyer à tous';
        sendOneBtn.textContent = 'Envoyer au token spécifique';
    }
}

// Fonction pour charger la liste des tokens
async function loadTokens() {
    try {
        const response = await fetch(`${BACKEND_URL}/tokens`);
        const data = await response.json();

        if (response.ok) {
            displayTokens(data.tokens);
        } else {
            tokensListDiv.innerHTML = '<div class="empty-state">Erreur lors du chargement des tokens</div>';
        }
    } catch (error) {
        console.error('Erreur:', error);
        tokensListDiv.innerHTML = '<div class="empty-state">Erreur de connexion au backend. Vérifiez que le serveur est démarré.</div>';
    }
}

// Fonction pour afficher les tokens
function displayTokens(tokens) {
    if (tokens.length === 0) {
        tokensListDiv.innerHTML = '<div class="empty-state">Aucun token enregistré</div>';
        return;
    }

    tokensListDiv.innerHTML = tokens
        .map(
            (token, index) => `
        <div class="token-item">
            <strong>Token ${index + 1}:</strong><br>
            ${token}
        </div>
    `
        )
        .join('');
}

// Fonction pour afficher un message de résultat
function showResult(message, type) {
    resultDiv.textContent = message;
    resultDiv.className = `result ${type}`;
    
    // Masquer le message après 5 secondes
    setTimeout(() => {
        resultDiv.className = 'result';
    }, 5000);
}













