'use strict';
const bcrypt = require('bcrypt')

// Φτιάξτε μια βάση mongo στο MongoDB Atlas κα βάλτε εδώ το δικός σας connection string
const url = "mongodb+srv://task-list-user:oj6Eof2zK5fi0yTW@cluster0-jwedx.azure.mongodb.net/taskListDB?retryWrites=true&w=majority";
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

const mongoose = require('mongoose');
const MyTask = require('../task');

//Αυτή θα κληθεί όταν ζητήσουμε τη /login. Επειδή το mongoose μπορεί να καθυστερήσει 
//να ετοιμαστεί, έχουμε το callback να μας ενημερώσει πότε θα είναι έτοιμο
exports.connect = (callback) => {
    callback(null, true)
}

const Task = new mongoose.Schema({
    task: String,
    status: Number,
    created_at: { type: Date, default: Date.now() },
})

//Κάθε User περιέχει ένα array από Task
const User = new mongoose.Schema({
    username: String,
    password: String,
    taskList: [Task]
})

// Το μοντέλο (model στην ορολογία της mongoose) για το taskSchema. Το τελευταίο όρισμα είναι το όνομα της συλλογής στη mongo
const UserTaskList = mongoose.model("User", User, 'task-list')

exports.getAllTasks = function (userId, callback) {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const dbo = db.db("taskListDB");
        const o_id = new mongo.ObjectID(userId);
        dbo.collection("task-list").findOne({ "_id": o_id }, (err, result) => {
            if (err)
                throw err;

            db.close();
            callback(null, result.taskList);

        });
    });
};

//Προσθήκη μιας νέας εργασίας
exports.addTask = function (newTask, userId, callback) {
    //status νέας εργασίας = 0
    //το timestamp δημιουργείται εδώ
    const ts = new Date();
    const query = UserTaskList.where({ _id: userId })

    newTask.id = new mongo.ObjectID()
    newTask.created_at = new Date()
    delete newTask.userId

    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const dbo = db.db("taskListDB");
        const o_userId = new mongo.ObjectID(userId);
        dbo.collection("task-list").updateOne({ "_id": o_userId }, { $push: { "taskList": newTask } }, (err, res) => {
            if (err) throw err;
            console.log(newTask.id.toString());
            db.close();
            //επιστρέφουμε το id του task που μόλις βάλαμε 
            callback(null, newTask.id.toString())
        });

    });
}

//Προσθήκη μιας νέας εργασίας
exports.getTask = function (taskId, userId, callback) {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const dbo = db.db("taskListDB");
        const o_taskId = new mongo.ObjectID(taskId);
        const o_userId = new mongo.ObjectID(userId);
        dbo.collection("task-list").find({ "_id": o_userId, "taskList.id": o_taskId }, { "taskList._id": 0, "taskList.$": 1 }).toArray((err, result) => {
            if (err)
                throw err;

            db.close();
            callback(null, result.taskList);

        });
    });
}

//Αφαίρεση μιας εργασίας
exports.removeTask = (taskId, userId, callback) => {

}

//Αλλαγή της κατάστασης μιας εργασίας
exports.toggleTask = (taskId, userId, callback) => {

}

//Η συνάρτηση δημιουργεί έναν νέο χρήστη
exports.registerUserNoPass = function (username, callback) {

}

// Επιστρέφει τον χρήστη με όνομα 'username'
exports.getUserByUsername = (username, callback) => {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err;
        const dbo = db.db("taskListDB");

        dbo.collection("task-list").findOne({ "username": username }, (err, res) => {
            if (err)
                throw err;

            db.close();
            let user
            if (res.length != 0)
                user = { id: res._id.toString(), username: res.username, password: res.password };

            callback(null, user);

        });
    });
}

//Η συνάρτηση δημιουργεί έναν νέο χρήστη
exports.registerUser = function (username, password, callback) {

}
