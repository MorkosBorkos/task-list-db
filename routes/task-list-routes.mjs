import express  from 'express'
const router = express.Router();

import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

let taskListController;
taskListController = await import(`../controller/${process.env.CONTROLLER}.mjs`)

//Για την υποστήριξη σύνδεσης/αποσύνδεσης χρηστών
// import * as logInController from '../controller/login-controller-password.mjs'
let logInController;
logInController = await import(`../controller/${process.env.LOGIN_CONTROLLER}.mjs`)

//Καταχώριση συμπεριφοράς σε διάφορα path
router.route('/').get((req, res) => { res.redirect('/tasks') });

//Αιτήματα για σύνδεση
//Δείξε τη φόρμα σύνδεσης. Το 1ο middleware ελέγχει αν έχει γίνει η σύνδεση
router.route('/login').get(logInController.checkAuthenticated, logInController.showLogInForm);

// //Αυτή η διαδρομή καλείται όταν η φόρμα φτάσει με POST και διεκπεραιώνει τη σύνδεση
router.route('/login').post(logInController.doLogin);

//Αποσυνδέει το χρήστη
router.route('/logout').get(logInController.doLogout);

//Εγγραφή νέου χρήστη
router.route('/register').get(logInController.checkAuthenticated, logInController.showRegisterForm);
//FIXME θεωρεί πως POST στο /register ο χρήστης δεν είναι συνδεδεμένος
router.post('/register', logInController.doRegister);

//Τα παρακάτω path χρησιμοποιούνται από τη σελίδα που φτιάχνεται με το template
//tasks-dynamic.hbs

router.get('/tasks/getAllTasks', logInController.checkAuthenticated, taskListController.getAllTasks);
router.get('/tasks/remove/:removeTaskId', logInController.checkAuthenticated, taskListController.removeTask);
router.get('/tasks/add/:taskName', logInController.checkAuthenticated, taskListController.addTask);
router.get('/tasks/add/', logInController.checkAuthenticated, taskListController.addTask);
router.get('/tasks/toggle/:toggleTaskId', logInController.checkAuthenticated, taskListController.toggleTask);
router.get('/tasks', logInController.checkAuthenticated, taskListController.listAllTasksRender);

export default router;
