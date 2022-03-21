const express = require('express');
const app = express()
const User = require('./modal')
var router = express.Router();
var bodyParser = require("body-parser");
app.use(bodyParser.json());
const fileupload = require('express-fileupload')
app.use(fileupload)
const { ObjectId } = require('mongodb')
var jwt = require('jsonwebtoken');
var secret = 'bgmi';
const { uploadimage } = require('./upload')
app.use(bodyParser.urlencoded({ extended: true })); 

router.put('/savepassword', function (req, res) {
    User.findOne({email: req.body.email}).exec(function (err, user) {
        if (err) throw err;
        if (req.body.password == null || req.body.password == '') {
            res.json({ success: false, message: 'Password not provided' });
        } else {
            user.password = req.body.password;
            user.save(function (err) {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '24h' });
                    res.json({ success: true, message: 'Password has been reset!', token: token });
                }
            });
        }
    });
});

router.post('/', uploadimage, (req, res) => {
    console.log("Hello");
    let data = new User()
    data.username= req.body.username
    data.name = req.body.name
    data.email = req.body.email
    data.mobilenumber = req.body.mobilenumber
    data.password = req.body.password
    data.description = req.body.description
    data.quantities = req.body.quantities
    data.price = req.body.price
    data.photo = req.file.filename,
        data.photo_path = "http://localhost:9900/" + req.file.filename
    data.save((err) => {
        if (err) {
            console.log(err)
        }
    })
    res.json({success:true , message:"register success"});
}
)



router.post('/login', function(req, res){
    User.findOne({email:req.body.email}).select('email password').exec(function(err, user) {
        if (err) throw err;
        else {
            if (!user) {
                res.json({ success: false, message: 'email and password not provided !!!' });
            } else if (user) {
                if (!req.body.password) {
                    res.json({ success: false, message: 'No password provided' });
                } else {
                    var validPassword = user.comparePassword(req.body.password);
                    if (!validPassword) {
                        res.json({ success: false, message: 'Could not authenticate password' });
                    } else{
                        //res.send(user);
                        res.json({ success: true, message: 'User authenticated!'});
                    }             
                }
            }
        }   
    });
});

router.get('/', (req, res) => {
    User.find({}).exec(function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: fale, message: 'User not found' });
        } else {
            res.json({ success: true, message: 'get details Successfully', data: user });
        }
    })
})
router.get('/get/:id', (req, res) => {
    const id = req.params.id
    User.findById(ObjectId(id))
        .exec(function (err, result) {
            if (err) {
                console.log("err", err)
            } else {
                res.status(200).json({
                    data: result, success: true
                })
            }
        })
})

router.post('/adduser', uploadimage, async (req, res) => {
    console.log("Hello");
    let data = new User()
    data.name = req.body.name
    data.description = req.body.description
    data.quantities = req.body.quantities
    data.price = req.body.price
    data.photo = req.file.filename;
    data.save((err) => {
        if (err) {
            console.log(err)
        }
    })
    res.send(req.body);
}
)

router.put('/edit/:id', uploadimage, async (req, res) => {
    console.log("past____-", req.body);
    User.findOne({ _id: req.params.id }).exec((err, result) => {
        if (err) {
            console.log(err)
        }
        else {
            if (req.file == null) {
                
                result.name = req.body.name,s
                result.description = req.body.description
                result.quantities = req.body.quantities
                result.price = req.body.price
                result.save()
                res.send()
            }
            else {
                result.name = req.body.name,
                result.description = req.body.description
                    result.quantities = req.body.quantities
                    result.price = req.body.price
                result.photo = req.file.filename;
                result.photo_path = "http://localhost:9900/" + req.file.filename;

                result.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
                res.send("update")
            }
        }
    })


})
router.delete("/:id", async (req, res) => {

    const user = await User.findByIdAndDelete(req.params.id);
    res.send(user)

})
module.exports = router