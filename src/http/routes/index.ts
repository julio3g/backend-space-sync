import { FastifyInstance } from 'fastify'
import { messagesRoutes } from '../controllers/messages'

export async function appRoutes(app: FastifyInstance) {
  app.register(messagesRoutes)
}
