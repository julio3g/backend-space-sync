// /**
//  * Receives a status code and message.
//  *
//  * Example: (400, 'Bad Request')
//  *
//  * @param message {string}
//  * @param statusCode {number}
//  */

export class AppError {
  public readonly message: string
  public readonly statusCode: number
  constructor(message: string, statusCode = 400) {
    this.message = message
    this.statusCode = statusCode
  }
}
