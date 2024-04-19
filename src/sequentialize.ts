/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Deferred } from './deferred'

export const sequentialize = () => {
  const locks: Array<Deferred<any>> = []

  return <T extends (...arguments_: any[]) => Promise<any>>(function_: T): T =>
    ((...arguments_: any[]) => {
      for (let l = locks.length - 1; l >= 0; l -= 1) {
        if (locks[l].isRejected()) {
          locks.splice(l, 1)
        }
      }

      const lock = new Deferred<any>()
      const promises = locks.map(({ promise }) => promise)

      locks.push(lock)

      return Promise.all(promises)
        .then(() => function_(...arguments_))
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
