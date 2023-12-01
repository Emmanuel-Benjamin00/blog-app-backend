import blogModel from "../models/blogs.js";
import { Status } from "../common/utils.js"
import userModel from "../models/users.js";
import nodemailer from 'nodemailer'

const createBlog = async (req, res) => {
    try {
        const { title, imageUrl, description } = req.body
        let admin = await userModel.findOne({ role: "admin" })
        console.log(admin)
        if (title && imageUrl && description) {
            await blogModel.create({
                title,
                imageUrl,
                description,
                createdBy: req.headers.userId
            })
            sendMail(admin.email)
            res.status(201).send({
                message: "Blog Created, Sent for approval"
            })
            
        }
        else {
            res.status(400).send({
                message: "Title , ImageURL , Description are required"
            })
        }
    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        })
    }

    //Send mail 
    async function sendMail(mailReceiver) {
        try {
            // Create Transporter with email configuration
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASS
                }
            });

            // Email Content
            const mailOptions = {
                from: process.env.EMAIL_ID,
                to: mailReceiver,
                subject: 'Request for Post in Blog',
                text: `Requesting to post in blog`
            };

            // Send mail
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
        } catch (error) {
            console.log('Error sending email:', error);
        }
    }
}

const editBlog = async (req, res) => {
    try {
        const blogId = req.params.id
        if (blogId) {
            const { title, imageUrl, description } = req.body
            let blog = await blogModel.findById(blogId)
            blog.title = title
            blog.imageUrl = imageUrl
            blog.description = description
            blog.status = Status.PENDING
            blog.modifiedAt = Date.now()

            await blog.save()

            res.status(200).send({
                message: "Blog Edited Successfully"
            })
        }
        else {
            res.status(400).send({ message: "BlogID not found" })
        }
    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

const getAllBlogs = async (req, res) => {
    try {
        let blogs = await blogModel.find({}, { _id: 1, title: 1, imageUrl: 1, createdAt: 1, status: 1 }).sort({ createdAt: 1 })
        res.status(200).send({
            message: "Blogs Fetched Successfully",
            blogs
        })
    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

const getBlogById = async (req, res) => {
    try {
        const blogId = req.params.id
        if (blogId) {
            let blog = await blogModel.findById(req.params.id)
            res.status(200).send({
                message: "Blog Data Fetched Successfully",
                blog
            })
        }
        else {
            res.status(400).send({ message: "BlogID not found" })
        }
    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

const getBlogsByUserId = async (req, res) => {
    try {
        let blogs = await blogModel.find({ createdBy: req.headers.userId }, { _id: 1, title: 1, imageUrl: 1, createdAt: 1, status: 1 }).sort({ createdAt: 1 })
        res.status(200).send({
            message: "Blogs Fetched Successfully",
            blogs
        })
    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        })
    }
}


const updateBlogStatus = async (req, res) => {
    try {
        const blogId = req.params.id
        const status = req.params.status
        if (blogId && status) {
            const { reason } = req.body
            let blog = await blogModel.findById(blogId)
            if (status === Status.APPROVED) {
                blog.status = Status.APPROVED
                blog.approvedBy = req.headers.userId
                blog.reason = ""
            }
            else if (status === Status.REJECTED) {
                blog.status = Status.REJECTED
                blog.rejectedBy = req.headers.userId
                blog.reason = reason
            }
            else {
                blog.status = Status.PENDING

            }
            blog.modifiedAt = Date.now()
            await blog.save()

            res.status(200).send({
                message: "Blog Status Updated Successfully"
            })
        }
        else {
            res.status(400).send({ message: "BlogID not found" })
        }
    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export default {
    createBlog,
    editBlog,
    getAllBlogs,
    getBlogById,
    getBlogsByUserId,
    updateBlogStatus
}