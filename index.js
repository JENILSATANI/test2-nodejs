const express = require('express')
const app = express()
const cors = require('cors')
var PORT = process.env.PORT || 9900;
const corsOptions = {
    origin: '*'
}
const mongoose = require('mongoose')
const db = 'mongodb+srv://jenilsatani:jenilsatani123@cluster0.d2ai8.mongodb.net/upload?retryWrites=true&w=majority'
mongoose.connect(db).then(() => {
    console.log(`connected successfully`);
}).catch((err) => console.log(`not succesflly`))
var bodyParser = require("body-parser");
app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const userUpload = require('./api')
app.use('/', express.static('public'))
app.use('/', userUpload);

app.listen(PORT, () => { console.log('be success', PORT) })