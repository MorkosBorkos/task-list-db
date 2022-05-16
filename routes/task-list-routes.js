'use strict';

const express = require('express');
const router = express.Router();

const taskListControllerFetch = require('../controller/task-list-controller-fetch');

//Για την υποστήριξη σύνδεσης/αποσύνδεσης χρηστών
const logInController = require('../controller/log-in-controller-password');


//Καταχώριση συμπεριφοράς σε διάφορα URI
router.route('/').get((req, res) => { res.redirect('/viewtasks') });

//Αιτήματα για σύνδεση
//Δείξε τη φόρμα
router.route('/login').get(logInController.checkAuthenticated, logInController.showLogInForm);

// //Αυτή η διαδρομή καλείται όταν η φόρμα φτάσει με POST και διεκπεραιώνει τη σύνδεση
router.route('/login').post(logInController.doLogin);

//Αποσυνδέει το χρήστη
router.route('/logout').get(logInController.doLogout);

//Εγγραφή νέου χρήστη
router.route('/register').get(logInController.checkAuthenticated, logInController.showRegisterForm);
//FIXME θεωρεί πως POST στο /register σημαίνει πως ο χρήστης δεν είναι συνδεδεμένος
router.post('/register', logInController.doRegister);


//Τα παρακάτω URI χρησιμοποιούνται από τη σελίδα που φτιάχνεται με την tasks-dynamic.hbs
router.route('/viewtasks').get(logInController.checkAuthenticated, taskListControllerFetch.listAllTasksRender);

router.get('/tasks/remove/:removeTaskId', logInController.checkAuthenticated, taskListControllerFetch.removeTask);
router.get('/tasks/add/:taskName', logInController.checkAuthenticated, taskListControllerFetch.addTask);
router.get('/tasks/toggle/:toggleTaskId', logInController.checkAuthenticated, taskListControllerFetch.toggleTask);
router.get('/tasks', logInController.checkAuthenticated, taskListControllerFetch.getAllTasks);
module.exports = router;
