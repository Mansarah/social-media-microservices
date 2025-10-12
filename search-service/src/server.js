require('dotenv').config()
const express = require('express')
const Redis = require('ioredis')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require('./middleware/errorHandler')
const {RedisStore}= require('rate-limit-redis')
const logger = require('./utils/logger')
const rateLimit = require('express-rate-limit')
const connectToSearchDB = require('./db/db')
const { connectToRabbitMQ } = require('./utils/rabbitmq')
const searchRoutes= require('./routes/search-routes')
const { handlePostCreated } = require('./eventHanlder/search-event-handler')



const app = express()
const PORT = process.env.PORT || 3004;

connectToSearchDB()

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
 

//route
app.use('/api/search',searchRoutes)


app.use(errorHandler);



async function startServer() {
  try {
    await connectToRabbitMQ();

    //consume the events / subscribe to the events
    await consumeEvent("post.created",handlePostCreated);
    await consumeEvent("post.deleted");

    app.listen(PORT, () => {
      logger.info(`Search service is running on port: ${PORT}`);
    });
  } catch (e) {
    logger.error(e, "Failed to start search service");
    process.exit(1);
  }
}

startServer();