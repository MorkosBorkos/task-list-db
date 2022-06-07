'use strict';
import db from 'better-sqlite3'
const sql = new db('./model/better-sqlite/tasks.sqlite', { fileMustExist: true });


//dummy, υπάρχει μόνο και μόνο για μοιάζει με το interface του mongo/mongoose model
export let connect = (callback) => {
    callback(null, true)
}

export let getAllTasks = (userId, callback) => {
    //Φέρε όλες τις εργασίας από τη βάση
    const stmt = sql.prepare("SELECT * FROM task WHERE user_id = ?");
    let tasks;
    try {
        tasks = stmt.all(userId);
    } catch (err) {
        callback(err, null);
    }
    callback(null, tasks);
}

export let getTask = (taskId, userId, callback) => {
    //Φέρε μόνο μια εγγραφή (LIMIT) που να έχει id ίσο με taskId
    const stmt = sql.prepare("SELECT * FROM task WHERE id = ? AND user_id = ? LIMIT 0, 1");
    let task;
    try {
        task = stmt.all(taskId, userId);
    } catch (err) {
        callback(err, null);
    }
    callback(null, task);
}

//Προσθήκη μιας νέας εργασίας
export let addTask = (newTask, userId, callback) => {
    //Αυτό το ερώτημα εισάγει μια νέα εγγραφή
    //Η πρώτη και η τελευταία τιμή (το null και το CURRENT_TIMESTAMP) εισάγονται από την SQLite
    //Το null αφήνει την SQLite να διαλέξει τιμή (αύξοντας αριθμός)
    //To CURRENT_TIMESTAMP σημαίνει την τρέχουσα ώρα και ημερομηνία
    const stmt = sql.prepare('INSERT INTO task VALUES (null, ?, ?, CURRENT_TIMESTAMP, ?)');
    let info;

    try {
        info = stmt.run(newTask.task, newTask.status, userId);
    }
    catch (err) {
        //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
        callback(err, null);
    }
    //Αλλιώς κάλεσε τη συνάρτηση επιστροφής με όρισμα το id που πήρε από τη βάση η νέα εγγραφή
    //Την τιμή του info.lastInsertRowid μας τη δίνει η ίδια η βάση και εξασφαλίζουμε έτσι πως κάθε
    //εγγραφή έχει μοναδικό id
    callback(null, info.lastInsertRowid);
}

//Αλλαγή της κατάστασης μιας εργασίας
export let toggleTask = (taskId, userId, callback) => {
    //Αν η εγγραφή με id ίσο με taskId έχει status=0 τότε κάντο 1, αλλιώς κάντο 0
    const stmt = sql.prepare('UPDATE task SET status = CASE WHEN status = 0 THEN 1 ELSE 0 END WHERE id = ? AND user_id = ?');
    try {
        stmt.run(taskId, userId);
    }
    catch (err) {
        //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
        callback(err, null);
    }
    //Αν δεν είχαμε σφάλμα, κάλεσε την callback με (null, true) 
    callback(null, true);
}

//Αφαίρεση μιας εργασίας
export let removeTask = (taskId, userId, callback) => {
    const stmt = sql.prepare("DELETE FROM task WHERE id = ? AND user_id = ?");
    try {
        stmt.run(taskId, userId);
    }
    catch (err) {
        //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
        callback(err, null);
    }
    //Αν δεν είχαμε σφάλμα, κάλεσε την callback με (null, true) 
    callback(null, true);
}

export let findUserByUsernamePassword = (username, password, callback) => {
    //Φέρε μόνο μια εγγραφή (το LIMIT 0, 1) που να έχει username και password ίσο με username και password 
    const stmt = sql.prepare("SELECT username FROM user WHERE username = ? and password = ? LIMIT 0, 1");
    let user;
    try {
        user = stmt.all(username, password);
    } catch (err) {
        callback(err, null);
    }
    callback(null, user);
}


//Η συνάρτηση δημιουργεί έναν νέο χρήστη
export let registerUserNoPass = function (username, callback) {
    // ελέγχουμε αν υπάρχει χρήστης με αυτό το username
    getUserByUsername(username, async (err, userId) => {
        if (userId != undefined) {
            callback(null, null, { message: "Υπάρχει ήδη χρήστης με αυτό το όνομα" })
        } else {
            try {
                const stmt = sql.prepare('INSERT INTO user VALUES (null, ?, ?)');
                let info;

                try {
                    info = stmt.run(username, username);
                }
                catch (err) {
                    //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
                    callback(err, null);
                }
                //Αλλιώς κάλεσε τη συνάρτηση επιστροφής με όρισμα το id που πήρε από τη βάση η νέα εγγραφή
                //Την τιμή του info.lastInsertRowid μας τη δίνει η ίδια η βάση και εξασφαλίζουμε έτσι πως κάθε
                //εγγραφή έχει μοναδικό id
                callback(null, info.lastInsertRowid);
            } catch (error) {
                callback(error);
            }
        }

    })
}

/**
 * Επιστρέφει τον χρήστη με όνομα 'username'
 */
export let getUserByUsername = (username, callback) => {
    const stmt = sql.prepare("SELECT id, username, password FROM user WHERE username = ? LIMIT 0, 1");
    let user;
    try {
        user = stmt.all(username);
    } catch (err) {
        callback(err, null);
    }

    callback(null, user[0])
}


//Η συνάρτηση δημιουργεί έναν νέο χρήστη με password
export let registerUser = function (username, password, callback) {
    // ελέγχουμε αν υπάρχει χρήστης με αυτό το username
    getUserByUsername(username, async (err, userId) => {
        if (userId != undefined) {
            callback(null, null, { message: "Υπάρχει ήδη χρήστης με αυτό το όνομα" })
        } else {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const stmt = sql.prepare('INSERT INTO user VALUES (null, ?, ?)');
                let info;

                try {
                    info = stmt.run(username, hashedPassword);
                }
                catch (err) {
                    //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
                    callback(err, null);
                }
                //Αλλιώς κάλεσε τη συνάρτηση επιστροφής με όρισμα το id που πήρε από τη βάση η νέα εγγραφή
                //Την τιμή του info.lastInsertRowid μας τη δίνει η ίδια η βάση και εξασφαλίζουμε έτσι πως κάθε
                //εγγραφή έχει μοναδικό id
                callback(null, info.lastInsertRowid);
            } catch (error) {
                callback(error);
            }
        }

    })
}