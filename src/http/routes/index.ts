import { FastifyInstance } from 'fastify'
import { createUploadMessage } from './create-upload-message'

export async function appRoutes(app: FastifyInstance) {
  // app.register(messagesRoutes)
  app.register(createUploadMessage)
}
