import { FastifyInstance } from 'fastify'
import { createUploadMessage } from './create-upload-message'

export async function appRoutes(app: FastifyInstance) {
  // app.register(messagesRoutes)
  app.register(createUploadMessage)
}

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
// const messageIdGenerator = randomUUID()
// const files = await request.saveRequestFiles()

// const allFiles = await Promise.all(
//   files.map(async ({ filename, mimetype }) => {
//     const fileKey = `${randomUUID()}-${filename}`

//     await r2.send(
//       new PutObjectCommand({
//         Bucket: 'space-sync-dev',
//         Key: fileKey,
//         ContentType: mimetype,
//       }),
//     )

//     return { name: filename, key: fileKey, contentType: mimetype }
//   }),
// )

// const filesInMessage = allFiles.map(async ({ name, key, contentType }) => {
//   await prisma.file.createMany({
//     data: [
//       {
//         name,
//         contentType,
//         key,
//         messageId: messageIdGenerator,
//       },
//     ],
//   })
//   return { key }
// })

// const message = await prisma.message.create({
//   data: {
//     id: messageIdGenerator,
//     name,
//     dateTime,
//     delayTime,
//     copywriting,
//   },
// })

// return reply.status(201).send({ message, filesInMessage })
