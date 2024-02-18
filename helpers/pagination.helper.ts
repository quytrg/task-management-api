interface Pagination {
    currentPage: number,
    limit: number,
    totalRecords?: number,
    skip?: number,
    totalPages?: number
}

const paginationHelper = (query: Record<string, any>, paginationObject: Pagination): Pagination => {

    if (query.page) {
        paginationObject.currentPage = parseInt(query.page)
    }

    if (query.limit) {
        paginationObject.limit = parseInt(query.limit)
    }
    
    paginationObject.skip = (paginationObject.currentPage - 1) * paginationObject.limit

    paginationObject.totalPages = Math.ceil(paginationObject.totalRecords / paginationObject.limit)
    return paginationObject
}

export default paginationHelper