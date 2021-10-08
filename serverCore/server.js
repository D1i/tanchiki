const express = require('express')
const cors = require('cors')
const app = express()

const playerList = {};
const jsonParser = express.json()

app.use(cors())

app.post('/move', jsonParser, function (req, res, next) {
    console.log(playerList)
    playerList[req.body.playerName] = req.body.position;
    res.send(playerList[Object.keys(playerList).filter(i => i !== req.body.playerName)[0]]);
})

app.listen(9990, function () {
    console.log('CORS-enabled web server listening on port 9990')
})
