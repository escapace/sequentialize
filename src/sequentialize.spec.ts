import { assert, describe, it, vi } from 'vitest'
import { sequentialize } from './sequentialize'

const spy = () => vi.fn()

async function delay(string_: string, interval = 10) {
  return await new Promise((resolve) => setTimeout(() => resolve(string_), interval))
}

describe('sequentialize', () => {
  it('execution order', async () => {
    const wrap = sequentialize()

    const first = spy()
    const second = spy()
    const third = spy()
    const fourth = spy()

    const soup = wrap(delay)
    const jelly = wrap(delay)
    const bean = wrap(
      async (value: string, interval: number) =>
        await delay(value, interval).then(async (value) => await Promise.reject(value)),
    )
    const peanut = wrap(delay)

    void jelly('first', 200).then(first)
    void peanut('second', 60).then(second)
    void bean('third', 30).catch(third)
    void soup('fourth').then(fourth)

    void bean('first', 200).catch(first)
    void peanut('second', 60).then(second)
    void soup('third', 30).then(third)
    await jelly('fourth').then(fourth)

    assert.equal(first.mock.calls.length, 2)
    assert.equal(second.mock.calls.length, 2)
    assert.equal(third.mock.calls.length, 2)
    assert.equal(fourth.mock.calls.length, 2)

    assert.deepEqual(first.mock.calls[0], ['first'])
    assert.deepEqual(second.mock.calls[0], ['second'])
    assert.deepEqual(third.mock.calls[0], ['third'])
    assert.deepEqual(fourth.mock.calls[0], ['fourth'])

    assert.equal(first.mock.invocationCallOrder[0], 1)
    assert.equal(second.mock.invocationCallOrder[0], 2)
    assert.equal(third.mock.invocationCallOrder[0], 3)
    assert.equal(fourth.mock.invocationCallOrder[0], 4)

    assert.deepEqual(first.mock.calls[1], ['first'])
    assert.deepEqual(second.mock.calls[1], ['second'])
    assert.deepEqual(third.mock.calls[1], ['third'])
    assert.deepEqual(fourth.mock.calls[1], ['fourth'])

    assert.equal(first.mock.invocationCallOrder[1], 5)
    assert.equal(second.mock.invocationCallOrder[1], 6)
    assert.equal(third.mock.invocationCallOrder[1], 7)
    assert.equal(fourth.mock.invocationCallOrder[1], 8)
  })
})
