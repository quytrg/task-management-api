const Task = require('../models/task.model')

// helpers
const paginationHelper = require('../../../helpers/pagination.helper')
const searchHelper = require('../../../helpers/search.helper')

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

        // search
        const searchObject = searchHelper(req.query)
        if (req.query.keyword) {
            filter.title = searchObject.regex
        }

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

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id
        const status = req.body.status

        const document = await Task.updateOne({
            _id: id
        }, {
            status: status
        })

        res.json({
            code: 200,
            message: 'Update successfully',
            document
        });
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 404,
            message: 'Not found'
        });
    }
}

// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, key, value } = req.body
        
        let document = {}
        switch (key) {
            case 'status':
                document = await Task.updateMany({
                    _id: { $in: ids }
                }, {
                    status: value
                })
                break;
            default:
                res.json({
                    code: 404,
                    message: 'Not found'
                });
                break;
        }

        res.json({
            code: 200,
            message: 'Update successfully',
            document
        });
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 404,
            message: 'Not found'
        });
    }
}