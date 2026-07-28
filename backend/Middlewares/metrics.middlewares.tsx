import { httpRequests, httpDuration } from '../metrics/globals'

export default function metrics(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000

    const route = req.route?.path || req.path

    httpRequests.inc({
      method: req.method,
      route,
      status: res.statusCode,
    })

    httpDuration.observe(
      {
        method: req.method,
        route,
        status: res.statusCode,
      },
      duration
    )
  })

  next()
}
