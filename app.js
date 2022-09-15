const express = require('express')
const app = express()

const config = require('./config')
const Task = require('./models/task')

const mongoose = require('mongoose')
mongoose.set("strictQuery", false)
mongoose.connect(config.db.connection, {useNewUrlParser: true, useUnifiedTopology: true})

app.get("/", async (req, res) => {
    const tasks = await Task.find().exec()
    res.send(tasks)
})

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})
