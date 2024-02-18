interface Search {
    keyword: string,
    regex?: RegExp
}

const searchHelper = (query: Record<string, any>): Search => {
    const searchObject: Search = {
        keyword: "",
    }

    if (query.keyword) {
        searchObject.keyword = query.keyword.toString()
        searchObject.regex = new RegExp(searchObject.keyword, "i")
    }

    return searchObject
}

export default searchHelper