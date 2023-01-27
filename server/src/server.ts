import Fastify from 'fastify'
import cors from '@fastify/cors'
import { appRoutes } from './lib/routes'
import { notificationsRoutes } from './lib/notifications-routes'




const app = Fastify()


app.register(cors)
app.register(appRoutes)
app.register(notificationsRoutes)


app.listen({
  port: 3000,  
  host: '0.0.0.0',
}).then(() => {
  console.log('Servidor rodando na porta 3000!!!')
})