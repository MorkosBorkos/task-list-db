import express from 'express'
const app = express()
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import exphbs from 'express-handlebars'
import taskListSession from './app-setup/app-setup-session.mjs'

//Χρειάζεται για το χειρισμό των αιτημάτων που έρχονται με POST
//(extended:false σημαίνει πως δε χρειαζόμαστε να διαβάσουμε εμφωλευμένα αντικείμενα που έχουν έρθει με το αίτημα POST)
app.use(express.urlencoded({ extended: false }));

//Ενεργοποίηση συνεδρίας
app.use(taskListSession)




//Το template μας μπορεί να χρειάζεται να φορτώσει κάποια CSS ή JS
//Δηλώνουμε πως θα βρίσκονται στον φάκελο /public
//Για παράδειγμα το /view/taskbar-dynamic.hbs φορτώνει αρχεία με αυτό τον τρόπο, π.χ.
//το αρχείο στο φάκελο /public/style.css μπορεί να φορτωθεί με 
//http://localhost:PORT/style.css (δείτε την εγγραφή στο main layout /views/layout.hbs)
app.use(express.static('public'))

//Σε κάθε request περνάμε στο αντικείμενο locals του response object την τιμή
//του loggedUserId. Η res.locals.userId είναι προσβάσιμη από το hbs ως `userId`
//Γενικά όλα τα μέλη του αντικειμένου res.locals είναι προσβάσιμα στη μηχανή template.
//(http://expressjs.com/en/api.html#res.locals)
app.use((req, res, next) => {
    res.locals.userId = req.session.loggedUserId;
    next();
})

//Διαδρομές. Αντί να γράψουμε τις διαδρομές μας εδώ, τις φορτώνουμε από ένα άλλο αρχείο
import routes from './routes/task-list-routes.mjs'
//και τώρα χρησιμοποιούμε αυτές τις διαδρομές
app.use('/', routes);

//Χρήση των views
//Σημ.: η engine πρέπει να έχει ίδιο όνομα με το extname, αλλιώς δεν θα
//αναγνωριστεί το extname (αν δεν το κάνουμε τα αρχεία handlebars θα πρέπει να 
///τελειώνουν με .handlebars)
app.engine('hbs', exphbs.engine({
    defaultLayout: 'layout', // το default είναι main, αλλά το "layout" ίσως πιο διαισθητικό
    extname: 'hbs'
}));
//και ορίζουμε πως θα χρησιμοποιήσουμε τη μηχανή template με όνομα 'hbs'
app.set('view engine', 'hbs');

export  { app as taskList };
