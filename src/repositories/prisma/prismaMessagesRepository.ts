import { prisma } from '@/lib/prisma'
import { Message, Prisma } from '@prisma/client'
import { MessagesRepository } from '../messagesRepository'

export class PrismaMessagesRepository implements MessagesRepository {
  async findById(id: string): Promise<Message | null> {
    return prisma.message.findUnique({ where: { id } })
  }
  async findByName(name: string): Promise<Message | null> {
    return await prisma.message.findFirst({ where: { name } })
  }
  async findMany(): Promise<Message[]> {
    return await prisma.message.findMany({ orderBy: { createdAt: 'desc' } })
  }
  async delete(data: Message): Promise<void> {
    await prisma.message.delete({ where: { id: data.id } })
  }
  async save(data: Message): Promise<Message | null> {
    return await prisma.message.update({
      where: { id: data.id },
      data,
    })
  }
  async create(data: Prisma.MessageCreateInput): Promise<Message> {
    return prisma.message.create({ data })
  }
}
