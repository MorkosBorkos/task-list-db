/**
 * Φορτώνεται από το template ./view/taskbar-dynamic.hbs
 * 
 * Κατασκευάζει το περιεχόμενο δυναμικά, στέλνοντας αιτήματα με το fetch API.
 * 
 * Στην αρχή η fetchTasks() παίρνει από τον εξυπηρετητή όλες τις εργασίες και 
 * τις προβάλλει μία μία στον καμβά.  
 * 
 */


//Δημιουργεί ένα list item που περιέχει την περιγραφή την εργασία (task item)
//Η εργασία περιέχεται μέσα σε ένα <span>
//Αν η εργασία έχει ολοκληρωθεί το span έχει την κλάση CSS task-status-inactive
//Το span έχει το attribute "data-task-id", στο οποίο γράφουμε το id της εργασίας στη ΒΔ
const createTaskItem = (taskJson) => {
    //Button
    const taskItemRemoveButton = document.createElement('button');
    taskItemRemoveButton.className = "ml-3";
    taskItemRemoveButton.setAttribute("name", "removeTaskId");
    //Κάθε στοιχείο button έχει ένα attribute με όνομα data-task-id και τιμή το id της εργασίας
    //Το χρησιμοποιούμε στη συνέχεια (π.χ. click/remove/toggle για να βρούμε το στοιχείο στο DOM)
    taskItemRemoveButton.setAttribute("data-task-id", taskJson.id);
    taskItemRemoveButton.innerText = "Αφαίρεση";
    taskItemRemoveButton.addEventListener("click", removeTaskEventListener);

    //Τοggle task link - τυλίγουμε το task μέσα σε ένα span το οποίο όταν γίνεται click
    //θα του αλλάζει την κατάσταση  
    const taskItemToggleLink = document.createElement('span');
    //Κάθε στοιχείο button έχει ένα attribute με όνομα data-task-id και τιμή το id της εργασίας
    //Το χρησιμοποιούμε στη συνέχεια (π.χ. click/remove/toggle για να βρούμε το στοιχείο στο DOM)
    taskItemToggleLink.setAttribute("data-task-id", taskJson.id);
    if (taskJson.status == 1) {
        taskItemToggleLink.className = "task-status-inactive";
    }
    taskItemToggleLink.textContent = taskJson.task;
    taskItemToggleLink.addEventListener("click", toggleTaskEventListener);

    //task list item
    const taskItem = document.createElement('li');
    taskItem.className = "list-group-item";
    //Κάθε στοιχείο li έχει ένα attribute με όνομα data-task-id και τιμή το id της εργασίας
    //Το χρησιμοποιούμε στη συνέχεια (π.χ. click/remove/toggle για να βρούμε το στοιχείο στο DOM)
    taskItem.setAttribute("data-task-id", taskJson.id);
    taskItem.appendChild(taskItemToggleLink);
    taskItem.appendChild(taskItemRemoveButton);

    return taskItem;
}

//Ζητά από τον εξυπηρετητή να αλλάξει την κατάσταση της εργασίας
//Αν έγινε, ο εξυπηρετητής απαντά με true
const toggleTaskItem = (taskItemId) => {
    //αφαιρούμε τους event listeners για όση ώρα περιμένουμε την απάντηση
    toggleListenersForTaskItem(taskItemId, "deactivate")

    fetch("/tasks/toggle/" + taskItemId).then(
        //διάβασε την απάντηση σαν json
        (response) => response.json().then(
            (result) => {
                //αν έγινε η αλλαγή της κατάστασης, τότε θα το result θα είναι true
                if (result) {
                    //https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
                    document.querySelector("span[data-task-id='" + taskItemId + "']").classList.toggle("task-status-inactive")
                }
                else {
                    //μπορούμε να γράψουμε ένα μήνυμα πως η ενέργεια απέτυχε
                    // ...
                }
                //αφού έχουμε πάρει την απάντηση, τοποθετούμε τους event listeners
                toggleListenersForTaskItem(taskItemId, "activate")
            })
    );
}

//Ζητά από τον εξυπηρετητή να προσθέσει μια εργασία με όνομα taskName.
//Αν πετύχει, ο εξυπηρετητής στέλνει ένα json με τη νέα εργασία, που στη
//συνέχεια προσαρτάται στο DOM
const addTaskItem = (taskName) => {
    //αφαιρούμε τους event listeners για όση ώρα περιμένουμε την απάντηση
    toggleListenersForAddingNewTask("deactivate")

    fetch("/tasks/add/" + taskName).then(
        //διάβασε την απάντηση σαν json
        (response) => response.json().then(
            (newTaskJson) => {
                if (newTaskJson) {
                    //κατασκεύασε και προσάρτησε ένα νέο list item
                    const newTaskLi = createTaskItem(newTaskJson[0]);
                    document.querySelector("ul").appendChild(newTaskLi);
                    //καθαρίζουμε το input box
                    document.querySelector("#item").value = ""
                }
                //αφού έχουμε πάρει την απάντηση, τοποθετούμε τους event listeners
                toggleListenersForAddingNewTask("activate")
            })
    );
}

//Ζητά από τον εξυπηρετητή να διαγράψει την εργασία
//Αν έγινε η διαγραφή, ο εξυπηρετητής απαντά με true
const removeTaskItem = (taskItemId) => {
    //αφαιρούμε τους event listeners για όση ώρα περιμένουμε την απάντηση
    toggleListenersForTaskItem(taskItemId, "deactivate")

    fetch("/tasks/remove/" + taskItemId).then(
        //διάβασε την απάντηση σαν json
        (response) => response.json().then(
            //αν έγινε η διαγραφή, τότε θα το result θα είναι true
            (result) => {
                if (result) {
                    document.querySelector("li[data-task-id='" + taskItemId + "']").remove();
                }
                else {
                    //κάτι δεν πήγε καλά και δεν έγινε η αφαίρεση
                    //γράφουμε ένα μήνυμα στο χρήστη
                    //...
                    //αφού δεν έγινε η αφαίρεση, τοποθετούμε τους event listeners
                    toggleListenersForTaskItem(taskItemId, "activate")
                }
            })
    );
}

//Με μια λιστα εργασιών σε μορφή json, κατασκευάζει και προαρτά τα αντίστοιχα στοιχεία li στο έγγραφο
let renderTaskItems = (json) => {
    for (let task of json.tasks) {
        document.querySelector("ul").appendChild(createTaskItem(task));
    }
}

//Στέλνει ένα αίτημα στον εξυπηρετητή και επιστρέφει τις εργασίες
let fetchTasks = () => {
    fetch("/tasks/getAllTasks").then(
        //διάβασε την απάντηση σαν json
        (response) => response.json().then(
            //δώσε την εγγραφή "tasks" για προβολή στην οθόνη
            (json) =>{console.log(json); renderTaskItems(json)}
        )
    );
}

window.addEventListener('DOMContentLoaded', (event) => {
    fetchTasks();
    toggleListenersForAddingNewTask("activate")
});

//Ο listener που εκτελείται όταν πατήσουμε το κουμπί για να προσθέσουμε νέα εργασία
//Το έχουμε σαν ξεχωριστή συνάρτηση για να μπορούμε να το αφαιρέσουμε όσο 
//περιμένουμε την απάντηση για το toggle από τον εξυπηρετητή
const addTaskItemEventListener = (event) => {
    console.log(event.key)
    if ((event.key && event.key === "Enter") || (!event.key)) {
        addTaskItem(document.querySelector("input[name='taskName']").value)
    }
}

const toggleListenersForAddingNewTask = (action = "activate") => {
    const addTaskBtn = document.querySelector("#add-task-button")
    const addTaskInpt = document.querySelector("#item")

    if (action == "activate") {
        addTaskBtn.addEventListener("click", addTaskItemEventListener)
        addTaskInpt.addEventListener("keypress", addTaskItemEventListener)
        addTaskBtn.disabled = false
        addTaskInpt.disabled = false
    }
    else {
        addTaskBtn.removeEventListener("click", addTaskItemEventListener)
        addTaskInpt.removeEventListener("keypress", addTaskItemEventListener)
        addTaskBtn.disabled = true
        addTaskInpt.disabled = true
    }
}

//Ο listener που εκτελείται με απλό κλικ πάνω στην εργασία
//Το έχουμε σαν ξεχωριστή συνάρτηση για να μπορούμε να το αφαιρέσουμε όσο 
//περιμένουμε την απάντηση για το toggle από τον εξυπηρετητή
const toggleTaskEventListener = (event) => {
    toggleTaskItem(event.target.getAttribute("data-task-id"))
}

//Ο listener που εκτελείται με κλικ πάνω στο κουμπί "Αφαίρεση"
//Το έχουμε σαν ξεχωριστή συνάρτηση για να μπορούμε να το αφαιρέσουμε όσο 
//περιμένουμε την απάντηση για το remove από τον εξυπηρετητή
const removeTaskEventListener = (event) => {
    removeTaskItem(event.target.getAttribute("data-task-id"))
}

//ενεργοποιεί/απενεργοποιεί τους event listeners για toggle και remove
const toggleListenersForTaskItem = (taskItemId, action = "activate") => {
    const taskNameSpan = document.querySelector("span[data-task-id='" + taskItemId + "']");
    const taskNameRemoveBtn = document.querySelector("button[data-task-id='" + taskItemId + "']");

    if (action == "activate") {
        //αφαιρούμε τους event listeners για όση ώρα περιμένουμε την απάντηση
        taskNameSpan.addEventListener("click", toggleTaskEventListener);
        taskNameRemoveBtn.addEventListener("click", removeTaskEventListener);
        taskNameSpan.classList.remove('task-disabled')
        taskNameRemoveBtn.disabled = false
    }
    else {
        taskNameSpan.removeEventListener("click", toggleTaskEventListener);
        taskNameRemoveBtn.removeEventListener("click", removeTaskEventListener);
        taskNameSpan.classList.add('task-disabled')
        taskNameRemoveBtn.disabled = true
    }
}