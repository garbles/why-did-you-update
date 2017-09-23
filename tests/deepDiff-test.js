import {deepEqual, equal, ok} from 'assert'
import {classifyDiff, DIFF_TYPES} from 'src/deepDiff'

const diffType = (prev, next, name = 'MyComponent.props') => classifyDiff(prev, next, name).type

describe('classifyDiff', () => {
  it('detects same object passed to props as avoidable', () => {
    const props = {}
    equal(diffType(props, props), DIFF_TYPES.SAME)
  })

  it('detects equal props as avoidable', () => {
    const prev = {a: 1, b: [11, 22]}
    const next = {a: 1, b: [11, 22]}
    equal(diffType(prev, next), DIFF_TYPES.EQUAL)
  })

  it('detects change of single field in props as unavoidable', () => {
    const prev = {a: 1, b: [11, 22]}
    const next = {a: 2, b: [11, 22]}
    equal(diffType(prev, next), DIFF_TYPES.UNAVOIDABLE)
  })

  it('detects update of empty state as avoidable', () => {
    equal(diffType(null, null, 'MyComponent.state'), DIFF_TYPES.SAME)
  })

  it('detects state change from null to object as unavoidable', () => {
    equal(diffType(null, {a: 1}, 'MyComponent.state'), DIFF_TYPES.UNAVOIDABLE)
  })

  it('detects change of function with the same name as potentially avoidable', () => {
    const prev = {a: () => {}, b: [11, 22]}
    const next = {a: () => {}, b: [11, 22]}
    equal(diffType(prev, next), DIFF_TYPES.FUNCTIONS)
  })

  it('detects change of function with different name as unavoidable', () => {
    const prevFn = function fnName1 () {}
    const nextFn = function fnName2 () {}
    const prev = {a: prevFn}
    const next = {a: nextFn}
    equal(diffType(prev, next), DIFF_TYPES.UNAVOIDABLE)
  })

  it('returns object with changed function without non-function fields', () => {
    const createFn = () => function onChange () {}

    const prevFn = createFn()
    const prev = {a: prevFn, b: [11, 22]}

    const nextFn = createFn()
    const next = {a: nextFn, b: [11, 22]}

    const diff = classifyDiff(prev, next, 'MyComponent.props')
    equal(diff.type, DIFF_TYPES.FUNCTIONS)
    deepEqual(diff.prev, {a: prevFn})
    deepEqual(diff.next, {a: nextFn})
  })
})
