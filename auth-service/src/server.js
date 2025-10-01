const dotenv = require('dotenv')
dotenv.config()
const connectToAuthDB = require("./db/db");
const logger = require('./utils/logger')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const {RateLimiterRedis}= require('rate-limiter-flexible')
const Redis = require('ioredis')
const {rateLimit} = require('express-rate-limit')
const {RedisStore}= require('rate-limit-redis')
const routes = require('./routes/user-service')
const errorHanlder = require('./middleware/errorHandler')

const app = express()
const PORT= process.env.PORT || 3001



// connect to mongodb
connectToAuthDB()

// redis 

const redisClient = new Redis(process.env.REDIS_URL)
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
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next()
})
 
//after redis client create DDos protection and rate limiting

// the general rate limiter (DDoS protection) applied to all routes.
const rateLimiter = new RateLimiterRedis({
    storeClient:redisClient,
    keyPrefix: 'middleware',
    points:10,
    duration:1  // 10 request in 1 sec
})

app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn(`Rate limiter exceeded for IP:${req.ip}`)
        res.status(429).json({
            success:false,
            message:'Too many Requests'
        })
    })
})

// per-endpoint rate limiting(ip based rate limiting for sensitive endpoints)

const sensitiveEndpointsLimiter = rateLimit({
    windowMs:15*60*1000, // 15 minutes = the timeframe for rate limiting
    max:50, // max 50 requests per IP within windowMs
    standardHeaders:true, // adds RateLimit headers (RFC standard: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
    legacyHeaders:false, // disables old headers (X-RateLimit-*)
    handler:(req,res)=>{  // custom response when limit exceeded
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`)
         res.status(429).json({
            success:false,
            message:'Too many Requests'
        })
    },
    store:new RedisStore({ // use Redis to store counters across multiple servers
        sendCommand:(...args)=> redisClient.call(...args)
    })
})

// apply this sensitiveEndpoints to our routes
app.use('/api/auth/register',sensitiveEndpointsLimiter)

//Routes
app.use('/api/auth',routes)


//error handler 
app.use(errorHanlder)

app.listen(PORT,()=>{
    logger.info(`user service running on port ${PORT}`)
})


// unhandled promise rejection

process.on('unhandledRejection',(reason,promise)=>{
    logger.error('Unhandled Rejection at', promise, 'reason', reason)
})