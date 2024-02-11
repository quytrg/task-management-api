require('dotenv').config()
const express = require('express')
const database = require('./config/database')
const routesApiVer1 = require('./api/v1/routes/index.route')

const app = express()
database.connect()
const port = process.env.PORT

routesApiVer1(app)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
