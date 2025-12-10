// Configuration de l'URL du backend
// En développement, utilisez l'IP locale de votre machine pour que le téléphone puisse y accéder
// Exemple: http://192.168.1.100:3000
// Sur émulateur Android, utilisez: http://10.0.2.2:3000
// Sur émulateur iOS, utilisez: http://localhost:3000

// IMPORTANT: Pour tester sur un téléphone physique, remplacez 'localhost' par votre IP locale
// Trouvez votre IP avec: ipconfig (Windows) ou ifconfig (Mac/Linux)
// Exemple: 'http://192.168.1.100:3000'
export const BACKEND_URL = "http://localhost:3000";

// Fonction pour enregistrer un token dans le backend
export async function registerToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erreur lors de l'enregistrement du token:", error);
      return false;
    }

    const data = await response.json();
    console.log("✅ Token enregistré dans le backend:", data.message);
    return true;
  } catch (error) {
    console.error("Erreur de connexion au backend:", error);
    return false;
  }
}
