import { MessagesRepository } from '@/repositories/messagesRepository'
import { Message } from '@prisma/client'

interface ListClientsUseCaseRequest {}

interface ListClientsUseCaseResponse {
  messages: Message[]
}

export class ListMessagesUseCase {
  constructor(private messagesRepository: MessagesRepository) {}

  async execute(): Promise<ListClientsUseCaseResponse> {
    const messages = await this.messagesRepository.findMany()
    return { messages }
  }
}
