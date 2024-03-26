import { readFileSync } from 'fs'
import * as schedule from 'node-schedule'
import * as qrcode from 'qrcode-terminal'
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js'

interface IMessageSchedule {
  date: Date
  chatId: string
  message: string
  imagePath?: string
}

class WhatsAppScheduler {
  private client: Client
  private messageQueue: IMessageSchedule[]

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
    })
    this.messageQueue = []
  }

  public async initialize(): Promise<void> {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true })
    })

    this.client.on('ready', () => {
      console.log('Client is ready!')
      this.processQueue()
    })

    await this.client.initialize()
  }

  public scheduleMessage(scheduleData: IMessageSchedule): void {
    this.messageQueue.push(scheduleData)
    console.log(
      `Message scheduled for ${scheduleData.chatId} at ${scheduleData.date}`,
    )
    schedule.scheduleJob(scheduleData.date, async () => {
      await this.sendMessage(scheduleData)
    })
  }

  private async sendMessage(scheduleData: IMessageSchedule): Promise<void> {
    console.log(`Sending message to ${scheduleData.chatId}`)
    await this.client.sendMessage(scheduleData.chatId, scheduleData.message)
    if (scheduleData.imagePath) {
      await this.sendImage(scheduleData.chatId, scheduleData.imagePath)
    }
  }

  private async sendImage(chatId: string, imagePath: string): Promise<void> {
    const imageAsBase64 = readFileSync(imagePath, { encoding: 'base64' })
    const imageMedia = new MessageMedia('image/jpeg', imageAsBase64)
    await this.client.sendMessage(chatId, imageMedia)
  }

  private processQueue(): void {
    this.messageQueue.forEach((scheduleData) => {
      schedule.scheduleJob(scheduleData.date, async () => {
        await this.sendMessage(scheduleData)
      })
    })
  }
}

// Usage
;(async () => {
  const scheduler = new WhatsAppScheduler()
  await scheduler.initialize()

  // Schedule a text message
  scheduler.scheduleMessage({
    date: new Date('2024-03-30T15:00:00Z'),
    chatId: '1234567890@c.us',
    message: 'Hello, this is a scheduled message!',
  })

  // Schedule a text message with an image
  scheduler.scheduleMessage({
    date: new Date('2024-03-30T15:05:00Z'),
    chatId: '1234567890@c.us',
    message: 'Here is your scheduled image!',
    imagePath: './path/to/your/image.jpg',
  })
})()
