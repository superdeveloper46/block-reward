import Router from "express";
import { User } from "../models/userModel.js";
import { Client } from "../models/clientModel.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Nylas from 'nylas';
Nylas.config({
    clientId: process.env['NYLAS_CLIENT_ID'],
    clientSecret: process.env['NYLAS_CLIENT_SECRET'],
});
console.log(process.env['NYLAS_ACCESS_TOKEN'])
const nylas = Nylas.with(process.env['NYLAS_ACCESS_TOKEN']);
const router = Router();

import mongoose from "mongoose";
import email from "email-verification";


var nev = email(mongoose);


var myHasher = function(password, tempUserData, insertTempUser, callback) {
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return insertTempUser(hash, tempUserData, callback);
};

myHasher = function(password, tempUserData, insertTempUser, callback) {
    bcrypt.genSalt(8, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            return insertTempUser(hash, tempUserData, callback);
        });
    });
};

// NEV configuration =====================
nev.configure({
    persistentUserModel: User,
    expirationTime: 600, // 10 minutes

    verificationURL: 'http://localhost:5000/email-verification/${URL}',
    transportOptions: {
        service: 'Gmail',
        auth: {
            user: 'youremail@gmail.com',
            pass: 'yourpass'
        }
    },

    hashingFunction: myHasher,
    passwordFieldName: 'passwordHash',
}, function(err, options) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('configured: ' + (typeof options === 'object'));
});

nev.generateTempUserModel(User, function(err, tempUserModel) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
});






// Endpoint for Register
router.post("/signup1", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(404)
            .json({ msg: "Please Provide all necessary fields" });
    }
    if (!email || !password) {
        return res
            .status(404)
            .json({ msg: "Please Provide all necessary fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ msg: "User Already Exists!" });
    }

    const saltRounds = 10;
    const isInterpreter = "interpreter"
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
        email,
        passwordHash,
    });

    const savedUser = await newUser.save();
    res.send({ user: savedUser })

    // const token = jwt.sign(
    //     {
    //         userId: savedUser._id,
    //         isInterpreter: isInterpreter,
    //         emailConfirmed: false,
    //     },
    //     process.env["JWT_SECRET"],
    //     {
    //         expiresIn: process.env["TOKEN_EXPIRATION_TIME"]
    //     }
    // );

    // sending verify email
    // let emailVerifyToken = jwt.sign(
    //     {
    //         userId: savedUser._id
    //     },
    //     process.env["JWT_EMAIL_VERIFY_SECRET"]
    // );
    // let verifyUrl = `${process.env["FRONT_URL"]}/verifyEmail?token=${emailVerifyToken}`;
    // const draft = nylas.drafts.build({
    //     subject: 'Verify Email',
    //     body: `<html>
    //              Please click <a href="${verifyUrl}">this url</a> to verify your email!
    //             </html>`,
    //     to: [{ name: 'My Event Friend', email: savedUser.email }]
    // });
    // draft.send();

    // res.send({ token: token });
});

router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    var newUser = new User({
        email: email,
        passwordHash: password
    });


    nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
        if (err) {
            return res.status(404).send('ERROR: creating temp user FAILED');
        }

        // user already exists in persistent collection
        if (existingPersistentUser) {
            return res.json({
                msg: 'You have already signed up and confirmed your account. Did you forget your password?'
            });
        }

        // new user created
        if (newTempUser) {
            var URL = newTempUser[nev.options.URLFieldName];

            nev.sendVerificationEmail(email, URL, function(err, info) {
                if (err) {
                    return res.status(404).send('ERROR: sending verification email FAILED');
                }
                res.json({
                    msg: 'An email has been sent to you. Please check it to verify your account.',
                    info: info
                });
            });

            // user already exists in temporary collection!
        } else {
            res.json({
                msg: 'You have already signed up. Please check your email to verify your account.'
            });
        }
    });

});

router.get('/email-verification/:URL', function(req, res) {
    var url = req.params.URL;

    nev.confirmTempUser(url, function(err, user) {
        if (user) {
            nev.sendConfirmationEmail(user.email, function(err, info) {
                if (err) {
                    return res.status(404).send('ERROR: sending confirmation email FAILED');
                }
                res.json({
                    msg: 'CONFIRMED!',
                    info: info
                });
            });
        } else {
            return res.status(404).send('ERROR: confirming temp user FAILED');
        }
    });
});

router.post("/client", async (req, res) => {
    const { firstName, lastName, email, password, location, phoneNumber, company } = req.body;
    if (!email || !password) {
        return res
            .status(404)
            .json({ msg: "Please Provide all necessary fields" });
    }
    if (!email || !password) {
        return res
            .status(404)
            .json({ msg: "Please Provide all necessary fields" });
    }

    const existingclient = await Client.findOne({ email });
    if (existingclient) {
        return res.status(400).json({ msg: "Client Already Exists!" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const isInterpreter = "client"
    const newClient = new Client({
        firstName,
        lastName,
        email,
        passwordHash,
        location,
        phoneNumber,
        company,
        isInterpreter
    });

    const savedClient = await newClient.save();
    res.send({ client: savedClient })
})

// Endpoint for Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Email or Password is missing" });
    }

    const matchUser = await User.findOne({ email });

    if (!matchUser) {
        const matchPassword = await bcrypt.compare(
            password,
            matchUser.passwordHash
        );

        if (!matchPassword) {
            return res.status(401).json({ msg: "Email or Password is invalid!" });
        }
        const token = jwt.sign(
            {
                userId: matchClient._id,
                emailConfirmed: matchClient.emailConfirmed,
            },
            process.env["JWT_SECRET"],
            {
                expiresIn: process.env["TOKEN_EXPIRATION_TIME"]
            }
        );
        console.log(process.env["COOKIE_SECURE"])
        console.log(matchClient._id, 'id')
        res.send({ token: token, id: matchClient._id });
    }
    else {
        const matchPassword = await bcrypt.compare(
            password,
            matchUser.passwordHash
        );

        if (!matchPassword) {
            return res.status(401).json({ msg: "Email or Password is invalid!" });
        }
        const token = jwt.sign(
            {
                userId: matchUser._id,
                emailConfirmed: matchUser.emailConfirmed,
            },
            process.env["JWT_SECRET"],
            {
                expiresIn: process.env["TOKEN_EXPIRATION_TIME"]
            }
        );
        console.log(process.env["COOKIE_SECURE"])
        console.log(matchUser._id, 'id')
        res.send({ token: token, id: matchUser._id });
    }
});

// Endpoint for Logout
router.get("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
});

// Endpoint to check if logged in
router.get("/loggedin", (req, res) => {
    if (!req.user) {
        return res.json({ loggedIn: false, emailConfirmed: false });
    }
    if (req.user.emailConfirmed)
        return res.json({ loggedIn: true, emailConfirmed: true });
    else
        return res.json({ loggedIn: true, emailConfirmed: false });


});
router.get("/sendVerifyEmail", (req, res) => {
    if (!req.user) {
        return res.status(401).json({ msg: "Invalid Token" });
    }

    User.findById(req.user.userId).then(user => {
        if (user.emailConfirmed)
            return res.json({ status: 1, msg: "Already Email Verified!" })
        let emailVerifyToken = jwt.sign(
            {
                userId: user._id
            },
            process.env["JWT_EMAIL_VERIFY_SECRET"]
        );
        let verifyUrl = `${process.env["FRONT_URL"]}/verifyEmail?token=${emailVerifyToken}`;
        const draft = nylas.drafts.build({
            subject: 'Verify Email',
            body: `<html>
                             Please click <a href="${verifyUrl}">this url</a> to verify your email!
                            </html>`,
            to: [{ name: 'My Event Friend', email: user.email }]
        });
        draft.send().then(message => {
            return res.json({ status: 2, msg: "Successfully verification email was sent!" });
        }).catch(err => {
            return res.json({ status: 3, msg: "Error in verification email!" });
        })

    }).catch(err => {
        console.log(err);
        return res.status(401).json({ msg: "Invalid Token3" });
    })
});

router.post("/sendResetEmail", (req, res) => {


    User.findOne({ email: req.body.email }).then(user => {
        let emailVerifyToken = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env["JWT_SECRET"]
        );
        let verifyUrl = `${process.env["FRONT_URL"]}/resetPassword?token=${emailVerifyToken}`;
        const draft = nylas.drafts.build({
            subject: 'Reset Password',
            body: `<html>
                             Please click <a href="${verifyUrl}">this url</a> to reset your password!
                            </html>`,
            to: [{ name: 'My Event Friend', email: user.email }]
        });
        draft.send().then(message => {
            return res.json({ status: 2, msg: "Successfully reset email was sent!" });
        }).catch(err => {
            return res.json({ status: 3, msg: "Error in sending reset email!" });
        })

    }).catch(err => {
        return res.status(401).json({ msg: "Not Found Email!" });
    })
});

router.get("/verifyEmail", (req, res) => {
    if (!req.user) {
        return res.status(401).json({ msg: "Invalid Token" });
    }
    jwt.verify(req.query.token, process.env['JWT_EMAIL_VERIFY_SECRET'], async (error, decoded) => {

        if (error) {
            return res.status(401).json({ msg: "Invalid Verification Token" });
        }
        else if (req.user.userId !== decoded.userId) {
            return res.status(401).json({ msg: "Please Open verification page on the same browser in which you logged in!" });
        } else {
            let result = await User.findByIdAndUpdate(decoded.userId, { emailConfirmed: true });
            console.log(result, decoded.userId)
            const token = jwt.sign(
                {
                    userId: req.user.userId,
                    emailConfirmed: true
                },
                process.env["JWT_SECRET"],
                {
                    expiresIn: process.env["TOKEN_EXPIRATION_TIME"]
                }
            );
            return res.json({ token: token });
        }
    })

});

router.post("/resetPassword", (req, res) => {
    let { email, token, newpassword, confirmpassword } = req.body;
    jwt.verify(token, process.env['JWT_SECRET'], async (error, decoded) => {
        if (error) {
            return res.status(401).json({ msg: "Invalid Reset Token" });
        }
        else if (decoded.email !== email) {
            return res.status(401).json({ msg: "Invalid Reset Token" });
        } else {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(newpassword, saltRounds);
            console.log(decoded.userId, passwordHash, newpassword)
            User.findByIdAndUpdate(decoded.userId, { passwordHash: passwordHash, emailConfirmed: true })
                .then(user => {
                    const newToken = jwt.sign(
                        {
                            userId: user._id,
                            emailConfirmed: true
                        },
                        process.env["JWT_SECRET"],
                        {
                            expiresIn: process.env["TOKEN_EXPIRATION_TIME"]
                        }
                    );
                    return res.json({ token: newToken });
                }).catch(error => {
                    return res.status(401).json({ msg: "New Email Save Error!" });
                })

            // const token = jwt.sign(
            //     {
            //         userId: req.user._id,
            //         isUser: req.user.isUser,
            //         emailConfirmed: true
            //     },
            //     process.env["JWT_SECRET"],
            //     {
            //         expiresIn: process.env["TOKEN_EXPIRATION_TIME"]
            //     }
            // );

        }
    })

});

router.post("/info", (req, res) => {
    const { language, experience, time, phoneNumber, userId, availableTime, firstName, location, lastName, company } = req.body;
    User.findById(userId, function (err, user) {
        if (!user) {
            Client.findById(userId, function (err, client) {
                client.firstName = firstName;
                client.lastName = lastName;
                client.phoneNumber = phoneNumber
                client.company = company
                client.location = location.label;
                client.save()
                    .then((client) => res.json("client updated"))
                    .catch((error) => console.log(error, 'error'))
                if (!client) {
                    res.status(404).send("file is not found");
                }
            })
        }
        else {
            if (user.isInterpreter == "interpreter") {
                user.language = language;
                user.experience = experience;
                user.time = time;
                user.phoneNumber = phoneNumber;
                user.availableTime = availableTime;
                user.location = location.label;
            }
            user
                .save()
                .then((user) => {
                    res.json("user updated!");
                })
                .catch((err) => {
                    res.status(400).send("Update not possible");
                });
        }
    });
})

router.get("/get", (req, res) => {
    const userId = req.query.userId;
    User.findById(userId, function (err, user) {
        if (!user) {
            Client.findById(userId, function (err, client) {
                res.send({ data: "client", email: client.email })
                if (!client) {
                    res.status(404).send("user is not found");
                }
            })
        }
        else {
            res.send({ data: "Interpreter", email: user.email })
        }
    })
})

router.get("/clientinfo", (req, res) => {
    Client.find({ isInterpreter: "client" }).then((users) => res.send({ data: users }))
})
router.get("/interpreterinfo", (req, res) => {
    User.find({ isInterpreter: "interpreter" }).then((users) => res.send({ data: users }))
})

export default router;
