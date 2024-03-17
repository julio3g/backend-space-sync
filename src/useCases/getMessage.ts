import { MessagesRepository } from '@/repositories/messagesRepository'
import { Message } from '@prisma/client'
import { MessageNotFound } from './errors/MessageNotFound'

interface GetMessageUseCaseRequest {
  messageId: string
}

interface GetMessageUseCaseResponse {
  message: Message
}

export class GetMessageUseCase {
  constructor(private messageRepository: MessagesRepository) {}

  async execute({
    messageId,
  }: GetMessageUseCaseRequest): Promise<GetMessageUseCaseResponse> {
    const message = await this.messageRepository.findById(messageId)

    if (!message) throw new MessageNotFound()

    return { message }
  }
}
