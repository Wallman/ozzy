/* Node */
let express = require('express')
let app = express()
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile( __dirname + "/public/index.html" )
})

app.get('/:base64string', (req, res) => {
   res.send(req.params.base64string)
})

app.post('/:base64string', (req, res) => {

})

var server = app.listen(3000, function () {
   let host = server.address().address
   let port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})