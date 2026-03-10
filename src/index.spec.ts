/* eslint-disable unicorn/consistent-function-scoping */
import { assert, describe, expect, it, vi } from 'vitest'
import { sequentialize } from './index'

const createDelay = (
  string: string,
  wrap: ReturnType<typeof sequentialize>,
  type: 'reject' | 'resolve' = 'resolve',
) => {
  const spy = vi.fn()

  // eslint-disable-next-line typescript/promise-function-async
  const delay = (interval = Math.random() * 100) => {
    const promise = new Promise<string>((resolve, reject) =>
      setTimeout(() => {
        if (type === 'resolve') {
          resolve(string)
        } else {
          reject(new Error(string))
        }
      }, interval),
    )

    return promise

    // return type === 'reject'
    //   ? await promise.catch((value) => {
    //
    //       throw value
    //     })
    //   : await promise.then((value) => {
    //       spy(value)
    //
    //       return value
    //     })
  }

  return [wrap(delay), spy] as const
}

describe('sequentialize', () => {
  it('execution order', { repeats: 5, timeout: 10_000 }, async (qwe) => {
    const repeat = qwe.task.result?.repeatCount ?? 0
    const offset = repeat * 16

    const wrap = sequentialize()

    // order does not matter
    const [bean, beanSpy] = createDelay('bean', wrap)
    const [dish, dishSpy] = createDelay('dish', wrap)
    const [soup, soupSpy] = createDelay('soup', wrap)
    const [yolk, yolkSpy] = createDelay('yolk', wrap)

    void dish().then(dishSpy) //  1
    void yolk().then(yolkSpy) //  2
    void bean().then(beanSpy) //  3
    void soup().then(soupSpy) //  4

    void bean().then(beanSpy) //  5
    void yolk().then(yolkSpy) //  6
    void soup().then(soupSpy) //  7
    await dish().then(dishSpy) // 8

    //

    void dish().then(dishSpy) //  9
    void bean().then(beanSpy) //  10
    void soup().then(soupSpy) //  11
    void yolk().then(yolkSpy) //  12

    void yolk().then(yolkSpy) //  13
    void dish().then(dishSpy) //  14
    void soup().then(soupSpy) //  15
    await bean().then(beanSpy) // 16

    assert.deepEqual(
      dishSpy.mock.invocationCallOrder,
      [1, 8, 9, 14].map((value) => value + offset),
    )
    assert.deepEqual(
      yolkSpy.mock.invocationCallOrder,
      [2, 6, 12, 13].map((value) => value + offset),
    )
    assert.deepEqual(
      beanSpy.mock.invocationCallOrder,
      [3, 5, 10, 16].map((value) => value + offset),
    )
    assert.deepEqual(
      soupSpy.mock.invocationCallOrder,
      [4, 7, 11, 15].map((value) => value + offset),
    )

    assert.ok(dishSpy.mock.calls.flat().every((value) => value === 'dish'))
    assert.ok(yolkSpy.mock.calls.flat().every((value) => value === 'yolk'))
    assert.ok(beanSpy.mock.calls.flat().every((value) => value === 'bean'))
    assert.ok(soupSpy.mock.calls.flat().every((value) => value === 'soup'))
  })

  it('rejects from a plain async function', async () => {
    const throws = async () => {
      await new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new Error('set-timeout'))
        }, 10)
      })
    }

    await expect(throws).rejects.toThrowError(/set-timeout/)
  })

  it('rejects from a sequentialized function', async () => {
    const wrap = sequentialize()

    const throws = async () => {
      const function_ = wrap(
        async () =>
          await new Promise<void>((_, reject) => {
            setTimeout(() => {
              reject(new Error('set-timeout'))
            }, 10)
          }),
      )

      await function_()
    }

    await expect(throws).rejects.toThrowError(/set-timeout/)
  })

  it('rejects when createDelay is configured to reject', async () => {
    const wrap = sequentialize()
    const throws = async () => {
      const function_ = createDelay('delay', wrap, 'reject')[0]

      await function_()
    }

    await expect(throws).rejects.toThrowError(/delay/)
  })

  it('recovers queue execution after a rejection', { repeats: 5, timeout: 10_000 }, async () => {
    const wrap = sequentialize()

    const [yolk, yolkSpy] = createDelay('yolk', wrap)
    const [bean, beanSpy] = createDelay('bean', wrap, 'reject')
    const [dish, dishSpy] = createDelay('dish', wrap)

    void yolk().then(yolkSpy).catch(yolkSpy)
    void bean().then(beanSpy).catch(beanSpy)
    await dish().then(dishSpy).catch(dishSpy)

    void yolk().then(yolkSpy).catch(yolkSpy)
    await dish().then(dishSpy).catch(dishSpy)

    assert.equal(yolkSpy.mock.calls.length, 2)
    assert.ok(yolkSpy.mock.calls.flat().every((value) => value === 'yolk'))

    assert.equal(beanSpy.mock.calls.length, 1)
    assert.ok(beanSpy.mock.calls[0][0] instanceof Error)

    assert.equal(dishSpy.mock.calls.length, 2)
    assert.ok(dishSpy.mock.calls[0][0] instanceof Error)
    assert.equal(dishSpy.mock.calls[1][0], 'dish')
  })
})
