import _isEqual from 'lodash/isEqual'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _union from 'lodash/union'
import Immutable from 'immutable';

const isReferenceEntity = o => Array.isArray(o) || _isObject(o)

export class DeepDiff {
  constructor(prev, next, name){
    this.prev = prev
    this.next = next
    this.name = name
  }

  run(){
    const isRefEntity = isReferenceEntity(this.prev) && isReferenceEntity(this.next)

    if (!_isEqual(this.prev, this.next)) {
      const isFunc = _isFunction(this.prev) && _isFunction(this.next)

      if (isFunc) {
        if (this.prev.name === this.next.name) {
          this.notify(`Value is a function. Possibly avoidable re-render?`, false)
        }
      } else if (isRefEntity) {
        this.refDeepDiff()
      }
    } else if (this.prev !== this.next) {
      this.notify(`Value did not change. Avoidable re-render!`, true)

      if (isRefEntity) {
        this.refDeepDiff()
      }
    }
  }

  notify(status, bold){
    console.group(this.name)

    if (bold) {
      console.warn(`%c%s`, `font-weight: bold`, status)
    } else {
      console.warn(status)
    }

    console.log(`%cbefore`, `font-weight: bold`, this.prev)
    console.log(`%cafter `, `font-weight: bold`, this.next)
    console.groupEnd()
  }

  refDeepDiff(){
    let keys;
    if(this.isImmutable()){
      keys = _union(this.prev._keys, this.next._keys);
    } else {
      keys = _union(_keys(this.prev), _keys(this.next))
    }
    keys.forEach(key => {
      return new DeepDiff(this.prev[key], this.next[key], `${this.name}.${key}`).run()
    })
  }

  isImmutable(){
    return Immutable.Iterable.isIterable(this.prev) && Immutable.Iterable.isIterable(this.next);
  }
}

