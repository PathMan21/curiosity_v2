const API_URL = "http://localhost:3000/api";

// Interface pour la réponse de refresh token
interface RefreshResponse {
  status: string;
  accessToken: string;
  refreshToken: string;
}

// Interface pour les erreurs API
interface ApiError extends Error {
  status: number;
}

/**
 * Effectue un fetch avec gestion automatique des refresh tokens
 */
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // Ajouter le token au header si disponible
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...options,
    headers,
  };

  let response = await fetch(`${API_URL}${endpoint}`, mergedOptions);

  // Si 401 (unauthorized), essayer de rafraîchir le token
  if (response.status === 401 && refreshToken) {
    try {
      const refreshed = await refreshAccessToken(refreshToken);
      
      // Mettre à jour les tokens
      localStorage.setItem("authToken", refreshed.accessToken);
      localStorage.setItem("refreshToken", refreshed.refreshToken);

      // Réessayer la requête avec le nouveau token
      headers.Authorization = `Bearer ${refreshed.accessToken}`;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...mergedOptions,
        headers,
      });
    } catch (error) {
      // Si le refresh échoue, supprimer les tokens et rediriger vers login
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw error;
    }
  }

  return response;
};

/**
 * Rafraîchit l'access token
 */
const refreshAccessToken = async (refreshToken: string): Promise<RefreshResponse> => {
  const response = await fetch(`${API_URL}/users/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Impossible de rafraîchir le token");
  }

  return response.json();
};

/**
 * Wrapper fetch standard pour les requêtes sans authentification
 */
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithAuth(endpoint, options);

  if (!response.ok) {
    const error: ApiError = new Error(
      `Erreur API: ${response.status}`
    ) as ApiError;
    error.status = response.status;
    throw error;
  }

  return response.json();
};
