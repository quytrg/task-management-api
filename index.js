require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const database = require('./config/database')
const routesApiVer1 = require('./api/v1/routes/index.route')

const app = express()
app.use(cors())
app.use(cookieParser())
app.use(express.json())
database.connect()
const port = process.env.PORT

routesApiVer1(app)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
