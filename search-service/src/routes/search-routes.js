const express = require('express')
const { searchPostController } = require('../controllers/search-controller')
const { authenticateRequest } = require('../../../post-service/src/middleware/authMiddleware')




const router = express.Router()


app.use(authenticateRequest)
app.use('/search-post',searchPostController)



module.exports = router