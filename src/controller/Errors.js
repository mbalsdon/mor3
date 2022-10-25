export class InvalidModsError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}
