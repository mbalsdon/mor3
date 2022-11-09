export class InvalidModsError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ConstructorError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

export class AlreadyExistsError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

export class SheetEmptyError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}
