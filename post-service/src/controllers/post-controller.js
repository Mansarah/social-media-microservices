const Post = require("../models/Post")
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitmq");
const { validateCreatePost } = require("../utils/validation");

// Cache Invalidation =creating or deleting or updating cached data when the database changes.

// Why Needed: To prevent showing stale/old data after create, update, or delete operations.

// When to Invalidate Cache:
// Create Post → remove cache so new post appears.
// Update Post → remove cache so edits are reflected.
// Delete Post → remove cache so deleted post disappears.



async function invalidatePostCache(req,input){

    const cachedKey = `post:${input}`
    await req.redisClient.del(cachedKey)

    const keys = await req.redisClient.keys("posts:*")
    if(keys.length > 0){
        await req.redisClient.del(keys)
    }

}

// create post invalidate cahcing(for create and delete)
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

        // publish an event 
 await publishEvent('post.created',{
            postId:newlyCreatedPost._id.toString(),
            userId: newlyCreatedPost.user.toString(),
            content:newlyCreatedPost.content,
            createdAt:newlyCreatedPost.createdAt,
          
        })

        await invalidatePostCache(req, newlyCreatedPost._id.toString())
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


//get all post -- redis caching

const getAllPosts = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const startIndex = (page-1)*limit 


        //cahce key 
        const cacheKey = `posts:${page}:${limit}`
        const cachedPosts = await req.redisClient.get(cacheKey)

        if(cachedPosts){
            return res.json(JSON.parse(cachedPosts))
        }

        

        const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

        const totalNoPost = await Post.countDocuments()

        const result ={
            posts,
            currentpage:page,
            totalPage:Math.ceil(totalNoPost/limit),
            totalPost:totalNoPost
        }

        //save your post in redis cache(first save your post in cache)
        await req.redisClient.setex(cacheKey,300,JSON.stringify(result))

        res.json(result)
    } catch (error) {
        logger.error('Error fetching post',error)
        res.status(500).json({
            success:false,
            message:"Error fetching post"
        })
        
    }
}



//get post by id

// invalidate ache in single when we do like dislike functionlity 
const getPost = async(req,res)=>{
    try {
        const postId = req.params.id 
        const cachedKey =  `post:${postId}`

         const cachedPost = await req.redisClient.get(cachedKey)

        if(cachedPost){
            return res.json(JSON.parse(cachedPost))
        }

        const singlePostDetailsById = await Post.findById(postId)
        if(!singlePostDetailsById){
            return res.status(404).json({
                success:false,
                message:'POST NOT FOUNd'
            })
        }
     //save your post in redis cache(first save your post in cache)
        await req.redisClient.setex(cachedKey,3600,JSON.stringify(singlePostDetailsById))

        res.json(singlePostDetailsById)

    } catch (error) {
        logger.error('Error fetching post by id',error)
        res.status(500).json({
            success:false,
            message:"Error fetching post by id "
        })
        
    }
}

// delete post 
// here we will make like only user that have created the post only he can delete the post of thier own post
const deletePost = async(req,res)=>{
    try {
        const post = await Post.findOneAndDelete({
            _id:req.params.id,
            user:req.user.userId,
        })
        if(!post){
             return res.status(404).json({
                success:false,
                message:'POST NOT FOUNd'
            })
        }
        //publish post delete method 

        await publishEvent('post.deleted',{
            postId:post._id.toString(),
            userId: req.user.userId,
            mediaIds:post.mediaIds
        })

        await invalidatePostCache(req,req.params.id)
        res.json({
            success:true,
            message:'Post deleted successfully'
        })
    } catch (error) {
        logger.error('Error deleting post',error)
        res.status(500).json({
            success:false,
            message:"Error deleting post  "
        })
        
    }
}


module.exports={
    createPost,
    getAllPosts,
    getPost,
    deletePost

}