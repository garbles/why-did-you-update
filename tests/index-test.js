import assert from 'assert'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import Immutable, {
  Record
} from 'immutable';

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
  let logStore

  beforeEach(() => {
    whyDidYouUpdate(React)
    node = document.createElement(`div`)
    groupStore = createConsoleStore(`group`)
    warnStore = createConsoleStore(`warn`)
    logStore = createConsoleStore(`log`)
  })

  afterEach(() => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    unmountComponentAtNode(node)
    groupStore.destroy()
    warnStore.destroy()
    logStore.destroy()
  })

  it(`logs an warning on same props`, () => {
    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    const group = groupStore.entries[0][0]
    const warnMsg = warnStore.entries[0][2]
    const prevProps = logStore.entries[0][2]
    const nextProps = logStore.entries[1][2]

    assert.equal(group, `Stub.props`)
    assert.ok(/Value did not change. Avoidable re-render!/.test(warnMsg))
    assert.deepEqual(prevProps, {a: 1})
    assert.deepEqual(nextProps, {a: 1})
  })

  it(`logs an warning on same immutable props`, () => {
    const TestRecord = Record({b: 'default value'});

    render(<Stub a={TestRecord({b: 'some value'})} />, node)
    render(<Stub a={TestRecord({b: 'some value'})} />, node)

    const group = groupStore.entries[0][0]
    const warnMsg = warnStore.entries[0][2]

    assert.equal(group, `Stub.props`)
    assert.equal(warnStore.entries.length, 2);
    assert.ok(/Value did not change. Avoidable re-render!/.test(warnMsg))
  })

  it(`logs an warning on same nested immutable props`, () => {
    const warning = /Value did not change. Avoidable re-render!/
    const TestRecord = Record({b: 'default value', ref: {c: 1}});

    const createProps = () => TestRecord({b: 'some value', ref: {c: 2}});
    const a = createProps()

    render(<Stub a={createProps()} />, node)
    render(<Stub a={createProps()} />, node)

    assert.equal(warnStore.entries.length, 3)
    assert.equal(groupStore.entries.length, 3)
    assert.equal(groupStore.entries[0][0], `Stub.props`)
    assert.equal(groupStore.entries[1][0], `Stub.props.a`)
    assert.equal(groupStore.entries[2][0], `Stub.props.a.ref`)
    assert.ok(warning.test(warnStore.entries[0][2]))
    assert.ok(warning.test(warnStore.entries[1][2]))
    assert.ok(warning.test(warnStore.entries[2][2]))
    assert.deepEqual(logStore.entries[0][2], {a})
    assert.deepEqual(logStore.entries[1][2], {a})
    // immutable props can't be deepEqual
    assert.deepEqual(logStore.entries[4][2], {c: a.ref.c})
    assert.deepEqual(logStore.entries[5][2], {c: a.ref.c})
  })

  it(`logs an warning on nested props but excludes the parent`, () => {
    const warning = /Value did not change. Avoidable re-render!/
    const createProps = () => ({b: {c: 1}})
    const a = createProps()

    render(<Stub a={createProps()} />, node)
    render(<Stub a={createProps()} />, node)

    assert.equal(warnStore.entries.length, 3)
    assert.equal(groupStore.entries.length, 3)
    assert.equal(groupStore.entries[0][0], `Stub.props`)
    assert.equal(groupStore.entries[1][0], `Stub.props.a`)
    assert.equal(groupStore.entries[2][0], `Stub.props.a.b`)
    assert.ok(warning.test(warnStore.entries[0][2]))
    assert.ok(warning.test(warnStore.entries[1][2]))
    assert.ok(warning.test(warnStore.entries[2][2]))
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

    assert.equal(warnStore.entries.length, 1)
    assert.ok(warning.test(warnStore.entries[0][0]))
    assert.equal(logStore.entries[0][2], fn)
    assert.equal(logStore.entries[1][2], fn2)
  })

  it(`can ignore certain names using a regexp`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {exclude: /Stub/})

    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    assert.equal(warnStore.entries.length, 0)
  })

  it(`can ignore certain names using a string`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {exclude: 'Stub'})

    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    assert.equal(warnStore.entries.length, 0)
  })

  it(`can include only certain names using a regexp`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {include: /Foo/})

    class Foo extends React.Component {
      render () {
        return <noscript />
      }
    }

    const createInstance = () =>
      <div>
        <Stub a={1} />
        <Foo a={1} />
      </div>

    render(createInstance(), node)
    render(createInstance(), node)

    assert.equal(warnStore.entries.length, 1)
    assert.equal(groupStore.entries.length, 1)
    assert.equal(groupStore.entries[0][0], `Foo.props`)
  })

  it(`can include only certain names using a string`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {include: 'Foo'})

    class Foo extends React.Component {
      render () {
        return <noscript />
      }
    }

    const createInstance = () =>
      <div>
        <Stub a={1} />
        <Foo a={1} />
      </div>

    render(createInstance(), node)
    render(createInstance(), node)

    assert.equal(warnStore.entries.length, 1)
    assert.equal(groupStore.entries.length, 1)
    assert.equal(groupStore.entries[0][0], `Foo.props`)
  })

  it(`can both include an exclude a string`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {include: /Stub/, exclude: 'Foo'})

    class StubFoo extends React.Component {
      render () {
        return <noscript />
      }
    }

    class StubBar extends React.Component {
      render () {
        return <noscript />
      }
    }

    const createInstance = () =>
      <div>
        <Stub a={1} />
        <StubFoo a={1} />
        <StubBar a={1} />
      </div>

    render(createInstance(), node)
    render(createInstance(), node)

    assert.equal(warnStore.entries.length, 2)
    assert.equal(groupStore.entries.length, 2)
    assert.equal(groupStore.entries[0][0], `Stub.props`)
    assert.equal(groupStore.entries[1][0], `StubBar.props`)
  })

  it(`works with createClass`, () => {
    const Foo = React.createClass({
      displayName: 'Foo',

      render () {
        return <noscript />
      }
    })

    render(<Foo a={1} />, node)
    render(<Foo a={1} />, node)

    assert.equal(warnStore.entries.length, 1)
    assert.equal(groupStore.entries.length, 1)
    assert.equal(groupStore.entries[0][0], `Foo.props`)
  })

  it(`still calls the original componentDidUpdate for createClass`, done => {
    const Foo = React.createClass({
      displayName: 'Foo',

      componentDidUpdate () {
        done()
      },

      render () {
        return <noscript />
      }
    })

    render(<Foo a={1} />, node)
    render(<Foo a={1} />, node)

    assert.equal(warnStore.entries.length, 1)
  })
})
