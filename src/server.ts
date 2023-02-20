import { app } from './app'
import { env } from './env'

app
  .listen({
    port: env.PORT,
  })
  .then((address) => {
    console.log(`Server running on ${address}`)
  })
