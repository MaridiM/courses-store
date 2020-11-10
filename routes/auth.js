const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')

const User = require('../models/user')
const config = require('../emails/config')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const { registerValidator } = require('../utils/validators')


const transporter =  nodemailer.createTransport(config.GSMTP)

router.get('/login',  async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        registerError: req.flash('registerError'),
        loginError: req.flash('loginError'), 
    })
})
router.get('/logout',  async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })

})

router.post('/login', async (req, res) => {

    try {
        const {email, password} = req.body
        const candidate = await User.findOne({email})

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)
            if (areSame) {
                req.session.user = candidate  // записываем данные пользоветеля в сессию
                req.session.isAuthenticated = true
                req.session.save(err => {
                    if (err) {
                        throw err
                    }
                    res.redirect('/')
                })
            } else {
                req.flash('loginError', "Неверный пароль")
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginError', "Такого пользователя не существует")
            res.redirect('/auth/login#login')
        }

    } catch (err) {
        console.log(err)
    }
})

router.post('/register', registerValidator, async (req, res) => {
    try {
        const {email, password, name} = req.body
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            email, password: hashPassword, name, cart: {items: []}
        })

        await user.save()
        res.redirect('/auth/login#login')

        await transporter.sendMail(regEmail(email, password), (err) => {
            if (err) throw err
            console.log(`Mail sent to ${email}`)
        })
    } catch (err) {
        console.log(err)
    }
})

router.get('/reset', (req, res, next) => {
    res.render('auth/reset', { 
        title: 'Забыли пароль?',
        error: req.flash('error')
    })
})

router.post('/reset', async (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что то пошло не так, повторите попытку позже')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex') 

            const candidate = await User.findOne({email: req.body.email})

            if (candidate) {
                candidate.resetToken = token //задаем токен пользователю 
                candidate.resetTokenExp = Date.now() + 60 * 60 * 100  //задаем время  токену  1  час (60 минут * 60 секунд * 1000 милисекунд)
                
                await candidate.save()  //добавляем токены в бд  пользователю
                await transporter.sendMail(resetEmail(candidate.email, token))

                res.redirect('/auth/login')

            } else {
                req.flash('error', 'Такого email нет!')
                res.redirect('/auth/reset')
            }

        })
    } catch (err) {
        console.log(err)
    }
})

router.get('/password/:token', async (req, res) => {
    console.log(req.params)
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,       // сравнение токенов
            resetTokenExp: { $gt: Date.now() }  // Сравнение по дате,  если  больше ($gt) теперешнего времени то  проходит 
        })
        
        if(!user) {
            return res.redirect('/auth/login')
        } else {

            res.render('auth/password', {
                title: 'Восстановить  доступ',
                error: req.flash('error'),
                userId: user._id.toString(),
                token:  req.params.token
            })
        }
    } catch (err) {
        console.log(err)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10) //  хешируем пароль(шифруем)
            user.resetToken = undefined         // Перезатераем
            user.resetTokenExp = undefined      // Перезатераем

            await user.save()

            res.redirect('/auth/login')
        } else {
            req.flash('error', 'Время жизни токена истекло')
            res.redirect('/auth/login')
        }
    } catch (err) {
        console.log(err)
    }
})


module.exports = router