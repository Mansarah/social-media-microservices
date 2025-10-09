const express = require('express')
const { authenticateRequest } = require('../middleware/authMiddleware')
const { createPost } = require('../controllers/post-controller')

const router = express.Router()

// middleware -> this will tell if the user is an auth user or not
router.use(authenticateRequest)


router.post('/create-post',createPost)



module.exports = router