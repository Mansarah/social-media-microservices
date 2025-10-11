require('dotenv').config()
const express = require('express')
const Redis = require('ioredis')
const cors = require('cors')
const helmet = require('helmet')
const postRoutes = require('./routes/post-routes')
const errorHandler = require('./middleware/errorHandler')
const {RedisStore}= require('rate-limit-redis')
const logger = require('./utils/logger')
const connectToPostDB = require('../db/db')
const rateLimit = require('express-rate-limit')



const app = express()
const PORT = process.env.PORT || 3002;

connectToPostDB()

const redisClient = new Redis(process.env.REDIS_URL)


// middleware
app.use(helmet())   
app.use(cors())
app.use(express.json())


app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next()
})
 



// per-endpoint rate limiting(ip based rate limiting for sensitive endpoints)

const sensitiveEndpointsLimiterForPost = rateLimit({
    windowMs:15*60*1000, 
    max:1000, 
    standardHeaders:true, 
    legacyHeaders:false, 
    handler:(req,res)=>{  
        logger.warn(`Sensitive endpoint rate limit exceeded(create-post) for IP: ${req.ip}`)
         res.status(429).json({
            success:false,
            message:'Too many Requests'
        })
    },
    store:new RedisStore({ 
        sendCommand:(...args)=> redisClient.call(...args)
    })
})
const sensitiveEndpointsLimiterForGetPost = rateLimit({
    windowMs:15*60*1000, 
    max:100, 
    standardHeaders:true, 
    legacyHeaders:false, 
    handler:(req,res)=>{  
        logger.warn(`Sensitive endpoint rate limit exceeded(get-post) for IP: ${req.ip}`)
         res.status(429).json({
            success:false,
            message:'Too many Requests'
        })
    },
    store:new RedisStore({ 
        sendCommand:(...args)=> redisClient.call(...args)
    })
})


// routes --> pass your redis client to routes 

app.use('/api/posts/create-post',sensitiveEndpointsLimiterForPost,(req,res,next)=>{
    req.redisClient = redisClient
    next()
})

app.use('/api/posts/get-all-post',(req,res,next)=>{
    req.redisClient = redisClient
    next()
},sensitiveEndpointsLimiterForGetPost)

app.use('/api/posts',(req,res,next)=>{
    req.redisClient = redisClient
    next()
},postRoutes)


app.use(errorHandler);



app.listen(PORT,()=>{
    logger.info(`Post service running on port ${PORT}`)
})

//unhandled promise rejection

process.on("unhandledRejection",(reason,promise)=>{
    logger.error("Unhandled Rejection at",promise,"reason",reason)
})

