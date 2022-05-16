'use strict';
const bcrypt = require('bcrypt');

/** Διαλέξτε το κατάλληλο μοντέλο */
const model = require('../model/sqlite/task-list-model-better-sqlite');
// const model = require('../model/mongo/task-list-model-mongo');
// const model = require('../model/postgres/task-list-model-heroku-pg.js');

// const model = require('../model/mongo-only/task-list-model-mongo-only.js'); //TODO

exports.showLogInForm = function (req, res) {
    model.connect((err, result) => {
        res.render('login-password', { message: err });
    })
}

exports.showRegisterForm = function (req, res) {
    res.render('register-password', {});
}

exports.doRegister = function (req, res) {
    // model.registerUser(req.body.username, req.body.password, (err, result, message) => {
    model.registerUserNoPass(req.body.username, (err, result, message) => {
        if (err) {
            console.error('registration error: ' + err);
            //FIXME: δε θα έπρεπε να περνάμε το εσωτερικό σφάλμα στον χρήστη
            res.render('register-password', { message: err });
        }
        else if (message) {
            res.render('register-password', message)
        }
        else {
            res.redirect('/login');
        }
    })
}

exports.doLogin = function (req, res) {
    //Ελέγχει αν το username και το password είναι σωστά και εκτελεί την
    //συνάρτηση επιστροφής authenticated

    model.getUserByUsername(req.body.username, (err, user) => {
        if (user == undefined) {
            res.render('login-password', { message: 'Δε βρέθηκε αυτός ο χρήστης' });
        }
        else {
            //Θέτουμε τη μεταβλητή συνεδρίας "loggedUserId"
            req.session.loggedUserId = user.id;
            //Αν έχει τιμή η μεταβλητή req.session.originalUrl, αλλιώς όρισέ τη σε "/" 
            const redirectTo = req.session.originalUrl || "/viewtasks";
            res.redirect(redirectTo);
        }
    })
}

exports.doLogout = (req, res) => {
    //Σημειώνουμε πως ο χρήστης δεν είναι πια συνδεδεμένος
    req.session.destroy();
    res.redirect('/');
}

//Τη χρησιμοποιούμε για να ανακατευθύνουμε στη σελίδα /login όλα τα αιτήματα από μη συνδεδεμένςου χρήστες
exports.checkAuthenticated = function (req, res, next) {
    //Αν η μεταβλητή συνεδρίας έχει τεθεί, τότε ο χρήστης είναι συνεδεμένος
    if (req.session.loggedUserId) {
        console.log("user is authenticated", req.originalUrl);
        //Καλεί τον επόμενο χειριστή (handler) του αιτήματος
        next();
    }
    else {
        //Ο χρήστης δεν έχει ταυτοποιηθεί, αν απλά ζητάει το /login ή το register δίνουμε τον
        //έλεγχο στο επόμενο middleware που έχει οριστεί στον router
        if ((req.originalUrl === "/login") || (req.originalUrl === "/register")) {
            next()
        }
        else {
            //Στείλε το χρήστη στη "/login" 
            console.log("not authenticated, redirecting to /login")
            res.redirect('/login');
        }
    }
}