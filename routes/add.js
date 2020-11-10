const express = require('express')
const Course = require('./../models/course')
const auth = require('../middleware/auth')
const router = express.Router()


router.get('/', auth, (req, res, next) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true
    })
})
router.post('/', auth, async (req, res, next) => {
    const {title, price, img} = req.body
    const course = new Course({title, price, img, userId: req.user})
    try {
        await course.save()
    } catch (err) {
        console.log(err)
    }
    res.redirect('/courses')
})

module.exports = router