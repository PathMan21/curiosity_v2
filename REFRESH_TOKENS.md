# Gestion des Refresh Tokens

## 📋 Résumé des changements

### Backend

#### 1. **Modèle User** (`backend/Models/User.tsx`)
- Ajout du champ `refreshToken` pour stocker les refresh tokens en base de données
- Type: `TEXT`, nullable

#### 2. **Contrôleur User** (`backend/Controllers/user.controllers.tsx`)
- Nouvelle fonction `generateTokens()` pour créer access token (15m) et refresh token (7j)
- Mise à jour de `loginUser()` pour utiliser les nouveaux tokens
- Nouvelle fonction `refreshTokenHandler()` pour valider et générer de nouveaux tokens

#### 3. **Routes User** (`backend/Routes/user.routes.tsx`)
- Nouvelle route: `POST /api/users/refresh-token` - Rafraîchit l'access token

#### 4. **Contrôleur OAuth** (`backend/Controllers/oauth.controllers.tsx`)
- Utilisation de la fonction `generateTokens()`
- Stockage du refresh token en base de données
- Mise à jour des redirects et réponses pour inclure le refresh token

### Frontend

#### 1. **Service API** (`frontend/src/Services/apiClient.ts`) - NEW
- Fonction `fetchWithAuth()` : Fetch avec gestion automatique des refresh tokens
- Gestion des erreurs 401 avec tentative de refresh automatique
- Fonction `apiCall()` : Wrapper pour les requêtes typées

#### 2. **AuthContext** (`frontend/src/Context/AuthContext.tsx`)
- Gestion du `refreshToken` en localStorage
- Mise à jour de `login()` pour stocker les deux tokens
- Mise à jour de `logout()` pour supprimer les deux tokens
- Mise à jour de `setToken()` pour gérer le refresh token

#### 3. **Hook Auto-Refresh** (`frontend/src/Hooks/useAutoRefreshToken.ts`) - NEW
- Décodes automatiquement le JWT pour obtenir l'heure d'expiration
- Rafraîchit le token 1 minute avant son expiration
- Gère les erreurs et la déconnexion en cas d'échec

#### 4. **TokenLoader** (`frontend/src/Pages/Auth/TokenLoader.tsx`)
- Mise à jour pour capturer et stocker le refresh token reçu du OAuth

#### 5. **App** (`frontend/src/App.tsx`)
- Utilisation du hook `useAutoRefreshToken()` pour le refresh automatique global
- Restructuration pour que le hook soit appelé à l'intérieur de l'AuthProvider

## 🔄 Flux d'authentification

### Login classique
```
1. User POST /api/users/login { email, password }
2. Backend génère accessToken (15m) + refreshToken (7j)
3. Backend stocke refreshToken en base
4. Frontend reçoit les deux tokens
5. Tokens stockés en localStorage
```

### Refresh automatique du token
```
1. Hook useAutoRefreshToken() décodes le JWT
2. Calcule le temps avant expiration
3. Planifie un refresh 1 minute avant expiration
4. POST /api/users/refresh-token { refreshToken }
5. Backend valide le refresh token et génère un nouveau access token
6. Frontend met à jour les tokens stockés
```

### Refresh sur erreur 401
```
1. Requête retourne 401
2. fetchWithAuth() détecte l'erreur
3. Essaie de refresh avec le refreshToken
4. Si succès : reessaye la requête originale avec nouveau token
5. Si échec : déconnecte l'user et redirige vers /login
```

## 🔑 Variables d'environnement requises

**Backend**
```env
ACCESS_TOKEN_SECRET=votre_secret_access_token
REFRESH_TOKEN_SECRET=votre_secret_refresh_token
```

## 📝 Variables de stockage

**localStorage**
```javascript
authToken        // Access token JWT (15 minutes)
refreshToken     // Refresh token JWT (7 jours)
```

## ✅ Avantages

- ✓ Access token de courte durée (15m) = sécurité renforcée
- ✓ Refresh token de longue durée (7j) = meilleure UX
- ✓ Refresh automatique = pas de déconnexion surprise
- ✓ Gestion des 401 = retry automatique transparent
- ✓ Validation côté serveur = tokens ne peuvent pas être réutilisés

## 🚀 Utilisation du service API

```typescript
import { apiCall, fetchWithAuth } from '@/Services/apiClient';

// Utiliser apiCall pour les requêtes typées
const user = await apiCall<User>('/users/profile');

// Utiliser fetchWithAuth pour plus de contrôle
const response = await fetchWithAuth('/users/profile', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

Les tokens seront automatiquement:
- Inclus dans les headers
- Rafraîchis avant expiration
- Rafraîchis en cas d'erreur 401
