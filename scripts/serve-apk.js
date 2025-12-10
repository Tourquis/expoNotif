const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

// Chemin vers l'APK de debug
const APK_PATH = path.join(
  __dirname,
  "../mobile/android/app/build/outputs/apk/debug/app-debug.apk"
);

// Middleware pour servir les fichiers statiques
app.use(express.static(path.dirname(APK_PATH)));

// Route principale pour afficher les informations de téléchargement
app.get("/", (req, res) => {
  const apkExists = fs.existsSync(APK_PATH);

  if (!apkExists) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>APK Debug - Non trouvé</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .error {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 20px;
            border-radius: 4px;
          }
          code {
            background: #e0e0e0;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="error">
          <h2>APK Debug non trouvé</h2>
          <p>Le fichier APK de debug n'existe pas à l'emplacement suivant :</p>
          <p><code>${APK_PATH}</code></p>
          <p>Veuillez d'abord compiler l'application Android en mode debug.</p>
        </div>
      </body>
      </html>
    `);
  }

  const stats = fs.statSync(APK_PATH);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const modifiedDate = stats.mtime.toLocaleString("fr-FR");

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Télécharger APK Debug</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          padding: 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
          font-size: 28px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: left;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .info-item:last-child {
          border-bottom: none;
        }
        .info-label {
          color: #666;
          font-weight: 500;
        }
        .info-value {
          color: #333;
          font-weight: 600;
        }
        .download-btn {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .download-btn:active {
          transform: translateY(0);
        }
        .qr-instruction {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #666;
          font-size: 13px;
        }
        code {
          background: #e0e0e0;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📱 APK Debug</h1>
        <p class="subtitle">ExpoNotif - Version Debug</p>
        
        <div class="info">
          <div class="info-item">
            <span class="info-label">Taille du fichier</span>
            <span class="info-value">${fileSizeMB} MB</span>
          </div>
          <div class="info-item">
            <span class="info-label">Dernière modification</span>
            <span class="info-value">${modifiedDate}</span>
          </div>
        </div>

        <a href="/app-debug.apk" class="download-btn" download>
          ⬇️ Télécharger l'APK
        </a>

        <div class="qr-instruction">
          <p><strong>Instructions :</strong></p>
          <p>1. Scannez ce QR code avec votre téléphone</p>
          <p>2. Ou ouvrez cette URL sur votre téléphone :</p>
          <p><code>http://${getLocalIP()}:${PORT}</code></p>
          <p>3. Autorisez l'installation depuis des sources inconnues</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Route pour télécharger l'APK
app.get("/app-debug.apk", (req, res) => {
  if (!fs.existsSync(APK_PATH)) {
    return res.status(404).json({ error: "APK non trouvé" });
  }

  res.download(APK_PATH, "app-debug.apk", (err) => {
    if (err) {
      console.error("Erreur lors du téléchargement:", err);
      res.status(500).json({ error: "Erreur lors du téléchargement" });
    }
  });
});

// Fonction pour obtenir l'adresse IP locale
function getLocalIP() {
  const os = require("os");
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

app.listen(PORT, "0.0.0.0", () => {
  const localIP = getLocalIP();
  console.log("\n🚀 Serveur APK démarré !");
  console.log(`📱 Accès local: http://localhost:${PORT}`);
  console.log(`📱 Accès réseau: http://${localIP}:${PORT}`);
  console.log(
    `\n💡 Scannez le QR code ou ouvrez l'URL sur votre téléphone pour télécharger l'APK\n`
  );
});
