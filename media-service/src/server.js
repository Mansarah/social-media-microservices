require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require('./middleware/errorHandler')
const connectToMediaDB = require('./db/db')
const rateLimit = require('express-rate-limit')
const {RedisStore}= require('rate-limit-redis')
const Redis = require('ioredis')
const logger = require('./utils/logger')
const mediaRoute = require('./routes/media-routes')



const app = express()
const PORT = process.env.PORT || 3004

connectToMediaDB()
const redisClient = new Redis(process.env.REDIS_URL)

//middlware
app.use(helmet())
app.use(cors())
app.use(express.json())


app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next()
})
 



// per-endpoint rate limiting(ip based rate limiting for sensitive endpoints)

const sensitiveEndpointsLimiterForMedia = rateLimit({
    windowMs:15*60*1000, 
    max:100, 
    standardHeaders:true, 
    legacyHeaders:false, 
    handler:(req,res)=>{  
        logger.warn(`Sensitive endpoint rate limit exceeded(upload-media) for IP: ${req.ip}`)
         res.status(429).json({
            success:false,
            message:'Too many Requests'
        })
    },
    store:new RedisStore({ 
        sendCommand:(...args)=> redisClient.call(...args)
    })
})

app.use('/api/media/upload',sensitiveEndpointsLimiterForMedia)


app.use('/api/media',mediaRoute)


app.use(errorHandler);



app.listen(PORT,()=>{
    logger.info(`Media service running on port ${PORT}`)
})

//unhandled promise rejection

process.on("unhandledRejection",(reason,promise)=>{
    logger.error("Unhandled Rejection at",promise,"reason",reason)
})

