const Task = require('../models/task.model')

// helpers
const paginationHelper = require('../../../helpers/pagination.helper')

// [GET] /api/v1/tasks/
module.exports.index = async (req, res) => {
    try {
        const filter = {
            deleted: false
        }

        // status
        if (req.query.status) {
            filter.status = req.query.status
        }

        // sort
        const sort = {}
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue
        }

        // pagination
        const initPagination = {
            currentPage: 1,
            limit: 2
        }
        initPagination.totalRecords = await Task.countDocuments(filter)
        const paginationObject = paginationHelper(req.query, initPagination)


        const tasks = await Task
            .find(filter)
            .limit(paginationObject.limit)
            .skip(paginationObject.skip)
            .sort(sort)

        const result = {
            tasks,
            totalPages: paginationObject.totalPages,
            currentPage: paginationObject.currentPage,
            limit: paginationObject.limit,
            skip: paginationObject.skip
        }
        res.json(result)
    } catch (error) {
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