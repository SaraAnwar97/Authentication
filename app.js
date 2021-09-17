const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
app.use(express.json());

//undefined
// console.log(process.env.NODE_ENV);


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/auth', authRoutes);
app.use(userRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message });
})

mongoose
    .connect(
        process.env.MONGODB_URI,
        { useNewUrlParser: true },
        { useUnifiedTopology: true }
    )
    .then((result) => {
        //most host providers will provide a port number
        app.listen(process.env.PORT || 3000, () => {
            console.log("Server is running");
        })
    })
    .catch((err) => {
        console.log(err);
    });
