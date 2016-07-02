const express = require('express')
const mongodb = require('mongodb')
const path = require('path')
const http = require('http')
const fs = require('fs')
const browserify = require('browserify')
const app = express()
const server = http.createServer(app)
const MongoClient = mongodb.MongoClient
const URI = 'mongodb://localhost:27017/media-monitor'
const PORT = 3000

function connect(callback) {
  MongoClient
    .connect(URI)
    .then(db => {
      callback(db)
    })
    .catch(e => console.error(e))
}

function count(collection, callback) {
  connect((db) => {
    if (db) {
      db.collection(collection)
        .count()
        .then(count => callback(count))
        .catch(e => console.error(e))
        .then(() => db.close())
    }
  })
}

function find(collection, query, sort, limit, callback) {
  connect((db) => {
    if (db) {
      db.collection(collection)
        .find(query)
        .sort(sort)
        .limit(limit)
        .toArray()
        .then(docs => callback(docs))
        .catch(e => console.error(e))
        .then(() => db.close())
    }
  })
}

function status(req, res) {
  count(collection='tweets', (tweets) => {
    count(collection='user', (users) => {
      count(collection='archive', (archive) => {
        find(collection='tweets', {}, {'_id': -1}, 1, (lastTweets) => {
          res.json({
            'count': {
              'tweets': tweets,
              'users': users,
              'archive': archive
            },
            'last_tweet': new Date(lastTweets[0]['created_at']).toUTCString(),
            'timestamp': new Date().toUTCString()
          })
        })
      })
    })
  })
}

// bundle client-side code
browserify('./client/dashboard.js')
  .transform('babelify', {presets: ['es2015', 'react']})
  .bundle()
  .pipe(fs.createWriteStream('./client/public/bundle.js'))

// configure routing
app.use(express.static(__dirname + '/client/public'))
app.get('/api/status', status)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client', 'dashboard.html'))
})

// start server
server.listen(PORT, () => {
  console.log(`[Listening] Port: ${server.address().port}`)
  console.log(`[Listening] Press Ctrl+C to quit`)
})
