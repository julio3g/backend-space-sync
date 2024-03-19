import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { env } from 'process'
import { ZodError, z } from 'zod'
import { AppError } from './appError'

export const app = fastify()
app.register(multipart)

// app.register(appRoutes)

app.post('/messages', async (request: FastifyRequest, reply: FastifyReply) => {
  const createMessageBodySchema = z.object({
    name: z.string().optional(),
    dateTime: z.date().optional(),
    delayTime: z.number().optional(),
    status: z.string().optional(),
    copywriting: z.string().optional(),
    // files: z.array(
    //   z.object({
    //     name: z.string(),
    //     key: z.string(),
    //     contentType: z.string(),
    //   }),
    // ),
  })

  const { name, dateTime, delayTime, copywriting } =
    createMessageBodySchema.parse(request.body)

  const getFiles = await request.saveRequestFiles()

  // if (getFiles.length === 1) {
  //   console.log(getFiles[0].filename)
  // } else {
  //   console.log(
  //     getFiles.map((file) => ({
  //       name: file.filename,
  //       path: file.filepath,
  //     })),
  //   )
  // }

  const data = {
    name,
    dateTime: new Date(dateTime ?? new Date()),
    delayTime,
    copywriting,
    // files: getFiles.map((file) => ({
    //   name: file.filename,
    //   key: randomUUID().concat('-').concat(file.filename),
    //   contentType: file.mimetype,
    // })),
  }
  // getFiles.map((file) => file.filename)
  return reply.status(201).send(data)
})

app.register(cors, {
  origin: true,
  credentials: true,
})

app.setErrorHandler((error, _, replay) => {
  if (error instanceof ZodError) {
    return replay
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }
  if (error instanceof AppError)
    return replay.status(error.statusCode).send({ message: error.message })
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Here we should log to an external tool like (Datadog/NewRelic/Sentry)
  }

  return replay.status(500).send({ message: 'Internal server Error.' })
})
