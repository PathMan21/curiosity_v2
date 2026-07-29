// metrics/globals.js

import client from 'prom-client'

// ============================
// Métriques HTTP Backend
// ============================

// Nombre total de requêtes HTTP
export const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP reçues',
  labelNames: ['method', 'route', 'status_code'],
})

// Temps de réponse HTTP
export const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Temps de réponse des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
})

// ============================
// Erreurs applicatives
// ============================

export const appErrors = new client.Counter({
  name: 'app_errors_total',
  help: 'Nombre total des erreurs applicatives',
  labelNames: ['type'],
})

// Types attendus par Grafana :
// redis_down
// api_timeout
// db_error
// auth_failure

// ============================
// APIs externes
// ============================

export const externalApiCalls = new client.Counter({
  name: 'external_api_calls_total',
  help: 'Nombre total des appels aux APIs externes',
  labelNames: ['source'],
})

// Durée des appels API externes
export const externalApiDuration = new client.Histogram({
  name: 'external_api_duration_seconds',
  help: 'Temps de réponse des APIs externes',
  labelNames: ['source'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
})

// Erreurs API externes
export const externalApiErrors = new client.Counter({
  name: 'external_api_errors_total',
  help: 'Erreurs rencontrées lors des appels APIs externes',
  labelNames: ['source', 'reason'],
})

// reason attendu par Grafana :
// rate_limit
// timeout
// error

// ============================
// Redis Cache
// ============================

export const redisCacheHits = new client.Counter({
  name: 'redis_cache_hits_total',
  help: 'Nombre de réponses servies depuis Redis',
})

export const redisCacheMisses = new client.Counter({
  name: 'redis_cache_misses_total',
  help: 'Nombre de cache miss Redis',
})

export const redisMemoryUsed = new client.Gauge({
  name: 'redis_memory_used_bytes',
  help: 'Mémoire Redis utilisée en bytes',
})

// ============================
// Node.js
// ============================

// Nécessaire pour ton panneau :
// nodejs_eventloop_lag_seconds
//
// Cette métrique est fournie automatiquement
// si tu actives collectDefaultMetrics()

client.collectDefaultMetrics()
