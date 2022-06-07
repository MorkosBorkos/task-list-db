/**
 * Είναι ο controller για τη σελίδα που δημιουργείται με το ./view/tasks-static.hbs
 * 
 * Η tasks-static αλλάζει τα περιεχόμενά της στέλνοντας αιτήματα στον 
 * εξυπηρετητή με το fetch API.
 * 
 * Κάθε συνάρτηση επιστρέφει την απάντηση με μορφή JSON στον φυλλομετρητή.
 * Ο φυλλομετρητής αναλαμβάνει να κάνει τις αλλαγές στο DOM στην πλευρά του.
 * Ο κώδικας που το κάνει αυτό βρίσκεται στο ./static/main.js
 * 
 * Απλά ορίστε κάποιο route που να χρησιμοποιεί το tasks-static.hbs
 * και αυτόν εδώ τον controller. Σαν παράδειγμα έχει οριστεί το /viewtasks
 * 
 */
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import { Task as MyTask } from '../model/task.js'

/** Διαλέξτε το κατάλληλο μοντέλο στο αρχείο .env */
let model;
model = await import(`../model/${process.env.MODEL}/task-list-model-${process.env.MODEL}.mjs`)

export function listAllTasksRender(req, res) {
    const userId = req.session.loggedUserId;
    model.getAllTasks(userId, function (err, tasks) {
        if (err) {
            res.send(err);
        }
        else {
            res.render('tasks-static', { tasks: tasks, model: process.env.MODEL, session: req.session });
        }
    });
}

export function addTask(req, res) {
    //Κατασκευάζουμε μια νέα εργασία και τη βάζουμε στην βάση:
    const newTask = new MyTask(null, req.query.taskName);
    model.addTask(newTask, req.session.loggedUserId, (err, lastInsertId) => {
        //αν υπάρχει σφάλμα, στείλτο στον πελάτη και σταμάτα εδώ 
        if (err) {
            res.send(err);
        }
        else {
            model.getAllTasks(req.session.loggedUserId, function (err, allTasks) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.render('tasks-static', { tasks: allTasks, model: process.env.MODEL });
                }
            });
        }

    })
}

export function toggleTask(req, res) {
    model.toggleTask(req.params.toggleTaskId, req.session.loggedUserId, (err) => {
        //Αν υπάρχει σφάλμα, στείλτο στον πελάτη και σταμάτα εδώ 
        if (err) {
            res.send(err);
        }
        else {
            //Αν δεν υπάρχει σφάλμα, διάβασε από τη βάση και στείλε πίσω όλες τις εργασίες
            model.getAllTasks(req.session.loggedUserId, function (err, allTasks) {
                //Αν υπάρχει σφάλμα, στείλτο στον πελάτη και σταμάτα εδώ 
                if (err) {
                    res.send(err);
                }
                else {
                    //Στείλε όλες τις εργασίες πίσω
                    res.render('tasks-static', { tasks: allTasks, model: process.env.MODEL });
                }
            });
        }
    });
}

export function removeTask(req, res) {
    model.removeTask(req.params.removeTaskId, req.session.loggedUserId, (err, removeResult) => {
        //Αν υπάρχει σφάλμα, στείλτο στον πελάτη και σταμάτα εδώ 
        if (err) {
            res.send(err);
        }
        else {
            //Αν δεν υπάρχει σφάλμα, διάβασε από τη βάση και στείλε πίσω όλες τις εργασίες
            model.getAllTasks(req.session.loggedUserId, function (err, allTasks) {
                //Αν υπάρχει σφάλμα, στείλτο στον πελάτη και σταμάτα εδώ 
                if (err) {
                    res.send(err);
                }
                //Στείλε όλες τις εργασίες πίσω
                else {
                    res.render('tasks-static', { tasks: allTasks, model: process.env.MODEL });
                }
            });
        }
    });
}

export function getAllTasks(req, res) {
    listAllTasksRender(req, res)
}

