'use strict';
import sql from './db.heroku-pg.js'
import bcrypt from 'bcrypt'
import { Task as MyTask } from '../task.js'

//ψεύτικη καθυστέρηση που εξομοιώνει requests που αργούν να εξυπηρετηθούν
const fakeDelay = 0

//dummy, υπάρχει μόνο και μόνο για μοιάζει με το interface του mongo/mongoose model
export let connect = (callback) => {
    callback(null, true)
}

export let getAllTasks = (userId, callback) => {
    //Φέρε όλες τις εργασίας από τη βάση
    const query = {
        text: "SELECT * FROM public.task WHERE user_id = $1 ORDER BY created_at",
        values: [userId],
    }

    sql.query(query, (err, tasks) => {
        if (err)
            callback(err.stack)
        else {
            callback(null, tasks.rows)
        }
    })
}

export let getTask = (taskId, userId, callback) => {
    //Φέρε μόνο μια εγγραφή (LIMIT) που να έχει id ίσο με taskId
    const query = {
        text: "SELECT * FROM public.task WHERE id = $1 AND user_id = $2 ORDER BY created_at LIMIT 1",
        values: [taskId, userId],
    }

    sql.query(query, (err, res) => {
        if (err)
            callback(err.stack)
        else {
            const task = [new MyTask(taskId, res.rows[0].task, res.rows[0].status, res.rows[0].created_at, userId)]

            callback(null, task)
        }
    })
}

//Προσθήκη μιας νέας εργασίας
export let addTask = (newTask, userId, callback) => {
    //Αυτό το ερώτημα εισάγει μια νέα εγγραφή
    //Η πρώτη και η τελευταία τιμή (το null και το CURRENT_TIMESTAMP) εισάγονται από την SQLite
    //Το null αφήνει την SQLite να διαλέξει τιμή (αύξοντας αριθμός)
    //To CURRENT_TIMESTAMP σημαίνει την τρέχουσα ώρα και ημερομηνία
    const query = {
        text: "INSERT INTO public.task (task, status, created_at, user_id) VALUES ($1, $2, CURRENT_TIMESTAMP, $3) RETURNING id",
        values: [newTask.task, newTask.status, userId],
    }

    sql.query(query, (err, result) => {
        if (err)
            callback(err.stack, null);
        else {
            //το query επιστρέφει μια γραμμή με τα αποτελέσματα της εισαγωγής
            //(αυτά που ζητήσαμε με το INSERT). Το "id" είναι το όνομα του πεδίου
            //που αυξάνει αυτόματα. Η result.rows[0].id μας επιστρέφει την τιμή του.
            callback(null, result.rows[0].id)
        }
    })
}

//Αλλαγή της κατάστασης μιας εργασίας
export let toggleTask = (taskId, userId, callback) => {
    //Αν η εγγραφή με id ίσο με taskId έχει status=0 τότε κάντο 1, αλλιώς κάντο 0
    const query = {
        text: "UPDATE public.task SET status = CASE WHEN status = 0 THEN 1 ELSE 0 END WHERE id = $1 AND user_id = $2",
        values: [taskId, userId],
    }

    sql.query(query, (err, result) => {
        if (err)
            callback(err.stack, null);
        else {
            //Αν δεν είχαμε σφάλμα, κάλεσε την callback με (null, true) 
            callback(null, true)
        }
    })
}

//Αφαίρεση μιας εργασίας
export let removeTask = (taskId, userId, callback) => {
    const query = {
        text: "DELETE FROM public.task WHERE id = $1 AND user_id = $2",
        values: [taskId, userId],
    }

    sql.query(query, (err, result) => {
        if (err)
            callback(err.stack, null);
        else {
            //Αν δεν είχαμε σφάλμα, κάλεσε την callback με (null, true) 
            callback(null, true)
        }
    })
}

//Η συνάρτηση δημιουργεί έναν νέο χρήστη
export let registerUserNoPass = function (username, callback) {
    // ελέγχουμε αν υπάρχει χρήστης με αυτό το username
    getUserByUsername(username, async (err, userId) => {
        if (userId != undefined) {
            callback(null, null, { message: "Υπάρχει ήδη χρήστης με αυτό το όνομα" })
        } else {
            try {

                const query = {
                    text: 'INSERT INTO public.user ( username, password) VALUES ( $1, $2) RETURNING id',
                    values: [username, ""],
                }

                sql.query(query, (err, result) => {
                    if (err)
                        callback(err.stack, null);
                    else {
                        //το query επιστρέφει μια γραμμή με τα αποτελέσματα της εισαγωγής
                        //(αυτά που ζητήσαμε με το INSERT). Το "id" είναι το όνομα του πεδίου
                        //που αυξάνει αυτόματα. Η result.rows[0].id μας επιστρέφει την τιμή του.
                        callback(null, result.rows[0].id)
                    }
                })
            } catch (err) {
                console.log(err)
                callback(err)
            }
        }
    })
}

/**
 * Επιστρέφει τον χρήστη με όνομα 'username'
 */
export let getUserByUsername = (username, callback) => {
    const query = {
        text: "SELECT id, username, password FROM public.user WHERE username = $1 ORDER BY username LIMIT 1",
        values: [username],
    }

    sql.query(query, (err, user) => {
        if (err) {
            console.log(err.stack)
            callback(err.stack)
        }
        else {
            callback(null, user.rows[0])
        }
    })
}

//Η συνάρτηση δημιουργεί έναν νέο χρήστη
export let registerUser = function (username, password, callback) {
    // ελέγχουμε αν υπάρχει χρήστης με αυτό το username
    getUserByUsername(username, async (err, userId) => {
        if (userId != undefined) {
            callback(null, null, { message: "Υπάρχει ήδη χρήστης με αυτό το όνομα" })
        } else {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                const query = {
                    text: 'INSERT INTO public.user ( username, password) VALUES ( $1, $2) RETURNING id',
                    values: [username, hashedPassword],
                }

                sql.query(query, (err, result) => {
                    if (err)
                        callback(err.stack, null);
                    else {
                        //το query επιστρέφει μια γραμμή με τα αποτελέσματα της εισαγωγής
                        //(αυτά που ζητήσαμε με το INSERT). Το "id" είναι το όνομα του πεδίου
                        //που αυξάνει αυτόματα. Η result.rows[0].id μας επιστρέφει την τιμή του.
                        callback(null, result.rows[0].id)
                    }
                })
            } catch (err) {
                console.log(err)
                callback(err)
            }
        }
    })
}

/**
 * Χρειάζεται για το passport
 */
 export let verifyUser = (username, password, callback) => {
    console.log("passport/verifyUser")
    const query = {
        text: "SELECT id, username, password FROM public.user WHERE username = $1 ORDER BY username LIMIT 1",
        values: [username],
    }

    sql.query(query, (err, user) => {
        if (err) {
            console.log(err.stack)
            callback(err.stack)
        }
        else {
            bcrypt.com(password, user.rows[1], (err, match) => {
                if (match) {
                    callback(null, false, user)
                }
                else {
                    callback(null, { message: 'Ο κωδικός πρόσβασης είναι λάθος' })
                }
            });
        }
    })
}