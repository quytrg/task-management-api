import { Request, Response } from "express"
import Task from "../models/task.model"

// helpers
import paginationHelper from "../../../helpers/pagination.helper"
import searchHelper from "../../../helpers/search.helper"
import { UpdateWriteOpResult } from "mongoose"

// [GET] /api/v1/tasks/
export const index = async (req: Request, res: Response) => {
    try {
        interface Filter {
            $or: Object[]
            deleted: boolean,
            status?: string,
            title?: RegExp,
        }
        const filter: Filter = {
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ],
            deleted: false
        }

        // status
        if (req.query.status) {
            filter.status = req.query.status.toString()
        }

        // sort
        interface Sort {
            [key: string]: 'asc' | 'desc'
        }
        const criteria: Sort = {}

        if (req.query.sortKey && req.query.sortValue) {
            const sortKey: string = req.query.sortKey.toString()
            const sortValue: string = req.query.sortValue.toString()
            criteria[sortKey] = sortValue === 'desc' ? sortValue : 'asc'
        } else {
            criteria['title'] = 'asc'
        }

        // pagination
        interface Pagination {
            currentPage: number,
            limit: number,
            totalRecords?: number
            skip?: number,
            totalPages?: number
        }
        const initPagination: Pagination = {
            currentPage: 1,
            limit: 2
        }
        initPagination.totalRecords = await Task.countDocuments(filter)
        const paginationObject: Pagination = paginationHelper(req.query, initPagination)

        // search
        const searchObject = searchHelper(req.query)
        if (req.query.keyword) {
            filter.title = searchObject.regex
        }

        const tasks = await Task
            .find(filter)
            .limit(paginationObject.limit)
            .skip(paginationObject.skip)
            .sort(criteria)

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
        res.json({
            code: 400,
            message: 'Not found'
        });
    }
}

// [GET] /api/v1/tasks/detail/:id
export const detail = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id
        const task = await Task.findOne({
            _id: id,
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ],
            deleted: false
        })

        if (!task) {
            res.json({
                code: 404,
                message: 'Not found'
            });
            return
        }

        res.json(task);
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 404,
            message: 'Not found'
        });
    }
}

// [PATCH] /api/v1/tasks/change-status/:id
export const changeStatus = async (req: Request, res: Response) => {
    try {
        const validStatus = ['initial', 'doing', 'pending', 'finish', 'notFinish']

        const id: string = req.params.id
        const status: string = req.body.status

        if (!validStatus.includes(status)) {
            res.json({
                code: 400,
                message: 'Invalid status value'
            });
            return;
        }

        const document = await Task.updateOne({
            _id: id,
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ]
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
export const changeMulti = async (req: Request, res: Response) => {
    try {
        const ids: string[] = req.body.ids
        const key: string = req.body.key
        const value: string = req.body.value
        
        let document: UpdateWriteOpResult
        enum Action {
            ChangeStatus = 'status',
            Delete = 'delete'
        }
        switch (key) {
            case Action.ChangeStatus:
                const validStatus = ['initial', 'doing', 'pending', 'finish', 'notFinish']
                if (!validStatus.includes(value)) {
                    res.json({
                        code: 400,
                        message: 'Invalid status value'
                    });
                    return;
                }
                document = await Task.updateMany({
                    _id: { $in: ids },
                    $or: [
                        { createdBy: req['user'].id },
                        { teamMember: req['user'].id }
                    ]
                }, {
                    status: value
                })
                break;
            case Action.Delete:
                document = await Task.updateMany({
                    _id: { $in: ids },
                    $or: [
                        { createdBy: req['user'].id },
                        { teamMember: req['user'].id }
                    ]
                }, {
                    deleted: true,
                    deletedAt: new Date()
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

// [POST] /api/v1/tasks/create
export const create = async (req: Request, res: Response) => {
    try {
        req.body.createdBy = req['user'].id
        const task = new Task(req.body)
        const document = await task.save()

        res.json({
            code: 200,
            message: 'Create successfully',
            document
        });
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while creating the record'
        });
    }
}

// [PATCH] /api/v1/tasks/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id
        const document = await Task.updateOne({ 
            _id: id, 
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ] 
        }, req.body)
        res.json({
            code: 200,
            message: 'Update successfully',
            document
        });
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while editing the record'
        });
    }
}


// [DELETE] /api/v1/tasks/delete/:id
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id
        const document = await Task.updateOne({ 
            _id: id,
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ]
        }, {
            deleted: true,
            deletedAt: new Date()
        })
        res.json({
            code: 200,
            message: 'Delete successfully',
            document
        });
    } catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while deleting the record'
        });
    }
}