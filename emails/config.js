const keys = require('../keys')

module.exports = {
    GSMTP: {
            host: keys.HOST,
            port: keys.PORT,
            secure: true,
            auth: {
                user: keys.EMAIL_FROM,
                pass: keys.PASSWORD
            }
        }
}