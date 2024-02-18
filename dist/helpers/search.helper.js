"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const searchHelper = (query) => {
    const searchObject = {
        keyword: "",
    };
    if (query.keyword) {
        searchObject.keyword = query.keyword.toString();
        searchObject.regex = new RegExp(searchObject.keyword, "i");
    }
    return searchObject;
};
exports.default = searchHelper;
