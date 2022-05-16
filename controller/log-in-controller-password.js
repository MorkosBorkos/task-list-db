'use strict';
const bcrypt = require('bcrypt');

/** Διαλέξτε το κατάλληλο μοντέλο */
const userModel = require('../model/sqlite/task-list-model-better-sqlite');
// const userModel = require('../model/task-list-model-mongo');
// const userModel = require('../model/postgres/task-list-model-heroku-pg.js');

exports.showLogInForm = function (req, res) {
    res.render('login-password', {});
}

exports.showRegisterForm = function (req, res) {
    res.render('register-password', {});
}

exports.doRegister = function (req, res) {
    userModel.registerUser(req.body.username, req.body.password, (err, result, message) => {
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

    userModel.getUserByUsername(req.body.username, (err, user) => {
        if (user == undefined) {
            res.render('login-password', { message: 'Δε βρέθηκε αυτός ο χρήστης' });
        }
        else {
            const match = bcrypt.compare(req.body.password, user.password, (err, match) => {
                if (match) {
                    //Θέτουμε τη μεταβλητή συνεδρίας "loggedUserId"
                    req.session.loggedUserId = user.id;
                    //Αν έχει τιμή η μεταβλητή req.session.originalUrl, αλλιώς όρισέ τη σε "/" 
                    const redirectTo = req.session.originalUrl || "/viewtasks";
                    // res.redirect("/");
                    res.redirect(redirectTo);
                }
                else {
                    res.render("login", { message: 'Ο κωδικός πρόσβασης είναι λάθος' })
                }
            })
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