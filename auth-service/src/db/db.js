const mongoose = require('mongoose')
const logger = require('../utils/logger')


const connectToAuthDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        logger.info("Connected to mongodb")
    } catch (error) {
       
        logger.error('Mongodb connection error',error)
        process.exit(1)
        
    }
}

module.exports= connectToAuthDB