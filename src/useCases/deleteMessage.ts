import { MessagesRepository } from '@/repositories/messagesRepository'
import { Message } from '@prisma/client'
import { MessageNotFound } from './errors/MessageNotFound'

interface DeleteMessageUseCaseRequest {
  messageId: string
}

interface DeleteMessageUseCaseResponse {
  message: Message
}

export class DeleteMessageUseCase {
  constructor(private messagesRepository: MessagesRepository) {}

  async execute({
    messageId,
  }: DeleteMessageUseCaseRequest): Promise<DeleteMessageUseCaseResponse> {
    const message = await this.messagesRepository.findById(messageId)
    if (!message) throw new MessageNotFound()
    await this.messagesRepository.delete(message)
    return { message }
  }
}
