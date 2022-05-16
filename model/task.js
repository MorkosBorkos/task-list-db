

//Δημιουργός (constructor) ενός αντικειμένου τύπου Task
//Αν περαστεί ένα μόνο όρισμα, τότε τα άλλα δύο 
//status=0 σημαίνει η εργασία είναι ενεργή, 1 σημαίνει έχει ολοκληρωθεί 
//Για να δημιουργηθεί ένα νέο αντικείμενο καλείται με const newTask = new Task('Περιγραφή μιας εργασίας');
exports.Task = function (id, taskName, status = 0, createdAt = '', userId) {
    this.id = id
    this.task = taskName
    this.status = status
    this.createdAt = createdAt
    this.userId = userId
}
