const express = require('express')
const oldApp = express()
const port = 3000

oldApp.use(express.static('public'))

oldApp.get('/', (req, res) => {
    //res.sendFile(__dirname + '/gamePage.html')
    res.sendFile(__dirname + '/gamePage.html')
})

oldApp.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})