const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer') //library for dealing with files. Express doesn't support transfer of files
const sharp = require('sharp')   // library for resizing images
const { sendWelcomeEmail, sendGoodByeEmail } = require('../emails/account')



router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {

        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})


router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }

})


router.post('/users/logout', auth, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()

    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {

    try {

        req.user.tokens = []
        await req.user.save()
        res.send()

    } catch (e) {
        res.status(500).send()
    }

})


router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove()
        res.send(req.user)
        sendGoodByeEmail(req.user.email, req.user.name)

    } catch (e) {
        res.status(500).send(e)
    }
})



const upload = multer({
    limits: {
        fileSize: 1_000_000
    },
    fileFilter(req, file, callback) {

        if (!file.originalname.match(/(jpg|jpeg|png)$/)) {
            return callback(new Error('File should be jpg, jpeg or png.'))
        }

        callback(undefined, true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})



router.delete('/users/me/avatar', auth, async (req, res) => {

    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(400).send({ errorMessage: e })
    }
})


router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        //setting up response Header --> it is a key-value pair
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }

})



module.exports = router