/* eslint-disable typescript/no-explicit-any */
/* eslint-disable typescript/no-unsafe-argument */
/* eslint-disable typescript/no-unsafe-return */
/* eslint-disable typescript/prefer-promise-reject-errors */
/* eslint-disable typescript/promise-function-async */

import { Deferred } from '@escapace/deferred'

export const sequentialize = () => {
  const locks: Array<Deferred<any>> = []

  return <T extends (...arguments_: any[]) => Promise<any>>(function_: T): T =>
    ((...arguments_: any[]) => {
      for (let l = locks.length - 1; l >= 0; l -= 1) {
        if (locks[l].isResolved()) {
          locks.splice(l, 1)
        }
      }

      const lock = new Deferred<any>()
      const promises = [...locks].map((value) => value.promise)

      locks.push(lock)

      return Promise.all(promises)
        .then(() => function_(...arguments_))
        .then((value) => {
          lock.resolve()

          return value
        })
        .catch((reason) => {
          lock.reject(reason)

          return Promise.reject(reason)
        })
    }) as T
}
