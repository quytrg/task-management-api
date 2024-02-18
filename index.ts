import dotenv from 'dotenv'
import express, { Express, Request } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import * as database from './config/database.config'
import routesApiVer1 from './api/v1/routes/index.route'

dotenv.config()
const app: Express = express()
app.use(cors<Request>())
app.use(cookieParser())
app.use(express.json())
database.connect()
const port: number | string = process.env.PORT || 3000

routesApiVer1(app)

app.listen(port, (): void => {
    console.log(`App listening on port ${port}`)
})
