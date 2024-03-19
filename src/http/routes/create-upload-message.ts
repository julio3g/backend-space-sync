import { r2 } from '@/lib/cloudflare'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function createUploadMessage(app: FastifyInstance) {
  app.post('/message', async (request: FastifyRequest, reply: FastifyReply) => {
    const createMessageBodySchema = z.object({
      name: z.string(),
      dateTime: z.string(),
      delayTime: z.number(),
      status: z.string(),
      copywriting: z.string(),
    })

    const { name, dateTime, delayTime, status, copywriting } =
      createMessageBodySchema.parse(request.body)

    // const signedUrl = await getSignedUrl(
    //   r2,
    //   new PutObjectCommand({
    //     Bucket: 'rabbithole-dev',
    //     Key: fileKey,
    //     ContentType: contentType,
    //   }),
    //   { expiresIn: 600 },
    // )

    const files = await request.saveRequestFiles()

    const fileData = await Promise.all(
      files.map(async ({ filename, mimetype }) => {
        const fileKey = randomUUID().concat('-').concat(filename)

        await getSignedUrl(
          r2,
          new PutObjectCommand({
            Bucket: 'space-sync-dev',
            Key: fileKey,
            ContentType: mimetype,
          }),
          { expiresIn: 600 },
        )

        return {
          key: fileKey,
          contentType: mimetype,
          name: filename,
        }
      }),
    )

    const fileOperations = files.map(async (file) => {
      // Gerar uma chave única para o arquivo
      const fileKey = randomUUID().concat('-').concat(file.filename)

      // Obter a URL assinada (aqui você vai interagir com o R2)
      const signedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: 'rabbithole-dev',
          Key: fileKey,
          ContentType: file.mimetype,
        }),
        { expiresIn: 600 },
      )

      // Crie um registro no banco de dados para o arquivo
      // const fileRecord = await prisma.file.create({
      //   data: {
      //     name: file.filename,
      //     contentType: file.mimetype, // ou 'contentType' baseado na sua lógica
      //     key: fileKey,
      //     // outros dados necessários para o seu modelo 'File'
      //   }
      // });

      // Retorna a URL assinada e qualquer outro dado que você deseja retornar
      return {
        signedUrl,
      }
    })

    // const message = await prisma.message.create({
    //   data: {
    //     name,
    //     dateTime: dateTime,
    //     delayTime,
    //     status,
    //     copywriting,
    //     files: {
    //       createMany:
    //     },
    //   },
    // })

    // return reply.status(201).send(message)
  })
}
