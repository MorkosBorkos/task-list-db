import fs from 'fs/promises'

const fileName = "task-list-json.json"

class TaskList {
    myTasks = { tasks: [] }

    async getAllTasks() {
        try {
            const data = await fs.readFile(fileName, "utf-8")
            this.myTasks = JSON.parse(data)
        } catch (error) {
            throw error
        }
    }

    async addTaskToFile(newTask) {
        await this.loadTaskFromFile()
        if (!this.isTaskInList(newTask)) {
            this.myTasks.tasks.push(newTask)
            try {
                await fs.writeFile(fileName, JSON.stringify(this.myTasks, null, 2), {flag: "w+"})
            } catch (error) {
                throw error
            }
        }
    }

    // async toggleTask(task){
    //     await this.loadTaskFromFile()
    //     if (this.isTaskInList(task)){

    //     }

    // }

    isTaskInList(task) {
        let taskFound = this.myTasks.tasks.find(item => (
            item.id===task.id &&
            item.task===task.task &&
            item.status===task.status &&
            item.created_at===task.created_at &&
            item.user_id===task.user_id
        ));
        return taskFound
    }
}


function getAllTasks() {
    return TaskList.getAllTasks()
}

let myTaskList = getAllTasks();

export {myTaskList}