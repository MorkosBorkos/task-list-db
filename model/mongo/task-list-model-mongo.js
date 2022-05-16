'use strict';
const bcrypt = require('bcrypt')

// Φτιάξτε μια βάση mongo στο MongoDB Atlas κα βάλτε εδώ το δικός σας connection string
const url = "mongodb+srv://task-list-user:oj6Eof2zK5fi0yTW@cluster0-jwedx.azure.mongodb.net/taskListDB?retryWrites=true&w=majority";
const MongoClient = require('mongodb').MongoClient;

const mongoose = require('mongoose');
const MyTask = require('../task');

//Αυτή θα κληθεί όταν ζητήσουμε τη /login. Επειδή το mongoose μπορεί να καθυστερήσει 
//να ετοιμαστεί, έχουμε το callback να μας ενημερώσει πότε θα είναι έτοιμο
exports.connect = (callback) => {
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    }, (err, res) => {
        if (err) {
            callback(err)
        }
        else {
            console.log(res)
            callback(null, res)
        }
    });
}

const Task = new mongoose.Schema({
    task: String,
    status: Number,
    created_at: { type: Date, default: Date.now },
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
    UserTaskList.find({ _id: userId }, (err, res) => {
        //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
        if (err) {
            callback(err, null);
        }
        //Αλλιώς μετέτρεψε το res που επιστρέφει η mongoose σε ένα απλό json array και στείλτο πίσω
        else {
            const foundItems = []
            if (res[0].taskList) {
                res[0].taskList.forEach((tasklistItem) => {
                    foundItems.push({ id: tasklistItem._id, task: tasklistItem.task, status: tasklistItem.status, created_at: tasklistItem.created_at })
                });
            }
            callback(null, foundItems);
        }
    });
};

//Προσθήκη μιας νέας εργασίας
exports.addTask = function (newTask, userId, callback) {
    //status νέας εργασίας = 0
    //το timestamp δημιουργείται εδώ
    const ts = new Date();
    const query = UserTaskList.where({ _id: userId })

    UserTaskList.findById(userId, (err, res) => {
        if (err) {
            callback(err, null)
        }
        else {
            res.taskList.push(newTask)
            res.save((err, res) => {
                if (err) {
                    callback(err, null)
                }
                else {
                    //επιστρέφουμε το id του task που μόλις βάλαμε, ξέρουμε πως 
                    //είναι το τελευταίο στον πίνακα taskList
                    callback(null, res.taskList[res.taskList.length - 1].id)
                }
            })
        }
    })
}

//Προσθήκη μιας νέας εργασίας
exports.getTask = function (taskId, userId, callback) {

    UserTaskList.findOne({ _id: userId, "taskList._id": taskId }, { "taskList": { $elemMatch: { _id: taskId } } }, (err, res) => {
        //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
        if (err) {
            callback(err, null);
        }
        else {
            //Αν δεν είχαμε σφάλμα, κάλεσε την callback με (null, true) 
            // const task = [{ id: res.taskList[0].id, task: res.taskList[0].task, status: res.taskList[0].status, created_at: res.taskList[0].created_at }];
            const task = [new MyTask.Task(taskId, res.taskList[0].task, res.taskList[0].status, res.taskList[0].created_at, userId)]

            callback(null, task);
        }
    });
}

//Αφαίρεση μιας εργασίας
exports.removeTask = (taskId, userId, callback) => {
    //Βρες το task που θέλουμε να γίνει toggle
    UserTaskList.findOneAndUpdate(
        { "_id": userId, "taskList._id": taskId },
        {
            //χρησιμοποιούμε την $pull για να αφαιρέσουμε το αντικείμενο από τον
            //πίνακα
            $pull: { 'taskList': { "_id": taskId } }
        },
        (err, user) => {
            if (err)
                callback(err)
            else {
                //στέλνουμε απλά true, δεν χρειάζεται να γυρίσουμε όλο το user
                console.log(user)
                callback(null, true)
            }
        }
    );
}

//Αλλαγή της κατάστασης μιας εργασίας
exports.toggleTask = (taskId, userId, callback) => {
    //Βρες το task που θέλουμε να γίνει toggle
    UserTaskList.findOneAndUpdate(
        { "_id": userId, "taskList._id": taskId },
        {
            //αντί για τη $set που θα χρησιμοποιήσουμε για αν αλλάξουμε την τιμή
            //χρησιμοποιούμε την $bit για να γυρίσουμε το status σε 0 ή 1
            $bit: { 'taskList.$.status': { xor: 1 } }
        },
        (err, user) => {
            if (err)
                callback(err)
            else {
                //στέλνουμε απλά true, δεν χρειάζεται να γυρίσουμε όλο το user
                callback(null, true)
            }
        }
    );
}

//Η συνάρτηση δημιουργεί έναν νέο χρήστη
exports.registerUserNoPass = function (username, callback) {
    // ελέγχουμε αν υπάρχει χρήστης με αυτό το username
    exports.getUserByUsername(username, async (err, user) => {
        if (user != undefined) {
            callback(null, null, { message: "Υπάρχει ήδη χρήστης με αυτό το όνομα" })
        } else {
            try {

                const newUser = { username: username, password: "", taskList: [] };
                UserTaskList.create(newUser, (err, res) => {
                    //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
                    if (err) {
                        callback(err, null);
                    }
                    //Αν δεν είχαμε σφάλμα, κάλεσε την callback με (null, res)
                    //το res εδώ περιέχει τη νέα εργασία, που μας την επέστρεψε η insertMany στο 2ο όρισμα της συνάρτησης επιστροφής 
                    //επιστρέφουμε το το res[0].id, που είναι το id του task που μόλις προστέθηκε
                    else {
                        callback(null, res.id);
                    }
                });
            } catch (error) {
                callback(error);
            }
        }
    })
}

// Επιστρέφει τον χρήστη με όνομα 'username'
exports.getUserByUsername = (username, callback) => {
    UserTaskList.find({ username: username }, (err, res) => {
        //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
        if (err) {
            callback(err, null);
        }
        else {
            //Αν δεν είχαμε σφάλμα, κάλεσε την callback με (null, true) 
            let user
            if (res.length != 0)
                user = { id: res[0]._id, username: res[0].username, password: res[0].password };

            callback(null, user);
        }
    });
}

//Η συνάρτηση δημιουργεί έναν νέο χρήστη
exports.registerUser = function (username, password, callback) {
    // ελέγχουμε αν υπάρχει χρήστης με αυτό το username
    exports.getUserByUsername(username, async (err, user) => {
        if (user != undefined) {
            callback(null, null, { message: "Υπάρχει ήδη χρήστης με αυτό το όνομα" })
        } else {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = { username: username, password: hashedPassword, taskList: [] };
                UserTaskList.create(newUser, (err, res) => {
                    //Αν υπάρχει σφάλμα, κάλεσε τη συνάρτηση επιστροφής και δώστης το σφάλμα
                    if (err) {
                        callback(err, null);
                    }
                    //Αν δεν είχαμε σφάλμα, κάλεσε την callback με (null, res)
                    //το res εδώ περιέχει τη νέα εργασία, που μας την επέστρεψε η insertMany στο 2ο όρισμα της συνάρτησης επιστροφής 
                    //επιστρέφουμε το το res[0].id, που είναι το id του task που μόλις προστέθηκε
                    else {
                        callback(null, res.id);
                    }
                });
            } catch (error) {
                callback(error);
            }
        }
    })
}
