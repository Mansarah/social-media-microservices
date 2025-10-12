require('dotenv').config()
const express= require('express')
const cors = require('cors')
const Redis= require('ioredis')
const helmet = require('helmet')
const {rateLimit} = require('express-rate-limit')
const {RedisStore}= require('rate-limit-redis')
const logger = require('./utils/logger')
const proxy = require('express-http-proxy')
const errorHandler= require('./middleware/errorHandler')
const { validateToken } = require('./middleware/authMiddleware')

const app = express()
const PORT  = process.env.PORT || 3000

const redisClient = new Redis(process.env.REDIS_URL)


// middleware 
app.use(helmet())   
app.use(cors())
app.use(express.json())

const globalLimiter = rateLimit({
    windowMs:15*60*1000, 
    max:100, 
    standardHeaders:true, 
    legacyHeaders:false, 
    handler:(req,res)=>{ 
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`)
         res.status(429).json({
            success:false,
            message:'Too many Requests'
        })
    },
    store:new RedisStore({ 
        sendCommand:(...args)=> redisClient.call(...args)
    })
})


app.use(globalLimiter)

// logging middleware 
app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body, ${req.body}`)
    next()
})

// api-gateway  -  /v1/auth/register                   ->3000
// auth-service -> /api/auth/register ->3001
// localhost://3000/v1/auth/register  -> localhost:3001/api/auth/register 

// create proxy helper
const proxyOptions = {
    proxyReqPathResolver : (req) =>{
        return req.originalUrl.replace(/^\/v1/,'/api')
    },
    proxyErrorHandler:(err,res,next)=>{
        logger.error(`Proxy error: ${err.message}`)
        res.status(500).json({
            message:`Internal server error`,error:err.message
        })
    }
}



//setting up proxy for auth-service

app.use('/v1/auth',proxy(process.env.AUTH_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["content-type"] = "application/json"
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from auth service: ${proxyRes.statusCode}`)
        return proxyResData
    }
}))


// setting up proxy for Post service
app.use('/v1/posts',validateToken,proxy(process.env.POST_SERVICE_URL,{
        ...proxyOptions,
         proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["content-type"] = "application/json"
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from post service: ${proxyRes.statusCode}`)
        return proxyResData
    }
}))

// setting up proxy for Media service
app.use('/v1/media',validateToken,proxy(process.env.MEDIA_SERVICE_URL,{
        ...proxyOptions,
         proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
               proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

               if(!srcReq.headers['content-type'].startsWith('multipart/form-data')){
        proxyReqOpts.headers["content-type"] = "application/json"
               }

   
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from media service: ${proxyRes.statusCode}`)
        return proxyResData
    },
    parseReqBody:false   // ensure entire-req-body is proxy for fileupload
}))

// setting up proxy for search service 
app.use('/v1/search',validateToken,proxy(process.env.SEARCH_SERVICE_URL,{
        ...proxyOptions,
         proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["content-type"] = "application/json"
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from post service: ${proxyRes.statusCode}`)
        return proxyResData
    }
}))



//global handler
app.use(errorHandler)

app.listen(PORT,()=>{
    logger.info(`API Gateway is running on port ${PORT}`)
    logger.info(`Auth Service is running on port ${process.env.AUTH_SERVICE_URL}`)
    logger.info(`Post Service is running on port ${process.env.POST_SERVICE_URL}`)
    logger.info(`Media Service is running on port ${process.env.MEDIA_SERVICE_URL}`)
    logger.info(`Search Service is running on port ${process.env.SEARCH_SERVICE_URL}`)
    logger.info(`Redis Url ${process.env.REDIS_URL}`)
})


