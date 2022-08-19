/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Deferred } from './deferred'

export const sequentialize = () => {
  const locks: Array<Deferred<any>> = []

  return <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
    return ((...args: any[]) => {
      for (let l = locks.length - 1; l >= 0; l -= 1) {
        if (locks[l].isRejected()) {
          locks.splice(l, 1)
        }
      }

      const lock = new Deferred<any>()
      const promises = locks.map(({ promise }) => promise)

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
