/* tslint:disable promise-must-complete */

/**
 * A deferred represents a promise which can be either resolved via
 * deferred.resolve or rejected via deferred.reject.The promise can be acessed
 * via the promise property on the deferred.
 */

export class Deferred<T> {
  public promise: Promise<T>

  private fate: 'resolved' | 'unresolved'
  private state: 'pending' | 'fulfilled' | 'rejected'

  private _resolve: Function // (value?: T | PromiseLike<T> | undefined) => void
  private _reject: Function // (reason?: any) => void

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
    this._resolve(value)
  }

  // tslint:disable-next-line no-any
  public reject(reason?: any) {
    if (this.fate === 'resolved') {
      throw new Error('Deferred cannot be resolved twice')
    }

    this.fate = 'resolved'
    this._reject(reason)
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
