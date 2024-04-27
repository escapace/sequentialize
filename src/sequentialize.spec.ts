import { assert, describe, it, vi } from 'vitest'
import { sequentialize } from './sequentialize'

const spy = () => vi.fn()

async function delay(string_: string, interval = 10) {
  return await new Promise((resolve) => setTimeout(() => resolve(string_), interval))
}

describe('sequentialize', () => {
  it('execution order', async () =>
    await new Promise<void>((done) => {
      const wrap = sequentialize()

      const a = spy()
      const b = spy()
      const c = spy()
      const d = spy()

      const one = wrap(delay)
      const two = wrap(async <T>(value: T) => await Promise.reject(value))
      const three = wrap(async (value: string) => await Promise.resolve(value))
      const four = wrap(delay)

      void one('one', 75).then(a)
      void two('two').catch(b)
      void three('three').then(c)
      void one('one-one', 50).then(a)

      four('four', 25)
        .then(d)
        .then(() => {
          assert.equal(a.mock.calls.length, 2)
          assert.equal(b.mock.calls.length, 1)
          assert.equal(c.mock.calls.length, 1)
          assert.equal(d.mock.calls.length, 1)

          assert.deepEqual(a.mock.calls[0], ['one'])
          assert.deepEqual(b.mock.calls[0], ['two'])
          assert.deepEqual(c.mock.calls[0], ['three'])
          assert.deepEqual(a.mock.calls[1], ['one-one'])
          assert.deepEqual(d.mock.calls[0], ['four'])
          //
          // assert.isTrue(a.firstCall.calledBefore(b.firstCall))
          // assert.isTrue(b.firstCall.calledBefore(c.firstCall))
          // assert.isTrue(c.firstCall.calledBefore(a.secondCall))
          // assert.isTrue(a.secondCall.calledBefore(d.firstCall))

          done()
        })
        .catch(console.log)
      // .then(done)
    }))
})
