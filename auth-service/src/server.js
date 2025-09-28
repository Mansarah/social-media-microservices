const dotenv = require('dotenv')
dotenv.config()
const connectToAuthDB = require("./db/db");
const logger = require('./utils/logger')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')




const app = express()
const PORT= process.env.PORT || 3001



// connect to mongodb
connectToAuthDB()

{/*
helmet()

Purpose:Improves the security of your Express app by setting various HTTP headers automatically.

Examples:

Prevents browsers from guessing MIME types (X-Content-Type-Options).

Adds protections against cross-site scripting (XSS) attacks (X-XSS-Protection, CSP).

Helps prevent clickjacking (X-Frame-Options).

In short: Reduces common vulnerabilities by hardening your HTTP headers.

 */}

// middleware
app.use(helmet())   
app.use(cors())
app.use(express.json())


app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request ti ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next()
})







app.listen(PORT,()=>{
    logger.info(`user service running on prot ${PORT}`)
})