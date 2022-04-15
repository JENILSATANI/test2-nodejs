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
const config = require('./config');
const client = require('twilio')(config.accountID, config.authToken)
const { OAuth2Client } = require('google-auth-library')
CLIENT_ID = "248862242390-vejemohbhpou0rpuc1114qcfefm3ndt1.apps.googleusercontent.com"
const clientp = new OAuth2Client(CLIENT_ID)

router.post("/google", async (req, res) => {
    const { token } = req.body
    const ticket = await clientp.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const { name, email, picture, mobilenumber } = ticket.getPayload();
    console.log(name);
    console.log(email);
    console.log(picture);
    Person.find({ email: email }).exec(function (err, user) {
        console.log("user", user.length)
        if (user && user.length != 0) {
            console.log("sssss")
            var token1 = jwt.sign({ email: email }, secret, { expiresIn: '1h' });
            res.json({ success: true, message: 'User authenticated!', token: token1 });
        } else {
            const user = new Person()
            user.username = name;
            user.email = email;
            user.photo_path = picture
            user.mobilenumber = mobilenumber
            console.log(user)
            user.save(function (err) {
                if (err) {
                    console.log(err)
                } else {
                    var token = jwt.sign({ email: email }, secret, { expiresIn: '1h' });
                    res.json({ success: true, message: 'User authenticated!', token: token });
                }
            })
        }
    })
})

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
    if (req.file == null) {
        data.username = req.body.username,
            data.email = req.body.email,
            data.mobilenumber = req.body.mobilenumber,
            data.password = req.body.password
        data.save((err) => {
            if (err) {
                console.log(err)
            }
        })
    } else {
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
    }
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
    if(req.file== null){
        data.name = req.body.name
        data.description = req.body.description
        data.quantities = req.body.quantities
        data.price = req.body.price  
        data.save((err) => {
            if (err) {
                console.log(err)
            }
        })
    }else{

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
    }
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
                    } else {
                        // res.send(user);
                        var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '1h' });

                        res.json({ success: true, message: 'User authenticated!', token: token });
                    }
                }
            }
        }
    });
})

router.post('/resend', (req, res) => {

    client
        .verify
        .services(config.serviceID)
        .verifications
        .create({
            to: `+91${req.body.mobilenumber}`,
            channel: 'sms'
        }).then((data) => {
            res.status(200).json({ data: data })
        })
    //    res.send('hello from simple server :)')
})
router.post('/verify', (req, res) => {
    Person.findOne({
        mobilenumber: req.body.mobilenumber,
    }).exec(function (err, user) {
        if (err) throw err;
        else {
            if (!user) {
                res.json({ success: false, message: 'mobilenumber and password not provided !!!' });
            } else if (user) {
                console.log("ssss")
                client
                    .verify
                    .services(config.serviceID)
                    .verificationChecks
                    .create({
                        to: `+91${req.body.mobilenumber}`,
                        code: req.body.code
                    }).then((data) => {
                        console.log(user)
                        var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '1h' });
                        res.status(200).json({ data: data, success: true, token: token })
                    }).catch((err) => {
                        console.log(err)
                        res.status(404).send('otp is expired !!!')
                    })
            }
        }
    });
})

router.post('/otp', function (req, res) {
    Person.findOne({
        mobilenumber: req.body.mobilenumber
    }).select('mobilenumber password').exec(function (err, user) {
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
                    } else {
                        console.log("sss", user.mobilenumber)
                        // res.send(user);
                        // var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '1h' });
                        client
                            .verify
                            .services(config.serviceID)
                            .verifications
                            .create({
                                to: `+91${user.mobilenumber}`,
                                channel: 'sms'
                            }).then((data) => {
                                res.status(200).json({ data: data })
                            })
                        res.json({ success: true, message: 'User authenticated!' });
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
router.delete("delete/:id", async (req, res) => {
    console.log("delete", req.decoded)
    const user = await Person.findByIdAndDelete({ id: req.decoded.id });
    res.send(user)

})
router.get('/loginwithgoogle', (req, res) => {
    console.log("deedddcode", req.decoded)
    Person.find({ email: req.decoded.email }).exec(function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: false, message: 'User not found' });
        } else {
            res.json({ success: true, message: 'get details Successfully', data: user });
        }
    })
})

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
            res.json({ success: false, message: 'User not found' });
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
        if (err) {
            console.log(err)
        }
        else {
            if (req.file == null) {
                result.username = req.body.username
                result.email = req.body.email
                result.mobilenumber = req.body.mobilenumber
                result.save()
                res.send()
            }
            else {
                result.username = req.body.username
                result.email = req.body.email
                result.mobilenumber = req.body.mobilenumber
                result.photo = req.file.filename;
                result.photo_path = "https://medicinesinfo.herokuapp.com/" + req.file.filename;
                result.save()
                res.json({ success: "true", message: "done" })
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