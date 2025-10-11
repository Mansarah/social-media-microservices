const Post = require("../models/Post")
const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");




// create post 
const createPost = async(req,res)=>{
     logger.info("Create post endpoint hit");
    try {
         //validate the schema
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
        const {content ,mediaIds}= req.body
        const newlyCreatedPost = new Post({
            user:req.user.userId,   // gte it from authmiddlware
            content,
            mediaIds: mediaIds || []
        })
        await newlyCreatedPost.save()
        logger.info('Post created Successfully',newlyCreatedPost)
        res.status(201).json({
            success:true,
            message:'Post created Successfully'
        })
    } catch (error) {
        logger.error('Error creating post',error)
        res.status(500).json({
            success:false,
            message:"Error creating post"
        })
        
    }
}


//get all post 

const getAllPosts = async(req,res)=>{
    try {
        
    } catch (error) {
        logger.error('Error fetching post',error)
        res.status(500).json({
            success:false,
            message:"Error fetching post"
        })
        
    }
}



//get post by id


const getPost = async(req,res)=>{
    try {
        
    } catch (error) {
        logger.error('Error fetching post by id',error)
        res.status(500).json({
            success:false,
            message:"Error fetching post by id "
        })
        
    }
}

// delete post 

const deletePost = async(req,res)=>{
    try {
        
    } catch (error) {
        logger.error('Error deleting post',error)
        res.status(500).json({
            success:false,
            message:"Error deleting post  "
        })
        
    }
}


module.exports={
    createPost
}