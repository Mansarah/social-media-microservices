const mongoose= require('mongoose')
const logger = require('../utils/logger')



const connectToMediaDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI_MEDIA)
        logger.info("Connected to mediaDB")
    } catch (error) {
        logger('Error while connection mediaDB',error)
        process.exit(1)
        
    }
}

module.exports = connectToMediaDB