import client from 'prom-client'

client.collectDefaultMetrics()

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
})

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Temps de réponse HTTP',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
})

export { httpDuration, httpRequests }
