const Task = require('../models/task.model')

// [GET] /api/v1/tasks/
module.exports.index = async (req, res) => {
    try { 
        const filter = {
            deleted: false
        }
    
        if (req.query.status) {
            filter.status = req.query.status
        }
    
        const tasks = await Task.find(filter) 
    
        res.json(tasks)
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json('Not found');
    }
}

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            deleted: false
        })

        res.json(task);
    } catch (error) {
        console.log('Error occured:', error);
        res.json('Not found');
    }
}