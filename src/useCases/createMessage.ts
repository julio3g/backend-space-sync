import { MessagesRepository } from '@/repositories/messagesRepository'
import { Message } from '@prisma/client'

interface CreateMessageUseCaseRequest {
  name: string
  dateTime: string
  delayTime: number
  status: string
  copywriting: string
  files: any
}

interface CreateMessageUseCaseResponse {
  message: Message
}

export class CreateMessageUseCase {
  constructor(private messagesRepository: MessagesRepository) {}

  async execute({
    name,
    dateTime,
    delayTime,
    status,
    copywriting,
    files,
  }: CreateMessageUseCaseRequest): Promise<CreateMessageUseCaseResponse> {
    const message = await this.messagesRepository.create({
      name,
      dateTime,
      delayTime,
      status,
      copywriting,
      files,
    })
    return { message }
  }
}
