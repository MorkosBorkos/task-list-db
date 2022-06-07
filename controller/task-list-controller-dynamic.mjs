/**
 * Είναι ο controller για τη σελίδα που δημιουργείται με το ./view/tasks-dynamic.hbs
 * 
 * Η tasks-dynamic αλλάζει τα περιεχόμενά της στέλνοντας αιτήματα στον 
 * εξυπηρετητή με το fetch API.
 * 
 * Κάθε συνάρτηση επιστρέφει την απάντηση με μορφή JSON στον φυλλομετρητή.
 * Ο φυλλομετρητής αναλαμβάνει να κάνει τις αλλαγές στο DOM στην πλευρά του.
 * Ο κώδικας που το κάνει αυτό βρίσκεται στο ./static/main.js
 * 
 * Απλά ορίστε κάποιο route που να χρησιμοποιεί το tasks-dynamic.hbs
 * και αυτόν εδώ τον controller. Σαν παράδειγμα έχει οριστεί το /viewtasks
 * 
 */
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import task from '../model/task.js'

/** Διαλέξτε το κατάλληλο μοντέλο στο αρχείο .env */
let model;
model = await import(`../model/${process.env.MODEL}/task-list-model-${process.env.MODEL}.mjs`)


export function toggleTask(req, res) {
    model.toggleTask(req.params.toggleTaskId, req.session.loggedUserId, (err, result) => {
        if (err) {
            res.json(err)
        }
        //Στείλε την απάντηση του μοντέλου στον πελάτη
        else {
            res.json(result);
        }
    });
}

export function addTask(req, res) {
    //Κατασκευάζουμε μια νέα εργασία και τη βάζουμε στην βάση:
    // req.query.taskName -> { taskName: "Να τελειώσω την άσκηση"}
    const newTask = new task.Task(null, req.params.taskName);
    model.addTask(newTask, req.session.loggedUserId, (err, lastInsertID) => {
        //αν υπάρχει σφάλμα, σταμάτα
        if (err) {
            res.json(err);
        }
        else {
            //αν όλα πήγαν καλά τότε η lastInsertId περιέχει το id της νέας εργασίας
            //στη βάση. Φέρε όλα τα στοιχεία της νέας εγγραφής
            model.getTask(lastInsertID, req.session.loggedUserId, (err, newTask) => {
                //αν υπάρχει σφάλμα, σταμάτα
                if (err) {
                    res.json(err);
                }
                //αλλώς επέστρεψε το json με τα στοιχεία της νέας εργασίας
                //στον πελάτη για να τα δείξει
                else {
                    res.json(newTask);
                }
            })
        }
    });
}

export function removeTask(req, res) {
    model.removeTask(req.params.removeTaskId, req.session.loggedUserId, (err, result) => {
        //αν υπάρχει σφάλμα, σταμάτα
        if (err) {
            res.json(err);
        }
        //Στείλε την απάντηση του μοντέλου στον πελάτη
        else {
            res.json(result);
        }
    });
}

//Επιστρέφει ένα json array που περιέχει όλες τις εργασίες
export function getAllTasks(req, res) {
    model.getAllTasks(req.session.loggedUserId, (err, tasks) => {
        if (err) {
            res.json(err);
        }
        else {
            res.status(200).json({ tasks: tasks });
        }
    });
}

//Επιστρέφει το HTML της τελικής σελίδας
//Χρήσιμο για την 1η φορά που ο φυλλομετρητής φορτώνει τη σελίδα
export function listAllTasksRender(req, res) {
    res.render('tasks-dynamic');
    // Θα μπορούσαμε στο 1ο φόρτωμα να επιστρέφουμε έτοιμο το ul με τα tasks
    // model.getAllTasks(req.session.loggedUserId, (err, tasks) => {
    //     // if (err) {
    //     //     res.json(err);
    //     // }
    //     // else {
    //     // }
    // });
}