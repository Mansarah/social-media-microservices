const mongoose= require('mongoose')
const logger = require('../utils/logger')



const connectToSearchDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI_SEARCH)
        logger.info("Connected to PostDB")
    } catch (error) {
        logger('Error while connection PostDb',error)
        process.exit(1)
        
    }
}

module.exports = connectToSearchDB