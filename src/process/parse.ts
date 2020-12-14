import type { Rule, Token } from '../types'

import * as is from '../internal/is'

import { join, tail, includes } from '../internal/util'

// The parsing is stacked based
// when ever we find a group start
// - in strings ':' or '(',
// - array values
// - object keys and their value
// we add an empty marker string `""` into `groupings` to mark the group start
// if we find a variant or prefix we push it onto `groupings`
// once the group ends (whitespace or ')') we drop all entries until the last marker
// This way we can filter `groupings` for trithy values which are either
// a variant (starting with ':') or a prefix

// Shared variables used during parsing

// List of active groupings: either variant (':xxx') or prefix
let groupings: string[]

// List of parsed rules
let rules: Rule[]

// Handles template literal strings
// create a flat array with consecutive interpolated strings joined
// and falsy value ignored
const interleave = (strings: TemplateStringsArray, interpolations: Token[]): Token[] => {
  const result: Token[] = [strings[0]]

  for (let index = 0; index < interpolations.length; ) {
    // Join consecutive strings
    if (is.string(interpolations[index])) {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;(result[result.length - 1] as string) += (interpolations[index] as string) + strings[++index]
    } else {
      if (interpolations[index]) {
        result.push(interpolations[index])
      }

      result.push(strings[++index])
    }
  }

  return result
}

// Tokens maybe a template literal -> interleave it to a flat array
const asTokens = (tokens: unknown[]): Token[] =>
  Array.isArray(tokens[0]) && Array.isArray(((tokens[0] as unknown) as TemplateStringsArray).raw)
    ? interleave((tokens[0] as unknown) as TemplateStringsArray, tail(tokens) as Token[])
    : (tokens as Token[])

// A new group has been found
// this maybe a value (':variant' or 'prefix') or an empty marker string
const startGrouping = (value = ''): '' => {
  groupings.push(value)
  return ''
}

// Close a group
// Within strings we need to distinguish between a whitespace and a closing bracket
// a) if we have a whitespace
// we want to keep everything up to including the last group start
//
// b) if we have a non-whitespace
// we want to keep everything before the last group start
const endGrouping = (isWhitespace?: boolean): void => {
  const index = groupings.lastIndexOf('')

  if (~index) {
    groupings.splice(
      index + ~~(isWhitespace as boolean),
      groupings.length - index + ~~(isWhitespace as boolean),
    )
  }
}

const onlyPrefixes = (s: string): '' | boolean => s && s[0] !== ':'
const onlyVariants = (s: string): '' | boolean => s[0] === ':'

const saveRule = (buffer: string): '' => {
  const negate = buffer[0] === '-'

  if (negate) {
    buffer = tail(buffer)
  }

  const prefix = join(groupings.filter(onlyPrefixes))

  rules.push({
    v: groupings.filter(onlyVariants),
    d: buffer === '&' ? prefix : (prefix && prefix + '-') + buffer,
    n: negate,
  })

  return ''
}

const parseString = (token: string, isVariant?: boolean): void => {
  let char: string
  let buffer = ''

  for (let position = 0; position < token.length; ) {
    switch ((char = token[position++])) {
      case ':':
        buffer = buffer && startGrouping(':' + buffer)

        break

      case '(':
        // If there is a buffer this is the prefix for all grouped tokens
        buffer = buffer && startGrouping(buffer)

        startGrouping()

        break

      case ')':
      case ' ':
      case '\t':
      case '\n':
      case '\r':
        buffer = buffer && saveRule(buffer)
        endGrouping(char !== ')')

        break

      default:
        buffer += char
    }
  }

  if (buffer) {
    if (isVariant) {
      startGrouping(':' + buffer)
    } else {
      saveRule(buffer)
    }
  }
}

const parseGroupedToken = (token: Token): void => {
  startGrouping()

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  parseToken(token)

  endGrouping()
}

const parseGroup = (key: string, token: Token): void => {
  if (token) {
    startGrouping()

    // we care about: string, object and function
    // "undefined"
    // "object" - this includes arrays
    // "boolean"
    // "number"
    // "bigint"
    // "string"
    // "symbol"
    // "function"
    // 2nd char is uniq
    const isVariant = includes('tbu', (typeof token)[1])

    parseString(key, isVariant)

    if (isVariant) {
      parseGroupedToken(token)
    }

    endGrouping()
  }
}

const parseToken = (token: Token): void => {
  switch (typeof token) {
    case 'string':
      parseString(token)
      break
    case 'function':
      rules.push({
        v: groupings.filter(onlyVariants),
        d: token,
      })
      break
    case 'object':
      if (Array.isArray(token)) {
        token.forEach(parseGroupedToken)
      } else if (token) {
        Object.keys(token).forEach((key) => {
          parseGroup(key, token[key])
        })
      }
  }
}

export const parse = (tokens: unknown[], variants: string[] | undefined): Rule[] => {
  groupings = variants ? [...variants, ''] : ['']

  rules = []

  asTokens(tokens).forEach(parseToken)

  return rules
}
