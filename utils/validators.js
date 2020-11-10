const { body } = require('express-validator')
const User = require('../models/user')

exports.registerValidator = [
    body('email')
        .isEmail()
        .withMessage('Введите коректный email')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({email: value})
                if(user) {
                    return Promise.reject('Такой email уже занят')
                }
            } catch (err) {
                console.log(err)
            }
        })
        .normalizeEmail(),
    body('password', 'Пароль минимум 8 символов')
        .isLength({ min: 8, max: 56 })
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error ('Пароли должны совпадать')
            }
            return true
        })
        .trim(),
    body('name')
        .isLength({min: 3})
        .withMessage('Имя должно быть минимум 3 символа')
        .trim(),
]