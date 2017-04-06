/* Node */
var express = require('express')
var app = express()
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
var bodyParser = require('body-parser') // Used to parse the POST-request
app.use(bodyParser.json())
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var db

MongoClient.connect('mongodb://138.68.162.165:27017/ozzy', (err, database) => {
  if (err) return console.log(err)
  db = database
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/:songId', (req, res) => {
  if(req.params.songId.length == 24){
    var id = new ObjectID(req.params.songId)
    db.collection('song').findOne({_id: id}, (err, result) => {
      if(err) console.log(err)
      if(result){
        res.render('index', { savedSong: JSON.stringify(result.matrixes) })
      }
      else{
        res.render('cantfind')
      }
    })
  }
  else{
    res.render('cantfind')
  }
})

// When user saves/share song
app.post('/share', (req, res) => {
  db.collection('song').insert(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.send(result.insertedIds[0].toString()) // eller res.end(return true or false)
  })
})

app.listen(8080, () => {
  console.log('listening on 8080')
})
