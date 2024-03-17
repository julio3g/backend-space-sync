import { r2 } from '@/lib/cloudflare'
import { makeCreateMessageUseCase } from '@/useCases/factories/makeCreateMessageUseCase'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export class CreateMessageController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const createMessageBodySchema = z.object({
      name: z.string(),
      dateTime: z.string(),
      delayTime: z.number(),
      status: z.string(),
      copywriting: z.string(),
      images: z.array(z.string().url()),
    })

    const { name, dateTime, delayTime, status, copywriting, images } =
      createMessageBodySchema.parse(request.body)

    const files = await request.saveRequestFiles()

    const getUrlFiles = await Promise.all(
      files.map(async (file) => {
        const fileKey = randomUUID().concat('-').concat(file.filename)

        const signedUrl = await getSignedUrl(
          r2,
          new PutObjectCommand({
            Bucket: 'space-sync-dev',
            Key: fileKey,
            ContentType: file.mimetype,
          }),
          { expiresIn: 600 },
        )
        return signedUrl
      }),
    )

    // {

    //   // fieldname: file.fieldname,
    //   filename: file.filename,
    //   // encoding: file.encoding,
    //   mimetype: file.mimetype,
    // }

    // const signedUrl = await getSignedUrl(
    //   r2,
    //   new PutObjectCommand({
    //     Bucket: 'space-sync-dev',
    //     Key: fileKey,
    //     ContentType: contentType,
    //   }),
    //   { expiresIn: 600 },
    // )

    const createMessageUseCase = makeCreateMessageUseCase()

    const message = await createMessageUseCase.execute({
      name,
      dateTime,
      delayTime,
      status,
      copywriting,
      images,
    })

    // return reply.status(201).send()
    // const data = await request.file()

    // data.file // stream
    // data.fields // other parsed parts
    // data.fieldname
    // data.filename
    // data.encoding
    // data.mimetype

    // to accumulate the file in memory! Be careful!
    //
    // await data.toBuffer() // Buffer
    //
    // or

    // be careful of permission issues on disk and not overwrite
    // sensitive files that could cause security risks

    // also, consider that if the file stream is not consumed, the promise will never fulfill
    // const files = await request.saveRequestFiles() // Se você está esperando múltiplos arquivos

    // Construa um objeto com as propriedades que você deseja enviar de volta
    // const fileInfo = files.map((file) => ({
    //   fieldname: file.fieldname,
    //   filename: file.filename,
    //   encoding: file.encoding,
    //   mimetype: file.mimetype,
    // }))

    // Agora você pode enviar esse objeto como uma resposta
    return reply.status(201).send(message)

    // return data
  }
}
