/**
 * fetch 请求
 * @type {Object}
 */

const defaultUrl = 'http://localhost:3000'

const DEFAULT_OPTIONS = {
  method: 'GET',
  headers: {
    'Cache-Control': 'no-cache'
  }
}

function transform(query) {
  const result = []
  Object.keys(query).forEach((key) => {
    result.push(`${key}=${query[key]}`)
  })
  return result
}

export function send(url, options) {
  let fetchUrl = /^https?:\/\//i.test(url) ? url : defaultUrl + url
  if (options && options.query) {
    fetchUrl += `?${transform(options.query).join('&')}`
  }

  const fetchOptions = Object.assign({}, DEFAULT_OPTIONS, options)
  return fetch(fetchUrl, fetchOptions)
    .then(response => response.json())
    .then((res) => {
      if (res.status === 0) {
        return Promise.resolve(res.data)
      } else if (res.status === 1 && res.data.errorCode === 403) {
        window.location.href = '/logout'
      }
      return Promise.reject(res)
    })
    .catch(err => Promise.reject(err))
}

export function postJSON(url, data) {
  const fetchUrl = /^https?:\/\//i.test(url) ? url : defaultUrl + url
  const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }
  const fetchOptions = Object.assign({}, DEFAULT_OPTIONS, options)
  return fetch(fetchUrl, fetchOptions)
    .then(response => response.json())
    .then((res) => {
      if (res.status === 0) {
        return Promise.resolve(res.data)
      } else if (res.status === 1 && res.data.errorCode === 403) {
        window.location.href = '/logout'
      }
      return Promise.reject(res)
    })
    .catch(err => Promise.reject({ message: err.message, data: err }))
}
