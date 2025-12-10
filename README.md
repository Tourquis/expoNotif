# Expo Push Notifications - Monorepo

Monorepo complet pour développer une application mobile Expo avec notifications push, incluant un backend Express et un panel d'administration web.

## 📋 Table des matières

- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Scripts disponibles](#scripts-disponibles)
- [Test des notifications](#test-des-notifications)
- [Structure des dossiers](#structure-des-dossiers)
- [Configuration](#configuration)

## 🏗️ Structure du projet

```
expoNotif/
├── mobile/          # Application Expo React Native
├── backend/         # Backend Express avec API Expo Push
├── admin/           # Panel admin web (HTML/JS/CSS)
├── scripts/         # Scripts utilitaires
└── credentials/     # Fichiers de credentials (non commités)
```

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v16 ou supérieur)
- **pnpm** (`npm install -g pnpm`)
- **Expo CLI** (optionnel, vous pouvez utiliser `npx expo`)
- **Compte Expo** (gratuit) - [Créer un compte](https://expo.dev/signup)
- **Python 3** (pour le serveur admin, généralement déjà installé)

## 🚀 Installation

1. **Cloner le dépôt** (si vous ne l'avez pas déjà fait) :

```bash
git clone https://github.com/Tourquis/expoNotif.git
cd expoNotif
```

2. **Installer les dépendances** :

```bash
pnpm install
```

Cela installera automatiquement les dépendances pour tous les workspaces (mobile, backend, admin).

## 📜 Scripts disponibles

### Application Mobile

```bash
# Démarrer en mode développement
pnpm mobile

# Réinitialiser le cache
pnpm mobile:reset

# Réinitialiser le projet (supprime app-example)
pnpm mobile:reset-project
```

### Prebuild et Build

Pour tester les notifications push, vous devez créer un build ou dev build de l'application. Voici les étapes :

#### Option 1 : Dev Build (Recommandé pour le développement)

Un dev build permet de tester les notifications push avec le client de développement Expo :

1. **Installer EAS CLI** (si ce n'est pas déjà fait) :

```bash
npm install -g eas-cli
```

2. **Se connecter à votre compte Expo** :

```bash
eas login
```

3. **Créer un dev build** :

```bash
cd mobile
eas build --profile development --platform android
# ou pour iOS :
eas build --profile development --platform ios
```

4. **Installer le build** : Une fois le build terminé, téléchargez et installez l'APK (Android) ou l'IPA (iOS) sur votre appareil physique.

#### Option 2 : Prebuild local (Pour développement local)

Si vous préférez générer les fichiers natifs localement :

1. **Générer les fichiers natifs** :

```bash
cd mobile
npx expo prebuild
```

2. **Compiler et installer localement** :

```bash
# Pour Android
npx expo run:android

# Pour iOS (sur Mac uniquement)
npx expo run:ios
```

> 💡 **Note** : Le prebuild génère les dossiers `android/` et `ios/` dans le dossier `mobile/`. Ces dossiers sont généralement ignorés par Git.

#### Option 3 : Build de production

Pour créer un build de production :

```bash
cd mobile
eas build --profile production --platform android
# ou pour iOS :
eas build --profile production --platform ios
```

Les profils de build sont configurés dans `mobile/eas.json` :

- `development` : Build avec client de développement
- `preview` : Build APK pour test interne
- `production` : Build de production

### Backend

```bash
# Démarrer le serveur backend
pnpm backend
```

### Panel Admin

```bash
# Démarrer le serveur admin
pnpm admin
```

### Utilitaires

```bash
# Servir l'APK de debug pour téléchargement
pnpm serve-apk
```

Accédez ensuite à `http://localhost:3001` pour télécharger l'APK.

## 📱 Test des notifications

> ⚠️ **Important** : Pour tester les notifications push, il est **impératif** d'utiliser :
>
> - Un **appareil physique** avec un **build** ou **dev build** installé
> - **Expo Go n'est pas recommandé** pour les notifications push (limitations de compatibilité)
> - Les notifications push ne fonctionnent pas sur le web

### Étapes de test

1. **Démarrer le backend** : `pnpm backend` (doit être sur `http://localhost:3000`)
2. **Démarrer l'app mobile** : `pnpm mobile` (sur un build ou dev build installé)
3. **Démarrer le panel admin** : `pnpm admin` (recommandé pour envoyer des notifications)
4. **Obtenir le token** : Dans l'app mobile, appuyez sur "Obtenir le Token"
   - Le token est automatiquement enregistré dans le backend
   - Vérifiez dans le terminal du backend : `Token enregistré: ExpoPushToken[...]`
5. **Envoyer une notification** :
   - **Via le panel admin** (recommandé) : Ouvrez `http://localhost:8080`, remplissez le formulaire et cliquez sur "Envoyer à tous"
   - **Via l'API REST** : `POST http://localhost:3000/send` avec `{"title": "...", "message": "..."}`

### Configuration de l'URL du backend

#### Pour un téléphone physique

1. Trouvez votre IP locale :

   - **Windows** : `ipconfig` (cherchez "Adresse IPv4")
   - **Mac/Linux** : `ifconfig` ou `ip addr` (généralement `192.168.x.x`)

2. Modifiez `mobile/utils/api.ts` :

```typescript
export const BACKEND_URL = "http://192.168.1.XXX:3000"; // Remplacez par votre IP locale
```

3. Assurez-vous que votre téléphone et votre ordinateur sont sur le même réseau Wi-Fi

## 📂 Structure des dossiers

### `/mobile`

Application Expo React Native avec :

- Gestion des notifications push
- Interface de test des notifications
- Configuration Expo

### `/backend`

Serveur Express qui fournit :

- API REST pour enregistrer les tokens
- API REST pour envoyer des notifications
- Stockage des tokens dans `tokens.json`

### `/admin`

Panel d'administration web simple avec :

- Formulaire pour envoyer des notifications
- Liste des tokens enregistrés
- Interface HTML/CSS/JS vanilla

### `/scripts`

Scripts utilitaires :

- `serve-apk.js` : Serveur HTTP pour télécharger l'APK de debug

### `/credentials`

Fichiers de credentials (non commités) :

- Fichiers Firebase Admin SDK
- Fichiers de configuration sensibles

## ⚙️ Configuration

### Project ID Expo

Le Project ID Expo est configuré dans `mobile/app.json` :

```json
{
  "extra": {
    "eas": {
      "projectId": "0e4fa2f8-5378-47c0-adb0-df1c76938a2e"
    }
  }
}
```

### URL du Backend

Par défaut, l'URL du backend est configurée dans `mobile/utils/api.ts` :

```typescript
export const BACKEND_URL = "http://localhost:3000";
```

Pour un téléphone physique, remplacez `localhost` par votre IP locale.

### Ports utilisés

- **Backend** : `3000`
- **Panel Admin** : `8080`
- **Serveur APK** : `3001`

## 📚 API Backend

### Endpoints disponibles

#### `POST /tokens`

Enregistre un token push.

**Body** :

```json
{
  "token": "ExpoPushToken[...]"
}
```

#### `GET /tokens`

Liste tous les tokens enregistrés.

**Response** :

```json
{
  "tokens": ["ExpoPushToken[...]", ...],
  "count": 2
}
```

#### `POST /send`

Envoie une notification.

**Body** :

```json
{
  "title": "Titre de la notification",
  "message": "Message de la notification",
  "token": "ExpoPushToken[...]" // optionnel, si absent envoie à tous
}
```

#### `GET /health`

Vérifie l'état du serveur.

## 🐛 Dépannage

### Les notifications ne sont pas reçues

1. Vérifiez que l'application est lancée sur un **appareil physique avec un build ou dev build** (pas Expo Go)
2. Vérifiez que les permissions de notification sont accordées
3. Vérifiez que le token est bien enregistré dans le backend (via le panel admin ou `GET http://localhost:3000/tokens`)
4. Vérifiez que le backend et le panel admin sont démarrés
5. Vérifiez les logs du backend pour voir les erreurs
6. Pour un téléphone physique, vérifiez que l'URL du backend est correctement configurée avec votre IP locale

### Erreur de connexion au backend

1. Vérifiez que le backend est démarré sur le port 3000
2. Vérifiez l'URL dans `mobile/utils/api.ts`
3. Pour un téléphone physique, utilisez l'IP locale au lieu de `localhost` et assurez-vous que le téléphone et l'ordinateur sont sur le même réseau Wi-Fi
4. Vérifiez que le firewall n'bloque pas le port 3000

### Erreur "Project ID non trouvé"

Assurez-vous que le `projectId` est configuré dans `mobile/app.json`.

## 📖 Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notification Tool](https://expo.dev/notifications)

## 📝 Notes importantes

- **Les notifications push nécessitent impérativement un appareil physique** avec un **build** ou **dev build** installé
- **Expo Go n'est pas recommandé** pour tester les notifications push (limitations de compatibilité)
- Les notifications push nécessitent un Project ID Expo configuré
- **Il est recommandé d'utiliser le panel admin et le backend** pour envoyer des notifications push
- Les notifications locales fonctionnent sans backend ni Project ID
- Le token est unique par appareil et peut changer si vous réinstallez l'application

## 🤝 Contribution

Ce projet est un monorepo utilisant pnpm workspaces. Assurez-vous d'utiliser `pnpm` et non `npm` pour toutes les opérations.

## 📄 Licence

MIT

---

**Développé avec ❤️ par [Tourquis](https://github.com/Tourquis) en utilisant Expo, React Native et Express**
