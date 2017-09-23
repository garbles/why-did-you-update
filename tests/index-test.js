import {deepEqual, equal, ok} from 'assert'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import Immutable from 'immutable'

import whyDidYouUpdate from 'src/'

const noop = () => {}

const createConsoleStore = type => {
  const entries = []
  const fn = global.console[type]

  global.console[type] = (...args) => {
    entries.push(args)
    // uncomment to debug tests
    // fn.call(global.console, ...args)
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

  it(`logs a warning on same props`, () => {
    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    const group = groupStore.entries[0][0]
    const warnMsg = warnStore.entries[0][2]
    const prevProps = logStore.entries[0][2]
    const nextProps = logStore.entries[1][2]

    equal(group, `Stub.props`)
    ok(/Value did not change. Avoidable re-render!/.test(warnMsg))
    deepEqual(prevProps, {a: 1})
    deepEqual(nextProps, {a: 1})
  })

  it(`logs a warning on nested props but excludes the parent`, () => {
    const warning = /Value did not change. Avoidable re-render!/
    const createProps = () => ({b: {c: 1}})
    const a = createProps()

    render(<Stub a={createProps()} />, node)
    render(<Stub a={createProps()} />, node)

    equal(warnStore.entries.length, 3)
    equal(groupStore.entries.length, 3)
    equal(groupStore.entries[0][0], `Stub.props`)
    equal(groupStore.entries[1][0], `Stub.props.a`)
    equal(groupStore.entries[2][0], `Stub.props.a.b`)
    ok(warning.test(warnStore.entries[0][2]))
    ok(warning.test(warnStore.entries[1][2]))
    ok(warning.test(warnStore.entries[2][2]))
    deepEqual(logStore.entries[0][2], {a})
    deepEqual(logStore.entries[1][2], {a})
    deepEqual(logStore.entries[2][2], {b: a.b})
    deepEqual(logStore.entries[3][2], {b: a.b})
    deepEqual(logStore.entries[4][2], {c: a.b.c})
    deepEqual(logStore.entries[5][2], {c: a.b.c})
  })

  it(`logs a warning on function props`, () => {
    const warning = /Value is a function. Possibly avoidable re-render\?/
    const createFn = () => function sameFuncName () {}

    const fn = createFn()
    const fn2 = createFn()

    render(<Stub a={{b: fn}} />, node)
    render(<Stub a={{b: fn2}} />, node)

    equal(warnStore.entries.length, 1)
    ok(warning.test(warnStore.entries[0][0]))
    equal(logStore.entries[0][2], fn)
    equal(logStore.entries[1][2], fn2)
  })

  it(`logs a warning on immutables (1)`, () => {
    const foo = Immutable.List.of('bar')
    render(<Stub foo={foo} />, node)
    render(<Stub foo={foo} />, node)

    const warning = /Value did not change. Avoidable re-render!/
    equal(warnStore.entries.length, 2)
    equal(groupStore.entries.length, 2)
    equal(groupStore.entries[0][0], `Stub.props`)
    equal(groupStore.entries[1][0], `Stub.props.foo`)
    ok(warning.test(warnStore.entries[0][2]))
    ok(warning.test(warnStore.entries[1][2]))
    deepEqual(logStore.entries[0][2], {foo: foo.toJS()})
    deepEqual(logStore.entries[1][2], {foo: foo.toJS()})
    deepEqual(logStore.entries[2][2], foo.toJS())
    deepEqual(logStore.entries[3][2], foo.toJS())
  })

  it(`logs a warning on immutables (2)`, () => {
    const foo = Immutable.List.of('bar')
    render(<Stub foo={foo} />, node)
    render(<Stub foo={foo.map(e => e)} />, node)

    const warning = /Immutables are deeply equal. Possibly avoidable re-render?/
    equal(warnStore.entries.length, 1)
    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Stub.props.foo`)
    ok(warning.test(warnStore.entries[0][2]))
    deepEqual(logStore.entries[0][2], foo.toJS())
    deepEqual(logStore.entries[1][2], foo.toJS())
  })

  it(`logs a warning on multiple immutables`, () => {
    const foo1 = Immutable.List.of('bar')
    const foo2 = Immutable.List.of('bar')
    render(<Stub first={foo1} second={foo2} />, node)
    render(<Stub first={foo1} second={foo2} />, node)

    equal(warnStore.entries.length, 3)
    equal(groupStore.entries.length, 3)
    equal(warnStore.entries.length, 3)
  })

  it(`logs a warning on immutables and plain values`, () => {
    const foo = Immutable.List.of('bar')
    render(<Stub first={foo} second={'baz'} />, node)
    render(<Stub first={foo} second={'baz'} />, node)

    equal(warnStore.entries.length, 2)
    equal(groupStore.entries.length, 2)
    equal(warnStore.entries.length, 2)
  })

  it(`doesn't log a warning when a render was necessary`, () => {
    render(<Stub foo={1} />, node)
    render(<Stub foo={2} />, node)

    equal(warnStore.entries.length, 0)
  })

  it(`logs a warning when a render was necessary and deeply equal immutables are involved`, () => {
    const foo1 = Immutable.List.of('bar')
    const foo2 = Immutable.List.of('bar')
    render(<Stub foo={foo1} />, node)
    render(<Stub foo={foo2} />, node)

    const warning = /Immutables are deeply equal. Possibly avoidable re-render?/
    equal(warnStore.entries.length, 1)
    ok(warning.test(warnStore.entries[0][2]))
  })

  it(`logs a warning when a render was necessary and deeply equal immutables are involved (multiple)`, () => {
    const foo1 = Immutable.List.of('bar')
    const foo2 = Immutable.List.of('bar-same')
    const foo3 = Immutable.List.of('bar-same')
    render(<Stub foo-same={foo1} foo-changed={foo2} />, node)
    render(<Stub foo-same={foo1} foo-changed={foo3} />, node)

    const warning = /Immutables are deeply equal. Possibly avoidable re-render?/
    equal(warnStore.entries.length, 2)
    ok(warning.test(warnStore.entries[0][2]))
    ok(warning.test(warnStore.entries[1][2]))
  })

  it(`logs a warning when a render was necessary and deeply equal immutables are involved (nested)`, () => {
    const foo1 = Immutable.List.of('bar')
    const foo2 = Immutable.List.of('bar')
    render(<Stub foo={{baz: foo1}} />, node)
    render(<Stub foo={{baz: foo2}} />, node)

    const warning = /Immutables are deeply equal. Possibly avoidable re-render?/
    equal(warnStore.entries.length, 1)
    ok(warning.test(warnStore.entries[0][2]))
  })

  it(`doesn't log a warning when a render was necessary and immutables with distinct values are involved (1)`, () => {
    const foo1 = Immutable.List.of('bar')
    const foo2 = Immutable.List.of('baz')
    render(<Stub foo={foo1} />, node)
    render(<Stub foo={foo2} />, node)

    equal(warnStore.entries.length, 0)
  })

  it(`doesn't log a warning when a render was necessary and immutables with distinct values are involved (2)`, () => {
    const foo1 = Immutable.List.of('bar')
    const foo2 = Immutable.List.of('bar')
    const foo3 = Immutable.List.of('bar-different')
    render(<Stub foo-same={foo1} foo-changed={foo2} />, node)
    render(<Stub foo-same={foo1} foo-changed={foo3} />, node)

    equal(warnStore.entries.length, 0)
  })

  it(`doesn't log a warning when a render was necessary and immutables changed to plain values`, () => {
    const foo = Immutable.List.of('bar')
    render(<Stub foo={foo} />, node)
    render(<Stub foo={'bar'} />, node)

    equal(warnStore.entries.length, 0)
  })

  it(`doesn't log a warning when a render was necessary and immutables changed to plain values (nested)`, () => {
    const foo = Immutable.List.of('bar')
    render(<Stub foo={{bar: foo}} />, node)
    render(<Stub foo={{bar: 'bar'}} />, node)

    equal(warnStore.entries.length, 0)
  })

  it(`doesn't log a warning when a render was necessary and both immutables and plain values are involved`, () => {
    const foo = Immutable.List.of('bar')
    render(<Stub first={foo} second={'baz'} />, node)
    render(<Stub first={foo} second={'baz-changed'} />, node)

    equal(warnStore.entries.length, 0)
  })

  it(`can ignore certain names using a regexp`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {exclude: /Stub/})

    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    equal(warnStore.entries.length, 0)
  })

  it(`can ignore certain names using a string`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {exclude: `Stub`})

    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    equal(warnStore.entries.length, 0)
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

    equal(warnStore.entries.length, 1)
    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Foo.props`)
  })

  it(`can include only certain names using a string`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {include: `Foo`})

    class Foo extends React.Component {
      render () {
        return <noscript />
      }
    }

    class FooBar extends React.Component {
      render () {
        return <noscript />
      }
    }

    const createInstance = () =>
      <div>
        <Stub a={1} />
        <Foo a={1} />
        <FooBar a={1} />
      </div>

    render(createInstance(), node)
    render(createInstance(), node)

    equal(warnStore.entries.length, 1)
    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Foo.props`)
  })

  it(`can both include an exclude option`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {include: /Stub/, exclude: /Foo/})

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

    equal(warnStore.entries.length, 2)
    equal(groupStore.entries.length, 2)
    equal(groupStore.entries[0][0], `Stub.props`)
    equal(groupStore.entries[1][0], `StubBar.props`)
  })

  it(`accepts arrays as args to include/exclude`, () => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    whyDidYouUpdate(React, {include: [/Stub/], exclude: [/Foo/, `StubBar`]})

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

    equal(warnStore.entries.length, 1)
    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Stub.props`)
  })

  it(`works with createClass`, () => {
    const Foo = React.createClass({
      displayName: `Foo`,

      render () {
        return <noscript />
      }
    })

    render(<Foo a={1} />, node)
    render(<Foo a={1} />, node)

    equal(warnStore.entries.length, 1)
    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Foo.props`)
  })

  it(`still calls the original componentDidUpdate for createClass`, done => {
    const Foo = React.createClass({
      displayName: `Foo`,

      componentDidUpdate () {
        done()
      },

      render () {
        return <noscript />
      }
    })

    render(<Foo a={1} />, node)
    render(<Foo a={1} />, node)

    equal(warnStore.entries.length, 1)
  })
})
