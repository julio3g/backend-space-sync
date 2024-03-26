import { env } from '@/env'
import cors from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import { randomUUID } from 'crypto'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { createReadStream } from 'fs'
import { writeFile } from 'fs/promises'
import path from 'node:path'
import { ZodError, z } from 'zod'
import { AppError } from './appError'
import { prisma } from './lib/prisma'
import { formatFileName } from './utils/normalizeFile'

export const app = fastify()
app.register(fastifyMultipart)

app.post('/messages', async (request: FastifyRequest, reply: FastifyReply) => {
  const createMessageBodySchema = z.object({
    name: z.string(),
    dateTime: z.coerce.date(),
    delayTime: z.number(),
    copywriting: z.string(),
  })

  const { name, dateTime, delayTime, copywriting } =
    createMessageBodySchema.parse(request.body)

  const message = await prisma.message.create({
    data: {
      name,
      dateTime,
      delayTime,
      copywriting,
    },
  })

  // await

  return reply.status(201).send(message.id)
})

app.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
  const filesData = await request.saveRequestFiles()

  // const allFiles = []

  // for (const file of files) {
  //   const fileKey = `${randomUUID()}-${formatFileName(file.filename)}`
  //   const uploadDestination = path.resolve(__dirname, '../tmp', fileKey)
  //   const readStream = createReadStream(file.filepath)
  //   await writeFile(uploadDestination, readStream)

  //   const all = await prisma.file.create({
  //     data: {
  //       name: file.filename,
  //       key: fileKey,
  //       contentType: file.mimetype,
  //     },
  //   })
  //   allFiles.push(all)
  // }

  const uploadPromises = filesData.map(async (file) => {
    const fileKey = `${randomUUID()}-${formatFileName(file.filename)}`
    const uploadDestination = path.resolve(__dirname, '../tmp', fileKey)
    const readStream = createReadStream(file.filepath)
    await writeFile(uploadDestination, readStream)

    const singleFile = await prisma.file.create({
      data: {
        name: fileKey,
        key: uploadDestination,
        contentType: file.mimetype,
      },
    })

    return { singleFile, fileKey }
  })

  const uploadedFiles = await Promise.all(uploadPromises)

  return reply.status(201).send(uploadedFiles)
})

app.put(
  '/message/:messageId/upload',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const paramsSchema = z.object({
      messageId: z.string().uuid(),
    })
    const { messageId } = paramsSchema.parse(request.params)
  },
)

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
