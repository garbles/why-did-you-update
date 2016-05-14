import {deepEqual} from 'assert'

import {normalizeOptions, DEFAULT_INCLUDE, DEFAULT_EXCLUDE} from 'src/normalizeOptions'

const toString = o => RegExp.prototype.toString.call(o)

const convertEqual = (include, includeOutput, exclude, excludeOutput) => {
  const opts = normalizeOptions({include, exclude})
  deepEqual(opts.include.map(toString), includeOutput.map(toString))
  deepEqual(opts.exclude.map(toString), excludeOutput.map(toString))
}

describe('normalizeOptions', () => {
  it('converts all include to an array of RegExps', () => {
    convertEqual('A', [/^A$/], 'B', [/^B$/])
    convertEqual(['A', 'B'], [/^A$/, /^B$/], undefined, [DEFAULT_EXCLUDE])
    convertEqual(/A/, [/A/], [`B`], [/^B$/])
    convertEqual([/A/, 'B'], [/A/, /^B$/], undefined, [DEFAULT_EXCLUDE])
    convertEqual([/A/, /B/], [/A/, /B/], undefined, [DEFAULT_EXCLUDE])
    convertEqual(undefined, [DEFAULT_INCLUDE], [/A/, /B/], [/A/, /B/])
  })
})
