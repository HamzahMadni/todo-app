const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const expressSession = require('express-session')

const config = require('./config')
const User = require('./models/user')
const Task = require('./models/task')

const mongoose = require('mongoose')
mongoose.set("strictQuery", false);
mongoose.connect(config.db.connection, {useNewUrlParser: true, useUnifiedTopology: true});

app.set("view engine", "ejs")
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride('_method'))

app.use(expressSession({
    secret: "jfkasdhfueqerytihfjkvbncxmbuighqpiuerhgqepfghjkvncnmaliurhg",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session()) // Allows persisitent sessions
passport.serializeUser(User.serializeUser()) // What data should be stored in session
passport.deserializeUser(User.deserializeUser()) // Get the user datafrom the stored session
passport.use( new LocalStrategy(User.authenticate())) // Use the local strategy

//Current User Middleware Config
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

app.get("/", (req, res) => {
    res.redirect("/todos")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.post("/signup", async (req, res) => {
    try {
        await User.register(new User ({
            username: req.body.username,
            email: req.body.email
        }), req.body.password)

        passport.authenticate('local')(req, res, () => {
            res.redirect("/todos")
        })
    } catch (err) {
        res.send(err)
    }
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", passport.authenticate('local', {
    successRedirect: '/todos',
    failureRedirect: '/login'
}))

app.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err) }
        res.redirect("/login")
    })
})

app.get("/todos", isLoggedIn, async (req, res) => {
    try {
        const tasks = await Task.find({"owner.id": req.user._id}).exec()
        res.render('todos', {tasks})
    } catch (err) {
        res.send(err)
    }
})

app.post("/todos", isLoggedIn, async (req, res) => {
    try {
        const newTask = {
            title: req.body.title,
            date: req.body.date,
            owner: {
                id: req.user._id,
                username: req.user.username
            }
        }
        await Task.create(newTask)
        res.redirect("/todos")
    } catch (err) {
        res.send(err)
    }
})

app.put("/todos/:id/edit", isLoggedIn, async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.id, req.body).exec()
        res.redirect("/todos")
    } catch (err) {
        res.send(err)
    }
})

app.delete("/todos/:id", async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id).exec()
        res.redirect("/todos")
    } catch (err) {
        res.send(err)
    }
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect("/login")
    }
}

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})
