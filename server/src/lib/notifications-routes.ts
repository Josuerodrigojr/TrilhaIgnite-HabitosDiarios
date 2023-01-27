import { FastifyInstance } from 'fastify';
import WebPush from 'web-push'
import { z } from 'zod';




const publicKey = 'BIrh8uK08ZWIfTve2LI1_vf7sVLJquApZi9HP6KULUBCMQes3fGW1tKTRG5Oxs1Mb1AHGCqh8g1JF0BnrlXa_Nc'
const privateKey = 'c75ARG1Um6wYTF20vpsQCAGLDWg5EXmpabj1Gvg5Jl4'

WebPush.setVapidDetails(
  'http://localhost:3000',
  publicKey,
  privateKey
)




export async function notificationsRoutes(app:FastifyInstance){
  app.get('/push/public_key', ()=>{
return{
  publicKey
}
  })

  app.post('/push/register', (request,reply)=>{
    return reply.status(201).send()
  })
  
  app.post('/push/send', async(request, reply)=>{
    const sendPushBody = z.object({
subscription: z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  }) 
})
    })

    const {subscription} = sendPushBody.parse(request.body)
    setTimeout(()=>{
      WebPush.sendNotification(subscription, 'Hello do back')
    }, 5000)
    return reply.status(201).send()
  })
}