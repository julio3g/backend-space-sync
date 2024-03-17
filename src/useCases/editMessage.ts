import { MessagesRepository } from '@/repositories/messagesRepository'
import { Message } from '@prisma/client'
import { MessageNotFound } from './errors/MessageNotFound'

interface EditMessageUseCaseRequest {
  messageId: string
  name: string
  dateTime: Date
  delayTime: number
  status:
    | 'Sent!'
    | 'Sending...'
    | 'Delay in shipping!'
    | 'Something went wrong!'
  copywriting: string
  images: string[]
}

interface EditMessageUseCaseResponse {
  message: Message
}

export class EditMessageUseCase {
  constructor(private messagesRepository: MessagesRepository) {}

  async execute({
    messageId,
    name,
    dateTime,
    delayTime,
    status,
    copywriting,
    images,
  }: EditMessageUseCaseRequest): Promise<EditMessageUseCaseResponse> {
    const message = await this.messagesRepository.findById(messageId)

    if (!message) throw new MessageNotFound()

    message.name ?? name
    message.dateTime ?? dateTime
    message.delayTime ?? delayTime
    message.status ?? status
    message.copywriting ?? copywriting
    message.images ?? images

    await this.messagesRepository.save(message)

    return { message }
  }
}
