'use strict';

// Το better-slite3 είναι εντελώς σύγχρονο
import db from 'better-sqlite3'
const sql = new db('model/db/tasks.sqlite', { fileMustExist: true });


export let getAllTasks = (userId) => {
    //Φέρε όλες τις εργασίας από τη βάση
    const stmt = sql.prepare("SELECT * FROM task WHERE user_id = ?");
    let tasks;
    try {
        tasks = stmt.all(userId);
        return tasks;
    } catch (err) {
        throw err;
    }
}

//Προσθήκη μιας νέας εργασίας
export let addTask = (newTask, userId) => {
    //Αυτό το ερώτημα εισάγει μια νέα εγγραφή
    //Η πρώτη και η τελευταία τιμή (το null και το CURRENT_TIMESTAMP) εισάγονται από την SQLite
    //Το null αφήνει την SQLite να διαλέξει τιμή (αύξοντας αριθμός)
    //To CURRENT_TIMESTAMP σημαίνει την τρέχουσα ώρα και ημερομηνία
    const stmt = sql.prepare('INSERT INTO task VALUES (null, ?, ?, CURRENT_TIMESTAMP, ?)');
    let info;

    try {
        info = stmt.run(newTask.task, newTask.status, userId);
        return true;
    }
    catch (err) {
        throw err;
    }
}

//Αλλαγή της κατάστασης μιας εργασίας
export let toggleTask = (taskId, userId) => {
    const stmt_update = sql.prepare('UPDATE task SET status = NOT status WHERE id=? AND user_id=?')
    let toggle;
    try{
        toggle = stmt_update.run(taskId,userId);
        return true;
    }
    catch (err){
        throw err;
    }
}

//Αφαίρεση μιας εργασίας
export let removeTask = (taskId, userId) => {
    const stmt_remove = sql.prepare('DELETE FROM task WHERE id=? AND user_id=?')
    let removed
    try{
        removed = stmt_remove.run(taskId, userId);
        return true;
    }
    catch (err){
        throw err;
    }
}
