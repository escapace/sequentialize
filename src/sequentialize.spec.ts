/* tslint:disable no-floating-promises no-console */
import { sequentialize } from './sequentialize'

// tslint:disable-next-line no-import-side-effect
import 'mocha'
import { assert } from 'chai'
import { spy } from 'sinon'

function delay(str: string, interval = 10) {
  return new Promise(resolve => setTimeout(() => resolve(str), interval))
}

describe('sequentialize', () => {
  it('execution order', done => {
    const wrap = sequentialize()

    const a = spy()
    const b = spy()
    const c = spy()
    const d = spy()

    const one = wrap(delay)
    const two = wrap(<T>(value: T) => Promise.reject(value))
    const three = wrap((value: string) => Promise.resolve(value))
    const four = wrap(delay)

    one('one', 75).then(a)
    two('two').catch(b)
    three('three').then(c)
    one('one-one', 50).then(a)

    four('four', 25).then(d)
    .then(() => {
      assert.equal(a.callCount, 2)
      assert.equal(b.callCount, 1)
      assert.equal(c.callCount, 1)
      assert.equal(d.callCount, 1)

      assert.ok(a.firstCall.calledWithExactly(['one', 75]))
      assert.ok(b.firstCall.calledWithExactly(['two']))
      assert.ok(c.firstCall.calledWithExactly(['three']))
      assert.ok(a.secondCall.calledWithExactly(['one-one', 50]))
      assert.ok(d.firstCall.calledWithExactly(['four', 25]))

      assert.isTrue(a.firstCall.calledBefore(b.firstCall))
      assert.isTrue(b.firstCall.calledBefore(c.firstCall))
      assert.isTrue(c.firstCall.calledBefore(a.secondCall))
      assert.isTrue(a.secondCall.calledBefore(d.firstCall))

      done()
    })
    .catch(console.log)
    // .then(done)
  })
})
