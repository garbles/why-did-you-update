import React from 'react'
import {render} from 'react-dom'

import whyDidYouUpdate from '../../src'

whyDidYouUpdate(React)

class ClassDemo extends React.Component {
  render () {
    return <div />
  }
}

const FactoryDemo = React.createClass({
  render () {
    return <div />
  }
})

render(<ClassDemo a={1} b={{c: {d: 4}}} e={function something () {}} f={1} />, document.querySelector('#demo'))
render(<ClassDemo a={1} b={{c: {d: 4}}} e={function something () {}} f={2} />, document.querySelector('#demo'))
