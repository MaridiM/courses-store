const express = require('express')
const path = require('path')
const mongoose =require('mongoose')
const session  = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const helmet = require('helmet')
const compression = require('compression')

const Handlebars = require('handlebars')
const exphbs  = require('express-handlebars')
// Import function exported by newly installed node modules.
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const fileMiddleware = require('./middleware/file')
const errorHandler = require('./middleware//error')
const keys = require('./keys')
const User = require('./models/user')
const homeRoutes = require('./routes/home')
const coursesRoutes = require('./routes/courses')
const addRoutes = require('./routes/add')
const cardRoutes = require('./routes/card')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')


const app = express()


const store = new MongoStore({
    collection: 'sessions',
    uri:  keys.MONGODB_URI
})


app.engine('.hbs', exphbs({
    defaultLayout: 'main', 
    extname: '.hbs',
    helpers: require('./utils/hbs_helpers'),
    // ...implement newly added insecure prototype access
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', '.hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))
app.use(helmet())
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ['self'],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"],
            styleSrc: ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css", `${keys.BASE_URL}/css/style.css`],
            imgSrc: ["'self'", "data: https:", "image/svg", "image/png", "image/jpg", "image/jpeg", "image/gif"],
            upgradeInsecureRequests: [],
        },
    })
)
app.use(fileMiddleware.single('avatar'))
app.use(compression())
app.use(csrf())
app.use(flash())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add', addRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)


app.use(errorHandler)


const PORT = process.env.PORT || 8000

const start = async () => {
    try {                           
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true, 
            useFindAndModify: false
        })

        const candidate = await User.findOne()
        if(!candidate) {
            const user = new User({
                email: 'maridim.dev@gmail.com', 
                name: 'MaridiM',
                card: {items: []}
            })

            await user.save()
        }       
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()