"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.edit = exports.create = exports.changeMulti = exports.changeStatus = exports.detail = exports.index = void 0;
const task_model_1 = __importDefault(require("../models/task.model"));
const pagination_helper_1 = __importDefault(require("../../../helpers/pagination.helper"));
const search_helper_1 = __importDefault(require("../../../helpers/search.helper"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = {
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ],
            deleted: false
        };
        if (req.query.status) {
            filter.status = req.query.status.toString();
        }
        const criteria = {};
        if (req.query.sortKey && req.query.sortValue) {
            const sortKey = req.query.sortKey.toString();
            const sortValue = req.query.sortValue.toString();
            criteria[sortKey] = sortValue === 'desc' ? sortValue : 'asc';
        }
        else {
            criteria['title'] = 'asc';
        }
        const initPagination = {
            currentPage: 1,
            limit: 2
        };
        initPagination.totalRecords = yield task_model_1.default.countDocuments(filter);
        const paginationObject = (0, pagination_helper_1.default)(req.query, initPagination);
        const searchObject = (0, search_helper_1.default)(req.query);
        if (req.query.keyword) {
            filter.title = searchObject.regex;
        }
        const tasks = yield task_model_1.default
            .find(filter)
            .limit(paginationObject.limit)
            .skip(paginationObject.skip)
            .sort(criteria);
        const result = {
            tasks,
            totalPages: paginationObject.totalPages,
            currentPage: paginationObject.currentPage,
            limit: paginationObject.limit,
            skip: paginationObject.skip
        };
        res.json(result);
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'Not found'
        });
    }
});
exports.index = index;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const task = yield task_model_1.default.findOne({
            _id: id,
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ],
            deleted: false
        });
        if (!task) {
            res.json({
                code: 404,
                message: 'Not found'
            });
            return;
        }
        res.json(task);
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 404,
            message: 'Not found'
        });
    }
});
exports.detail = detail;
const changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validStatus = ['initial', 'doing', 'pending', 'finish', 'notFinish'];
        const id = req.params.id;
        const status = req.body.status;
        if (!validStatus.includes(status)) {
            res.json({
                code: 400,
                message: 'Invalid status value'
            });
            return;
        }
        const document = yield task_model_1.default.updateOne({
            _id: id,
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ]
        }, {
            status: status
        });
        res.json({
            code: 200,
            message: 'Update successfully',
            document
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 404,
            message: 'Not found'
        });
    }
});
exports.changeStatus = changeStatus;
const changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ids = req.body.ids;
        const key = req.body.key;
        const value = req.body.value;
        let document;
        let Action;
        (function (Action) {
            Action["ChangeStatus"] = "status";
            Action["Delete"] = "delete";
        })(Action || (Action = {}));
        switch (key) {
            case Action.ChangeStatus:
                const validStatus = ['initial', 'doing', 'pending', 'finish', 'notFinish'];
                if (!validStatus.includes(value)) {
                    res.json({
                        code: 400,
                        message: 'Invalid status value'
                    });
                    return;
                }
                document = yield task_model_1.default.updateMany({
                    _id: { $in: ids },
                    $or: [
                        { createdBy: req['user'].id },
                        { teamMember: req['user'].id }
                    ]
                }, {
                    status: value
                });
                break;
            case Action.Delete:
                document = yield task_model_1.default.updateMany({
                    _id: { $in: ids },
                    $or: [
                        { createdBy: req['user'].id },
                        { teamMember: req['user'].id }
                    ]
                }, {
                    deleted: true,
                    deletedAt: new Date()
                });
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
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 404,
            message: 'Not found'
        });
    }
});
exports.changeMulti = changeMulti;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.createdBy = req['user'].id;
        const task = new task_model_1.default(req.body);
        const document = yield task.save();
        res.json({
            code: 200,
            message: 'Create successfully',
            document
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while creating the record'
        });
    }
});
exports.create = create;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const document = yield task_model_1.default.updateOne({
            _id: id,
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ]
        }, req.body);
        res.json({
            code: 200,
            message: 'Update successfully',
            document
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while editing the record'
        });
    }
});
exports.edit = edit;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const document = yield task_model_1.default.updateOne({
            _id: id,
            $or: [
                { createdBy: req['user'].id },
                { teamMember: req['user'].id }
            ]
        }, {
            deleted: true,
            deletedAt: new Date()
        });
        res.json({
            code: 200,
            message: 'Delete successfully',
            document
        });
    }
    catch (error) {
        console.log('Error occured:', error);
        res.json({
            code: 400,
            message: 'An error occured while deleting the record'
        });
    }
});
exports.deleteTask = deleteTask;
