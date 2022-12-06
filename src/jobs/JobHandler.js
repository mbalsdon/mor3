import { ConstructorError } from '../controller/utils/MorErrors.js'
import MorUtils from '../controller/utils/MorUtils.js'

import * as cron from 'node-cron'

/**
 * Wrapper class for scheduled jobs
 */
export default class JobHandler {
  #JOBS

  /**
   * Constructs the wrapper.
   * @param {*} jobs object whose values are arrays of the form [\<valid cron string\>, \<function\>]
   * @throws {@link ConstructorError} if jobs object is invalid
   * @example
   *  function foo () { console.log('hello') }
   *  const bar = () => { console.log('world!') }
   *  const jobs = {
   *    a: ['0 2,5 * * *', foo],
   *    b: ['0 0 0 0 5', bar]
   *  }
   *  const jobHandler = new JobHandler(jobs)
   */
  constructor (jobs) {
    if (MorUtils.isEmptyObject(jobs)) throw new ConstructorError('jobs is empty!')
    for (const [k, v] of Object.entries(jobs)) {
      if (!MorUtils.isArray(v)) throw new ConstructorError(`jobs[${k}] is not an array! jobs[${k}]=${v}`)
      if (v.length !== 2) throw new ConstructorError(`jobs[${v}] must be of length 2! jobs[${k}]=[${v}]`)
      // Valid cron string check is done by node-cron
      if (!MorUtils.isFunction(v[1])) throw new ConstructorError(`jobs[${k}][1] must be a function! jobs[${k}][1]=${v}]`)
    }
    this.#JOBS = jobs
    // start
    // idk
  }

  /**
   * Starts scheduled jobs
   * @example
   *  function foo () { console.log('hello') }
   *  function bar () { console.log('world!') }
   *  function myFunc () { console.log('AAAAAAA') }
   *  const jobs = {
   *    foo: ['0 2,5 * * *', foo],
   *    bar: ['0 0 0 0 5', bar],
   *    waa: ['* * 10 * * *', myFunc]
   *  }
   *  const jobHandler = new JobHandler(jobs)
   *  jobHandler.start()
   */
  start () {
    console.info('JobHandler::start ()') // TODO: replace
    for (const v of Object.values(this.#JOBS)) {
      console.info(`JobHandler::start >> Scheduling job "${v[1].name}" with cron timer "${v[0]}"`)
      cron.schedule(v[0], v[1])
    }
  }
}
