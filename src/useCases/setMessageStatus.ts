import { MessagesRepository } from '@/repositories/messagesRepository'
import { Message } from '@prisma/client'

interface SetMessageStatusUseCaseRequest {
  messageId: string
}

interface SetMessageStatusUseCaseResponse {
  message: Message
}

export class SetMessageStatusUseCase {
  constructor(private messagesRepository: MessagesRepository) {}

  async execute({
    messageId,
  }: SetMessageStatusUseCaseRequest): Promise<SetMessageStatusUseCaseResponse> {}
}
