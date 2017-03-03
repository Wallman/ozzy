/* Node */
let express = require('express')
let app = express()
app.use(express.static(__dirname + '/public'))
let bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.sendFile( __dirname + "/public/index.html" )
})

app.get('/:hex', (req, res) => {
    res.send(req.params.base64string)
   // JSON.parse(hex)
})

app.post('/share', (req, res) => {
    console.log(req)
    //Prepare output in JSON format
    response = {
      data:req.body
    }
    console.log(response);
    res.end(JSON.stringify(response))
})

var server = app.listen(8080, function () {
    let host = server.address().address
    let port = server.address().port
   
    console.log("Example app listening at http://%s:%s", host, port)
})
