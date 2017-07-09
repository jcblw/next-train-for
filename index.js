var { rail } = require('lametro')

function findInDisplayName(str) {
  return (curr, next) => {
    const pattern = new RegExp(str, 'gi')
    if (next.display_name.match(pattern)) {
      return next
    }
    return curr
  }
}

module.exports = function nextTrainFor({
  station = 'culver city',
  train = 'expo'
}) {
  const resp = {}
  return proutes()
    .then(routes => {
      const route = routes.items.reduce(findInDisplayName(train))
      resp.route = route
      return pstops(route.id)
    })
    .then(stops => {
      const stop = stops.items.reduce(findInDisplayName(station))
      resp.stop = stop
      return ppredictions(stop.id)
    })
    .then(predictions => {
      resp.predictions = predictions.items.sort((curr, next) => {
        return curr.minutes > next.minutes
      })
      return Promise.resolve(resp)
    })
}

function proutes() {
  return new Promise(function(resolve, reject) {
    rail.routes(function(err, routes) {
      if (err) return reject(err)
      resolve(routes)
    })
  })
}

function pstops(id) {
  return new Promise(function(resolve, reject) {
    rail.routesStops({ id }, function(err, stops) {
      if (err) return reject(err)
      resolve(stops)
    })
  })
}

function ppredictions(id) {
  return new Promise(function(resolve, reject) {
    rail.stopsPredictions({ id }, function(err, predictions) {
      if (err) return reject(err)
      resolve(predictions)
    })
  })
}
