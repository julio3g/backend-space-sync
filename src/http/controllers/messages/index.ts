import { FastifyInstance } from 'fastify'
import { CreateMessageController } from './create'

export async function messagesRoutes(app: FastifyInstance) {
  app.post('/messages', new CreateMessageController().handle)
}
