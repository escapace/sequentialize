import { assert, describe, it } from 'vitest'
import { deferred } from './deferred'

describe('Deferred', () => {
  it('pending', () => {
    const d = deferred()

    assert.isTrue(d.isPending())
    assert.isFalse(d.isResolved())
    assert.isFalse(d.isFulfilled())
    assert.isFalse(d.isRejected())
  })

  it('fulfilled', async () =>
    await new Promise<void>((done) => {
      const d = deferred<string>()

      d.resolve('abc')

      void d.promise.then((value) => {
        assert.equal(value, 'abc')

        assert.isFalse(d.isPending())
        assert.isTrue(d.isResolved())
        assert.isTrue(d.isFulfilled())
        assert.isFalse(d.isRejected())

        done()
      })
    }))

  it('rejected', async () =>
    await new Promise<void>((done) => {
      const d = deferred<string>()

      d.reject('abc')

      d.promise.catch((value) => {
        assert.equal(value, 'abc')

        assert.isFalse(d.isPending())
        assert.isTrue(d.isResolved())
        assert.isFalse(d.isFulfilled())
        assert.isTrue(d.isRejected())

        done()
      })
    }))

  it('resolved twice', () => {
    assert.throws(() => {
      const d = deferred<string>()

      d.reject('abc')
      d.reject('abc')
    }, /Deferred cannot be resolved twice/)

    assert.throws(() => {
      const d = deferred<string>()

      d.resolve('abc')
      d.resolve('abc')
    }, /Deferred cannot be resolved twice/)
  })
})
