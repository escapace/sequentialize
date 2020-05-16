/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/promise-function-async */

import { map, remove } from 'lodash'
import { Deferred } from './deferred'

export const sequentialize = () => {
  const locks: Array<Deferred<any>> = []

  return <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
    return ((...args: any[]) => {
      remove(locks, (deferred) => deferred.isResolved())

      const lock = new Deferred<any>()
      const promises = map(locks, ({ promise }) => promise)

      locks.push(lock)

      return Promise.all(promises)
        .then(() => fn(...args))
        .then((value) => {
          lock.resolve()

          return value
        })
        .catch((reason) => {
          lock.resolve()

          throw reason
        })
    }) as T
  }
}
