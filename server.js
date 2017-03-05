/* Node */
var express = require('express')
var app = express()
app.use(express.static(__dirname + '/public'))
var bodyParser = require('body-parser')
app.use(bodyParser.json())
const MongoClient = require('mongodb').MongoClient
var db

MongoClient.connect('mongodb://138.68.162.165:27017', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(8080, () => {
    console.log('listening on 8080')
  })
})

app.get('/', (req, res) => {
    res.sendFile( __dirname + "/public/index.html" )
})

app.get('/:hex', (req, res) => {
    res.send(req.params.base64string)
   // JSON.parse(hex)
})

// When user saves/share song
app.post('/share', (req, res) => {
    db.collection('song').insert(req.body, (err, result) => {
      if (err) return console.log(err)

      console.log('saved to database')
      res.end() // eller res.end(return true or false)
    })
})