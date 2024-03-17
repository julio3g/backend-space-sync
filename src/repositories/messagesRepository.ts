import { Message, Prisma } from '@prisma/client'

export interface MessagesRepository {
  findById(id: string): Promise<Message | null>
  findByName(name: string): Promise<Message | null>
  findMany(): Promise<Message[]>
  create(data: Prisma.MessageCreateInput): Promise<Message>
  delete(data: Message): Promise<void>
  save(message: Message): Promise<Message | null>
}
