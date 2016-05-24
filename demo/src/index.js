import React from 'react'
import {render} from 'react-dom'
import {Record} from 'immutable'

const TestRecord = Record({h: 1})

import whyDidYouUpdate from '../../src'

whyDidYouUpdate(React, {useImmutable: true})

class ClassDemo extends React.Component {
  render () {
    return <div />
  }
}

render(<ClassDemo a={1} b={{c: {d: 4}}} e={function something () {}} f={1} g={TestRecord({h: 2})} />, document.querySelector('#demo'))
render(<ClassDemo a={1} b={{c: {d: 4}}} e={function something () {}} f={2} g={TestRecord({h: 2})} />, document.querySelector('#demo'))
