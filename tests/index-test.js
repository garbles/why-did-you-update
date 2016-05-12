import assert from 'assert'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import whyDidYouUpdate from 'src/'

const noop = () => {}

const createConsoleStore = type => {
  const entries = []
  const fn = global.console[type]

  global.console[type] = (...args) => {
    entries.push(args)
    fn.call(global.console, ...args)
  }

  return {
    destroy: () => global.console[type] = fn,
    entries
  }
}

class Stub extends React.Component {
  render () {
    return <noscript />
  }
}

describe(`whyDidYouUpdate`, () => {
  let node
  let groupStore
  let warnStore
  let errorStore
  let logStore

  beforeEach(() => {
    whyDidYouUpdate(React)
    node = document.createElement(`div`)
    groupStore = createConsoleStore(`group`)
    warnStore = createConsoleStore(`warn`)
    errorStore = createConsoleStore(`error`)
    logStore = createConsoleStore(`log`)
  })

  afterEach(() => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    unmountComponentAtNode(node)
    groupStore.destroy()
    warnStore.destroy()
    errorStore.destroy()
    logStore.destroy()
  })

  it(`logs an error on same props`, () => {
    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    const group = groupStore.entries[0][0]
    const errorMsg = errorStore.entries[0][2]
    const prevProps = logStore.entries[0][2]
    const nextProps = logStore.entries[1][2]

    assert.equal(group, `Stub.props`)
    assert.ok(/Value did not change. Avoidable re-render!/.test(errorMsg))
    assert.deepEqual(prevProps, {a: 1})
    assert.deepEqual(nextProps, {a: 1})
  })

  it(`logs an error on nested props but excludes the parent`, () => {
    const error = /Value did not change. Avoidable re-render!/
    const createProps = () => ({b: {c: 1}})
    const a = createProps()

    render(<Stub a={createProps()} />, node)
    render(<Stub a={createProps()} />, node)

    assert.equal(errorStore.entries.length, 3)
    assert.equal(groupStore.entries.length, 3)
    assert.equal(groupStore.entries[0][0], `Stub.props`)
    assert.equal(groupStore.entries[1][0], `Stub.props.a`)
    assert.equal(groupStore.entries[2][0], `Stub.props.a.b`)
    assert.ok(error.test(errorStore.entries[0][2]))
    assert.ok(error.test(errorStore.entries[1][2]))
    assert.ok(error.test(errorStore.entries[2][2]))
    assert.deepEqual(logStore.entries[0][2], {a})
    assert.deepEqual(logStore.entries[1][2], {a})
    assert.deepEqual(logStore.entries[2][2], {b: a.b})
    assert.deepEqual(logStore.entries[3][2], {b: a.b})
    assert.deepEqual(logStore.entries[4][2], {c: a.b.c})
    assert.deepEqual(logStore.entries[5][2], {c: a.b.c})
  })

  it(`logs a warning on function props`, () => {
    const warning = /Value is a function. Possibly avoidable re-render\?/
    const createFn = () => function sameFuncName () {}

    const fn = createFn()
    const fn2 = createFn()

    render(<Stub a={{b: fn}} />, node)
    render(<Stub a={{b: fn2}} />, node)

    assert.equal(errorStore.entries.length, 0)
    assert.equal(warnStore.entries.length, 1)
    assert.ok(warning.test(warnStore.entries[0][2]))
    assert.equal(logStore.entries[0][2], fn)
    assert.equal(logStore.entries[1][2], fn2)
  })
})
