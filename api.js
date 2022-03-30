const express = require('express');
const app = express()
const User = require('./model.js/med')
var router = express.Router();
const fileupload = require('express-fileupload')
app.use(fileupload)
const { ObjectId } = require('mongodb')
var jwt = require('jsonwebtoken');
var secret = 'bgmi';
const { uploadimage } = require('./upload')
const Person = require('./model.js/user')



router.put('/savepassword', function (req, res) {
    Person.findOne({ email: req.body.email }).exec(function (err, user) {
        if (err) throw err;
        if (req.body.password == null || req.body.password == '') {
            res.json({ success: false, message: 'Password not provided' });
        } else {
            user.password = req.body.password;
            user.save(function (err) {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    // var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '24h' });
                    res.json({ success: true, message: 'Password has been reset!' });
                }
            });
        }
    });
});

router.post('/per', uploadimage, (req, res) => {
    console.log("Hello");
    let data = new Person();
    data.username = req.body.username,
        data.email = req.body.email,
        data.mobilenumber = req.body.mobilenumber,
        data.password = req.body.password
    data.photo = req.file.filename,
        data.photo_path = "https://medicinesinfo.herokuapp.com/" + req.file.filename
    data.save((err) => {
        if (err) {
            console.log(err)
        }
    })
    res.json({ success: true, message: "register success" });
}
)


// router.post('/reg', uploadimage, (req, res) => {
//     console.log("Hello");
//     let data = new Person();
//     data.usename = req.body.username,
//     data.email = req.body.email
//     data.mobilenumber = req.body.mobilenumber
//     data.password = req.body.password
//     data.photo = req.file.filename,
//      data.photo_path = "http://localhost:9900/" + req.file.filename
//     data.save((err) => {
//         if (err) {
//             console.log(err)
//         }
//     })
//     res.json({ success: true, message: "register success" });
// }
// )

router.post('/', uploadimage, (req, res) => {
    console.log("Hello");
    let data = new User();
    data.name = req.body.name,
        data.description = req.body.description
    data.quantities = req.body.quantities
    data.price = req.body.price
    data.photo = req.file.filename,
        data.photo_path = "https://medicinesinfo.herokuapp.com/" + req.file.filename
    data.save((err) => {
        if (err) {
            console.log(err)
        }
    })
    res.json({ success: true, message: "register success" });
}
)
router.post('/adduser', uploadimage, async (req, res) => {
    console.log("Hello");
    let data = new User()
    data.name = req.body.name
    data.description = req.body.description
    data.quantities = req.body.quantities
    data.price = req.body.price
    data.photo = req.file.filename;
    data.photo_path = "https://medicinesinfo.herokuapp.com/" + req.file.filename
    data.save((err) => {
        if (err) {
            console.log(err)
        }
    })
    res.send(req.body);
}
)

router.get('/ML', (req, res) => {
    console.log("deedddcode", req.decoded)
    User.find({}).exec(function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: fale, message: 'User not found' });
        } else {
            res.json({ success: true, message: 'get details Successfully', data: user });
        }
    })
})
router.delete("/:id", async (req, res) => {
    console.log("delete", req.decoded)
    const user = await User.findByIdAndDelete(req.params.id);
    res.send(user)

})
router.post('/login', function (req, res) {
    Person.findOne({ email: req.body.email }).select('email password').exec(function (err, user) {
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
                        res.json({ success: false, message: 'Please Enter Right Password' });
                    } else{
                    // res.send(user);
                    var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '1h' });

                    res.json({ success: true, message: 'User authenticated!', token: token });
                }
                }
            }
        }
    });
})
router.post('/otp', function (req, res) {
    Person.findOne({ mobilenumber: req.body.mobilenumber }).select('mobilenumber password').exec(function (err, user) {
        if (err) throw err;
        else {
            if (!user) {
                res.json({ success: false, message: 'mobilenumber and password not provided !!!' });
            } else if (user) {
                if (!req.body.password) {
                    res.json({ success: false, message: 'No password provided' });
                } else {
                    var validPassword = user.comparePassword(req.body.password);
                    if (!validPassword) {
                        res.json({ success: false, message: 'Please Enter Right Password' });
                    } else{
                    // res.send(user);
                    var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '1h' });

                    res.json({ success: true, message: 'User authenticated!', token: token });
                }
                }
            }
        }
    });
})

router.use(function (req, res, next) {

    var token = req.body.token || req.body.query || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                res.json({ success: false, message: 'Token invalid' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.json({ success: false, message: 'No token provided' });
    }
});

router.get('/users', (req, res) => {
    console.log("deedddcode", req.decoded)
    Person.find({}).exec(function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: fale, message: 'User not found' });
        } else {
            res.json({ success: true, message: 'get details Successfully', data: user });
        }
    })
})

router.get('/user', (req, res) => {
    console.log("deedddcode", req.decoded)
    Person.findById(ObjectId(req.decoded.id)).exec(function (err, user) {
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
                console.log("err", err);
            } else {
                res.status(200).json({
                    data: result, success: true
                })
            }
        })
})



// router.put('/user', uploadimage, async (req, res) => {
//     console.log("past____-", req.decoded);
//     Person.findById(ObjectId(req.decoded.id)).exec((err, result) => {

//         result.username = req.body.username
//         result.email = req.body.email
//         result.mobilenumber = req.body.mobilenumber
//         result.photo = req.file.filename;
//         result.photo_path = "http://localhost:9900/" + req.file.filename;
//         result.save()
//         res.json({ success: "true", message: "done" })
//     })   
// })

router.put('/user', uploadimage, async (req, res) => {
    console.log("past____-", req.body);
Person.findById(ObjectId(req.decoded.id)).exec((err, result) => {
    if(err) {
        console.log(err)
    } 
    else {
        if(req.file == null) {
            result.username = req.body.username
            result.email = req.body.email
            result.mobilenumber = req.body.mobilenumber
            result.save()
            res.send()
        }
      else{
        result.username = req.body.username
        result.email = req.body.email
        result.mobilenumber = req.body.mobilenumber
        result.photo = req.file.filename;
        result.photo_path = "https://medicinesinfo.herokuapp.com/" + req.file.filename;
        result.save()
        res.json({ success: "true", message: "done" })
          result.save(function(err){
              if(err){
                  console.log(err);
              }
          }); 
          res.send("update")
      }
    }
})


})
router.put('/edit/:id', uploadimage, async (req, res) => {
    console.log("past____-", req.body);
    User.findOne({ _id: req.params.id }).exec((err, result) => {
        if (err) {
            console.log(err)
        }
        else {
            if (req.file == null) {

                result.name = req.body.name
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
                result.photo_path = "https://medicinesinfo.herokuapp.com/" + req.file.filename;

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

router.delete("/de/:id", async (req, res) => {
    console.log("delete", req.decoded)
    const user = await Person.findByIdAndDelete(req.params.id);
    res.send()

})
module.exports = router;