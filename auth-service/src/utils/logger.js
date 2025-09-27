const winston = require('winston')

const logger = winston.createLogger({
    level:process.env.NODE_ENV  ==='production'  ? 'info' :'debug',
    format:winston.format.combine(
        winston.format.timestamp,
        winston.format.errors({stack : true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta:{service:'auth-service'},
    transports:[
        new winston.transport.Console({
            format:winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new winston.transport.File({filename:'error.log',level:'error'}),  // if there is any error it log in auth-service 
        new winston.transport.File({filename:"combined.log"}) // this is the file create all combine error
    ]
})

module.exports = logger