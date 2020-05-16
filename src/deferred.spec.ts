import { deferred } from './deferred'

// tslint:disable-next-line no-import-side-effect
import 'mocha'
import { assert } from 'chai'

describe('Deferred', () => {
  it('pending', () => {
    const d = deferred()

    assert.isTrue(d.isPending())
    assert.isFalse(d.isResolved())
    assert.isFalse(d.isFulfilled())
    assert.isFalse(d.isRejected())
  })

  it('fulfilled', (done) => {
    const d = deferred<string>()

    d.resolve('abc')

    d.promise.then((value) => {
      assert.equal(value, 'abc')

      assert.isFalse(d.isPending())
      assert.isTrue(d.isResolved())
      assert.isTrue(d.isFulfilled())
      assert.isFalse(d.isRejected())

      done()
    })
  })

  it('rejected', (done) => {
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
  })

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
