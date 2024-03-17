import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastify from 'fastify'
import { appRoutes } from './http/routes'

export const app = fastify()
app.register(multipart)

app.register(appRoutes)

app.register(cors, {
  origin: true,
  credentials: true,
})
