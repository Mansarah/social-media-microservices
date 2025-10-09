const mongoose = require('mongoose')


const postSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true
    },
    content:{
        type:String,
        required:true,

    },
    mediaUrls :[
        {
            type:String
        }
    ],
    createdAt:{
        type: Date,
        default:Date.now
    }
},{
    timestamps:true
})

// database schema on content (search by content )
// as we already makking the search service so we can skip this 
postSchema.index({content:'text'})

const Post = mongoose.model('Post',postSchema)
module.exports = Post
