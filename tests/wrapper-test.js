import {deepEqual, equal, ok} from 'assert'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import whyDidYouUpdate from 'src/'

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

describe(`whyDidYouUpdate wrapper`, () => {
  let node
  let groupStore
  let warnStore
  let logStore

  beforeEach(() => {
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

  it(`can ignore certain names using a regexp`, () => {
    whyDidYouUpdate(React, {exclude: /Stub/})

    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    equal(warnStore.entries.length, 0)
  })

  it(`can ignore certain names using a string`, () => {
    whyDidYouUpdate(React, {exclude: `Stub`})

    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    equal(warnStore.entries.length, 0)
  })

  it(`can include only certain names using a regexp`, () => {
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

    equal(warnStore.entries.length, 2)
    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Foo`)
  })

  it(`can include only certain names using a string`, () => {
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

    equal(warnStore.entries.length, 2)
    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Foo`)
  })

  it(`can both include and exclude option`, () => {
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

    equal(warnStore.entries.length, 4)
    equal(groupStore.entries.length, 2)
    equal(groupStore.entries[0][0], `Stub`)
    equal(groupStore.entries[1][0], `StubBar`)
  })

  it(`accepts arrays as args to include/exclude`, () => {
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

    equal(warnStore.entries.length, 2)
    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Stub`)
  })

  it(`works with createClass`, () => {
    whyDidYouUpdate(React)

    const Foo = React.createClass({
      displayName: `Foo`,

      render () {
        return <noscript />
      }
    })

    render(<Foo a={1} />, node)
    render(<Foo a={1} />, node)

    equal(warnStore.entries.length, 2)
    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Foo`)
  })

  it(`still calls the original componentDidUpdate for createClass`, done => {
    whyDidYouUpdate(React)

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
