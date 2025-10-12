const Media = require("../models/Media")
const { uploadMediaToCloudinary } = require("../utils/cloudinaryUtils")
const logger = require("../utils/logger")





const uploadMedia = async (req,res)=>{
    logger.info("upload media endpoint hit")
    try {
        // console.log('req.file.file',req.file)
        if(!req.file){
            logger.error("No file found. Please add a file and try again!")
            return res.status(400).json({
                success:false,
                message:"No file found.Please add a file and try again!"
            })
        }

        const {originalname, mimetype , buffer} = req.file
        const userId = req.user.userId

        logger.info(`File details name=${originalname},type=${mimetype}`)
        logger.info('Uploading to cloudniary starting...')


        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file)
        logger.info(`Cloduinary upload succesfully. Public Id
            : - ${cloudinaryUploadResult.public_id}`)


            const newlyCreatedMedia = new Media({
                publicId:cloudinaryUploadResult.public_id,
                originalName:originalname,
                mimeType:mimetype,
                url:cloudinaryUploadResult.secure_url,
                userId
            })

            await newlyCreatedMedia.save()

            res.status(201).json({
                success:true,
                medaiId :newlyCreatedMedia._id,
                url:newlyCreatedMedia.url,
                message:"Media Upload is successfully"
            })
    } catch (error) {
        logger.error('Error creating media',error)
        res.status(500).json({
            success:false,
            message:"Error creating media"
        })
        
    }
}

module.exports={uploadMedia}
