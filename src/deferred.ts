/**
 * A deferred represents a promise which can be either resolved via
 * deferred.resolve or rejected via deferred.reject.The promise can be acessed
 * via the promise property on the deferred.
 */

export class Deferred<T> {
  public promise: Promise<T>

  private fate: 'resolved' | 'unresolved'
  private state: 'pending' | 'fulfilled' | 'rejected'

  private _resolve:
    | ((value?: T | PromiseLike<T> | undefined) => void)
    | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _reject: ((reason?: any) => void) | undefined

  constructor() {
    this.state = 'pending'
    this.fate = 'unresolved'

    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })

    this.promise.then(
      () => (this.state = 'fulfilled'),
      () => (this.state = 'rejected')
    )
  }

  public resolve(value?: T | PromiseLike<T> | undefined) {
    if (this.fate === 'resolved') {
      throw new Error('Deferred cannot be resolved twice')
    }

    this.fate = 'resolved'

    if (this._resolve !== undefined) {
      this._resolve(value)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public reject(reason?: any) {
    if (this.fate === 'resolved') {
      throw new Error('Deferred cannot be resolved twice')
    }

    this.fate = 'resolved'

    if (this._reject !== undefined) {
      this._reject(reason)
    }
  }

  public isResolved() {
    return this.fate === 'resolved'
  }

  public isPending() {
    return this.state === 'pending'
  }

  public isFulfilled() {
    return this.state === 'fulfilled'
  }

  public isRejected() {
    return this.state === 'rejected'
  }
}

export const deferred = <T>() => new Deferred<T>()
