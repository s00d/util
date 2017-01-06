import qs from 'query-string'
import template from 'string-template'
import isPlainObject from 'lodash/isPlainObject'
import merge from './cheap-merge'
import promisify from './promisify'

const defaultOptions = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  method: 'GET',
  // 强制返回的结果按 JSON 处理，用于 File 协议的请求
  forceJSON: false
}

const mutators = []

export function configure ({ mutate, mutator, ...options }) {
  if (mutate) {
    process.env.NODE_ENV === 'production' || console.warn('`mutate` is deprecated. use `mutator` instead.')
    mutator = mutate
  }

  if (mutator) {
    mutators.push(mutator)
  }

  merge(defaultOptions, options)
}

/**
 * request
 *
 *   request({
 *     url: 'path',
 *     query: { ... },
 *     params: { ... },
 *     body: { ... }
 *     headers: { ... }
 *   })
 *   request('path')
 *   request('path', { ... })
 *
 * @param  {String|Object} options   Options
 * @return {Promise}                 Promise
 */
export default function request (...args) {
  if (args.length === 0) {
    process.env.NODE_ENV === 'production' || console.warn('URL or Options is Required!')
    return
  }

  if (typeof args[0] === 'string') {
    if (args[1] === undefined) {
      args[1] = {}
    } else if (!isPlainObject(args[1])) {
      process.env.NODE_ENV === 'production' || console.warn('Options MUST be Object!')
      return
    }
    args[1].url = args[0]
    args[0] = args[1]
  }

  if (!isPlainObject(args[0])) {
    process.env.NODE_ENV === 'production' || console.warn('Options MUST be Object!')
    return
  }

  return new Promise((resolve, reject) => {
    promisify(parseOptions(merge({}, defaultOptions, args[0])))
    .then(({ url, ...options }) => fetch(url, options))
    .then(res => {
      const { forceJSON } = args[0]
      if (res && (isHttpOk(res) || isFileOk(res))) {
        getBody(res, forceJSON).then(resolve, reject)
      } else {
        getBody(res, forceJSON).then(reject)
      }
    })
    .catch(reject)
  })
}

function isHttpOk (res) {
  return res.status >= 200 && res.status < 400
}

// 支持 file 协议的访问
function isFileOk (res) {
  return res.status === 0 && (res.url.indexOf('file://') === 0 || res.url === '')
}

function getBody (res, forceJSON) {
  const type = res.headers.get('Content-Type')
  return (forceJSON || (type && type.indexOf('json') !== -1)) ? res.json() : res.text()
}

function parseOptions ({ url = '', query, params, body, mutate, mutator, ...options }) {
  if (body) {
    if (typeof body === 'object') {
      if (/^(POST|PUT|PATCH)$/i.test(options.method)) {
        body = JSON.stringify(body)
      } else {
        url += ((url.indexOf('?') !== -1) ? '&' : '?') + qs.stringify(body)
        body = null
      }
    }
    if (body) {
      options.body = body
    }
  }

  if (query) {
    if (typeof query === 'object') {
      query = qs.stringify(query)
    }

    if (query) {
      url += ((url.indexOf('?') !== -1) ? '&' : '?') + query
    }
  }

  // 替换地址中的宏变量：{xyz}
  if (params) {
    url = template(url, params)
  }

  options.url = url

  if (mutate) {
    process.env.NODE_ENV === 'production' || console.warn('`mutate` is deprecated. use `mutator` instead.')
    mutator = mutate
  }

  // mutate must be a function and could return a promise
  // useful for adding authorization
  return iterateMutators(options, mutator ? mutators.concat(mutator) : mutators.slice(0))
}

function iterateMutators (options, mutators) {
  function iterator (options) {
    const mutator = mutators.shift()
    if (!mutator) {
      return options
    }
    return promisify(mutator(options)).then(iterator)
  }
  return iterator(options)
}

export function get (url, options = {}) {
  options.url = url
  options.method = 'GET'
  return request(options)
}

export function post (url, options = {}) {
  options.url = url
  options.method = 'POST'
  return request(options)
}

export function put (url, options = {}) {
  options.url = url
  options.method = 'PUT'
  return request(options)
}

export function patch (url, options = {}) {
  options.url = url
  options.method = 'PATCH'
  return request(options)
}

export function del (url, options = {}) {
  options.url = url
  options.method = 'DELETE'
  return request(options)
}
