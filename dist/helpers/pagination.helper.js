"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paginationHelper = (query, paginationObject) => {
    if (query.page) {
        paginationObject.currentPage = parseInt(query.page);
    }
    if (query.limit) {
        paginationObject.limit = parseInt(query.limit);
    }
    paginationObject.skip = (paginationObject.currentPage - 1) * paginationObject.limit;
    paginationObject.totalPages = Math.ceil(paginationObject.totalRecords / paginationObject.limit);
    return paginationObject;
};
exports.default = paginationHelper;
