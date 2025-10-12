const mongoose= require('mongoose')
const logger = require('../src/utils/logger')



const connectToPostDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI_POST)
        logger.info("Connected to PostDB")
    } catch (error) {
        logger('Error while connection PostDb',error)
        process.exit(1)
        
    }
}

module.exports = connectToPostDB