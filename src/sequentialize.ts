/* tslint:disable no-any */

import { map, remove } from 'lodash'
import { Deferred } from './deferred'

export const sequentialize = () => {
  const locks: Deferred<{}>[] = []

  return <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
    return ((...args: any[]) => {
      remove(locks, deferred => deferred.isResolved())

      const lock = new Deferred()
      const promises = map(locks, ({ promise }) => promise)

      locks.push(lock)

      return Promise.all(promises)
        .then(() => fn(...args))
        .then(value => {
          lock.resolve()

          return value
        })
        .catch(reason => {
          lock.resolve()

          throw reason
        })
    }) as T
  }
}
