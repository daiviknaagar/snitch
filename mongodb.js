const mongoose = require('mongoose')

const connectDB = () => {
    mongoose.connect("mongodb+srv://dummyuser:dummyuser@cluster0.aftluwv.mongodb.net/snitch")
        .then((data) => {
            console.log(`mongoDB connected to serve: ${data.connection.host}`)
        })
        .catch((err) => {
            console.log(err)
        })
}

module.exports = connectDB;