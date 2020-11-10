const express = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')

const router = express.Router()

const isOwner = (course, req) => {
    // проверка на совпадение  ID создателя  и  ID  активного  пользователя
    return course.userId.toString() === req.user._id.toString() 
}

router.get('/', async (req, res, next) => {
    try {
        const courses = await Course.find()
            .populate('userId', 'email name')
            .select(('title price img'))
    
        res.render('courses', {
            title: 'Курсы',
            isCurses: true,
            userId: req.user ? req.user._id.toString() : null, // если  пользовавтель авторизирован
            courses
        })

    } catch (err) {
        console.log(err)
    }
})

router.get('/:id/edit', auth,  async (req, res) => {
    if(!req.query.allow) {
        return res.redirect('/courses')
    }

    try {
        const course = await Course.findById(req.params.id)

        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course,
        })
    } catch(err) {
        console.log(err)
    }
})

router.post('/edit', auth, async (req, res) => { 
    try {
        const {id} = req.body
        delete req.body.id
        
        const course = await Course.findById(id)

        if(!isOwner(course, req)){ // если  не владелец то  редирект
            return res.redirect('/courses')
        }

        Object.assign(course, req.body)
        await course.save()
            
        res.redirect('/courses')
    } catch (err) {
        console.log(err)
    }
})

router.post('/remove', auth, async (req, res) => {
    
    try {
        await Course.deleteOne({    // удаление при совпадении id, и  создателя курсов и активного  пользователя
            _id: req.body.id,
            userId: req.user._id 
        })
        res.redirect('/courses')
    } catch (err) {
        console.log(err)
    }
})


router.get('/:id',  async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        res.render('course', {
            layout: 'empty',
            title: course.title,
            course
        })
    } catch (err) {
        console.log(err)
    }
    
})

module.exports = router