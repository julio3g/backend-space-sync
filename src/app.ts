import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { randomUUID } from 'crypto'
import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { env } from 'process'
import { ZodError, z } from 'zod'
import { AppError } from './appError'
import { r2 } from './lib/cloudflare'
import { prisma } from './lib/prisma'

export const app = fastify()
app.register(multipart)

app.post('/messages', async (request: FastifyRequest, reply: FastifyReply) => {
  const createMessageBodySchema = z.object({
    name: z.string(),
    dateTime: z.coerce.date(),
    delayTime: z.number(),
    copywriting: z.string(),
  })

  const { name, dateTime, delayTime, copywriting } =
    createMessageBodySchema.parse(request.body)

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
  const messageIdGenerator = randomUUID()
  const files = await request.saveRequestFiles()

  const allFiles = await Promise.all(
    files.map(async ({ filename, mimetype }) => {
      const fileKey = `${randomUUID()}-${filename}`
      const signedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: 'space-sync-dev',
          Key: fileKey,
          ContentType: mimetype,
        }),
        { expiresIn: 600 },
      )

      return { name: filename, key: fileKey, signedUrl, contentType: mimetype }
    }),
  )

  const filesInMessage = allFiles.map(
    async ({ name, key, contentType, signedUrl }) => {
      await prisma.file.createMany({
        data: [
          {
            name,
            contentType,
            key,
            messageId: messageIdGenerator,
          },
        ],
      })
      return { signedUrl, key }
    },
  )

  const message = await prisma.message.create({
    data: {
      id: messageIdGenerator,
      name,
      dateTime,
      delayTime,
      copywriting,
    },
  })

  return reply.status(201).send({ message, filesInMessage })
})

app.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
  // const uploadBodySchema = z.object({
  //   name: z.string().min(1),
  //   contentType: z.string().regex(/\w+\/[-+.\w]+/g),
  // })
  // const { name, contentType } = uploadBodySchema.parse(request.body)
  const files = await request.saveRequestFiles()

  const allFiles = await Promise.all(
    files.map(async ({ filename, mimetype }) => {
      const fileKey = `${randomUUID()}-${filename}`
      const signedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: 'space-sync-dev',
          Key: fileKey,
          ContentType: mimetype,
        }),
        { expiresIn: 600 },
      )

      return { fileKey, signedUrl }
    }),
  )

  return reply.status(201).send(allFiles)
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
