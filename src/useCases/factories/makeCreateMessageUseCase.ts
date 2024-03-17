import { PrismaMessagesRepository } from '@/repositories/prisma/prismaMessagesRepository'
import { CreateMessageUseCase } from '../createMessage'

export function makeCreateMessageUseCase() {
  const prismaRepository = new PrismaMessagesRepository()
  const useCase = new CreateMessageUseCase(prismaRepository)
  return useCase
}
