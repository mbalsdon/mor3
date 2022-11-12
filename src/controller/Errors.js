/**
 * Signifies that an asynchronous constructor was used directly - use the class build function instead
 * @see {@link MorFacade.build}
 */
export class ConstructorError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * Signifies an invalid mod string
 * @see {@link Mods}
 */
export class InvalidModsError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * Signifies that something wasn't found
 * @see {@link MorFacade.getSheetUser}
 */
export class NotFoundError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * Signifies that something already exists
 * @see {@link MorFacade.addSheetUser}
 */
export class AlreadyExistsError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * Signifies that a sheet is empty
 * @see {@link scoresCmd}
 */
export class SheetEmptyError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}
