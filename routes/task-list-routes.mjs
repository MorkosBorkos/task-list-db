import express from 'express'
const router = express.Router();

import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
    console.log('loading .env')
    dotenv.config();
}

const taskListController = await import(`../controller/task-list-controller.mjs`)

//Καταχώριση συμπεριφοράς σε διάφορα path
router.route('/').get((req, res) => { res.redirect('/tasks') });

router.get('/tasks/remove/:removeTaskId', taskListController.removeTask);
router.get('/tasks/toggle/:toggleTaskId', taskListController.toggleTask);
router.get('/tasks', taskListController.listAllTasksRender);
router.get('/tasks/add/', taskListController.addTask);

export default router;
