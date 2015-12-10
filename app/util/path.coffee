module.exports =
  getRoutePath: (from, to) ->
    return ['/reitti', encodeURIComponent(from), encodeURIComponent(to)].join('/')
