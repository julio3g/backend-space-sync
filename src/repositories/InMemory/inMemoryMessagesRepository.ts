import { Message, Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { MessagesRepository } from '../messagesRepository'

export class InMemoryMessagesRepository implements MessagesRepository {
  public items: Message[] = []
  async findById(id: string): Promise<Message | null> {
    const message = this.items.find((item) => item.id === id)
    if (!message) return null
    return message
  }
  async findByName(name: string): Promise<Message | null> {
    const message = this.items.find((item) => item.name === name)
    if (!message) return null
    return message
  }
  async findMany(): Promise<Message[]> {
    return this.items
  }
  async delete(data: Message): Promise<void> {
    const index = this.items.findIndex((item) => item.id === data.id)
    if (index !== -1) this.items.splice(index, 1)
  }
  async save(message: Message): Promise<Message | null> {
    const messageIndex = this.items.findIndex((item) => item.id === message.id)
    if (messageIndex >= 0) this.items[messageIndex] = message
    return message
  }

  async create(data: Prisma.MessageUncheckedCreateInput): Promise<Message> {
    const message = {
      id: data.id ?? randomUUID(),
      name: data.name,
      dateTime: data.dateTime,
      delayTime: data.delayTime ?? 0,
      status: data.status ?? '',
      copywriting: data.copywriting,
      files: data.files,
      createdAt: new Date(),
    }
    this.items.push(message)
    return message
  }
}
