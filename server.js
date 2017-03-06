/* Node */
var express = require('express')
var app = express()
app.use(express.static(__dirname + '/public'))
var bodyParser = require('body-parser') // Used to parse the POST-request
app.use(bodyParser.json())
const MongoClient = require('mongodb').MongoClient
var db
// app.use('/favicon.ico', express.static('/favicon.ico'))

MongoClient.connect('mongodb://138.68.162.165:27017/ozzy', (err, database) => {
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
  console.log(req.params)
  db.collection('song').find().toArray((err,results) => {
    
  })

  res.send()
  // JSON.parse(hex)
})

// When user saves/share song
app.post('/share', (req, res) => {
  db.collection('song').insert(req.body, (err, result) => {
    if (err) return console.log(err)
    
    console.log('saved to database')
    res.end(result.insertedIds[0].toString()) // eller res.end(return true or false)
  })
})