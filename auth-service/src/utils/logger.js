const winston = require('winston')

const logger = winston.createLogger({
    level:process.env.NODE_ENV  ==='production'  ? 'info' :'debug',  
    format:winston.format.combine(  // format of message
        winston.format.timestamp(),   // add timestamp everytime
        winston.format.errors({stack : true}),  // include the stack  trace in the log entry if there is any error
        winston.format.splat(),  // enable the support for message template
        winston.format.json() 
    ),
    defaultMeta:{service:'auth-service'},   // this is meta data
    // Define where logs should be sent
    transports:[   
         // Log to console (terminal)
        new winston.transports.Console({
            format:winston.format.combine(
                winston.format.colorize(), // Colorize log levels in console
                winston.format.simple() // Simple text format for console output
            ),
        }),
                // Log errors to a file named 'error.log'
        new winston.transports.File({filename:'error.log',level:'error'}),  // if there is any error it log in auth-service 
         // Log all messages (info, warn, error, debug, etc.) to 'combined.log'
        new winston.transports.File({filename:"combined.log"}) // this is the file create all combine error
    ]
})

module.exports = logger