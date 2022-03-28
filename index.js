const express = require('express')
const app = express()
var port = process.env.PORT || 9900;
const mongoose = require('mongoose')
const db = 'mongodb+srv://jenilsatani:jenilsatani123@cluster0.d2ai8.mongodb.net/upload?retryWrites=true&w=majority'
mongoose.connect(db).then(() => {
    console.log(`connected successfully`);
}).catch((err) => console.log(`not succesflly`))
var bodyParser = require("body-parser");
const cors = require('cors')
// const corsOptions = {
//     origin: '*'
// }
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cors())
const userUpload = require('./api')
app.use('/', express.static('public'))
app.use('/', userUpload);    

app.listen(port , ()=>{console.log('be success')})