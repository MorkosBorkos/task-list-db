import passport from 'passport'
import LocalStrategy from 'passport-local'

import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

let userModel;
userModel = await import(`../model/${process.env.MODEL}/task-list-model-${process.env.MODEL}.mjs`)


//In serialize user you decide what to store in the session. Here I'm storing the username only.
passport.serializeUser((user, callback) => {
    callback(null, user.id);
});

//Here you retrieve all the info of the user from the session storage using the user id stored in the session earlier using serialize user.
passport.deserializeUser((username, callback) => {
    userModel.getUserByUsername(username, (err, user) => {
        callback(err, user);
    })
});

passport.use(new LocalStrategy(userModel.verifyUser))
passport.initialize()

export let myPassport = passport.session()

export default myPassport