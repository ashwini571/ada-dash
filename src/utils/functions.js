let blockedWordsList = [  'INSERT', 'UPDATE', 'DELETE', 'RENAME', 'DROP', 'CREATE', 'TRUNCATE', 'ALTER', 'COMMIT', 'ROLLBACK', 'MERGE', 'CALL', 'LOCK', 'GRANT', 'REVOKE', 'SAVEPOINT', 'TRANSACTION', 'SET']

const validateSql = (sql)=>{
    if(sql===undefined || sql===null)
        return 0
   for(let idx=0;idx<blockedWordsList.length;idx++){
       if(sql.toLowerCase().match(`\\b${blockedWordsList[idx].toLowerCase()}\\b`)!=null)
           return 0
    }
   return 1
}

/* Utility function for extracting words enclosed under {} */
const extractVar = (row)=>{
    row.forEach((element)=>{
        let inputVar = element.query.match(/{[\w]+}/g)
        if(inputVar != null) {
            /* Removing { and } from the string */
            for(let e in inputVar)
                inputVar[e] = inputVar[e].slice(1,-1)
            element.inputVar = inputVar
        }
        else
            element.inputVar = []
    })
}

/*Inserting user input values to SQL query for filtering */
const userInputToQuery = (query,input)=>{

    for(let obj in input) {
        query = query.replace("{"+input[obj].nameOfInput+"}",input[obj].valueOfInput)
    }
    return query
}

const decideTimeDependency = (row)=>{
    let countOfTimeDependency = 0
    row.forEach((element)=>{
        if(element.query.search("\\$timePeriod")!==-1){
            element.time_dependent = 1
            countOfTimeDependency += 1
        }
        else
            element.time_dependent = 0
    })
    return countOfTimeDependency
}


module.exports = {
    extractVar:extractVar,
    userInputToQuery:userInputToQuery,
    decideTimeDependency:decideTimeDependency,
    validateSql:validateSql
}