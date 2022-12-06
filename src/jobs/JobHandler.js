import { ConstructorError } from '../controller/utils/MorErrors.js'
import MorUtils from '../controller/utils/MorUtils.js'

import * as schedule from 'node-schedule'

import '../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('jobs')

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
      // Valid cron string check is done by node-schedule
      if (!MorUtils.isFunction(v[1])) throw new ConstructorError(`jobs[${k}][1] must be a function! jobs[${k}][1]=${v}]`)
    }
    this.#JOBS = jobs
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
    logger.info('Starting JobHandler...')
    for (const v of Object.values(this.#JOBS)) {
      const cronTimer = v[0]
      const job = v[1]
      logger.info(`Scheduling job "${job.name}" with timer "${cronTimer}"`)
      
      const scheduledJob = schedule.scheduleJob(cronTimer, job)
      scheduledJob.on('error', error => {
        logger.error(`Received error "${error.name}: ${error.message}"`)
        logger.warn(`Stopping scheduler for "${job.name}"...`)
        scheduledJob.cancel()
      })
    }

    logger.info('JobHandler successfully started!')
  }
}
