import { createClient } from 'redis'

const redisClient = createClient({
  socket: {
    host: 'redis',
    port: 6379,
  },
})

redisClient.on('error', (err) => console.error('Redis Error :', err))
redisClient.on('connect', () => console.log('Redis connecté'));

(async () => {
  try {
    await redisClient.connect()
  } catch (error) {
    console.error('Impossible de se connecter à Redis : ', error)
  }
})()

export default redisClient
