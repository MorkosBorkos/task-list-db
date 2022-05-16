'use strict';

const bcrypt = require('bcrypt');

//Οι χρήστες αποθηκεύονται στον πίνακα users
//Η αποθήκευση εδώ είναι προσωρινή, κάθε φορά που ξεκινά το πρόγραμμα,
//ο πίνακας είναι κενός
const users = [];

//Για διευκόλυνση τοποθετούμε έναν χρήστη με username "c" και password "c"
users.push({
    id: "1590060830828",
    username: "c",
    password: "$2b$10$EkSXt4m5aR05Jkg6U3tHouWDyL8BdErmy7w69MetOGMkKkl7StjKm"
});

//Η συνάρτηση δημιουργεί έναν νέο χρήστη
exports.registerUser = async function (username, password, callback) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push(
            {
                id: Date.now().toString(),
                username: username,
                password: hashedPassword
            }
        )
        callback(false, true);
    } catch (error) {
        callback(error);
    }
}

/**
 * Επιστρέφει τον χρήστη με όνομα 'username'
 */
exports.getUserByUsername = (username) => {
    let user = users.find(user => user.username === username);
    return user;
}

// /**
//  * Επιστρέφει τον χρήστη με id 'userId'
//  */
// exports.getUserById = (userId) => {
//     return users.find(user => user.id === userId);
// }