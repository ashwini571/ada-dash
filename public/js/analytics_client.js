$(document).ready(function() {

    // Data Targets
    let fieldsElem = document.getElementById('fields')
    let rowsElem = document.getElementById('rows')
    let pivotOutput = document.getElementById('output')
    let infoElem = document.getElementById('info')
    let output = document.getElementById('output')

    /* Used to clear the output area */
    function clearCard() {
        /* Emptying fields */
        fieldsElem.innerHTML = ""
        rowsElem.innerHTML = ""
        pivotOutput.innerHTML = ""
        infoElem.innerText = ""
    }

    /* Adds the recieved data to output */
    function parseDataToDom(data, type) {
        /* Emptying fields before appending */
        clearCard()

        if (type === 'count') {
            let rows = JSON.parse(data.rows)
            infoElem.innerText = "Count:-" + rows[0].count
        }
        else
            createPivottable(data)
    }

    function noDataToDom(data) {
        clearCard()
        output.innerText = data
    }

    function getAndShowData(reqBody) {
        clearCard()
        /*getData function is in utils_client.js */
        getData(reqBody,"/analytics/getData",(data)=>{
            if(data.error)
                noDataToDom(data.error)
            else
                parseDataToDom(data,reqBody.type)
        })
    }
    function appendInputElem(inputVar) {
        for(let e in inputVar)
            output.innerHTML += `<input type="text" placeholder=${inputVar[e]}>`
        output.innerHTML += `<button type="button" id="query_button">Search</button>`
    }

    let elements = document.getElementsByClassName('dropdown-item')

    /*Event-listener for dropdown items*/
    Array.from(elements).forEach((element) => {
        element.addEventListener('click', (event) => {
            let queryType = element.getAttribute("query_type")
            /* For filter type we need to add input fields to DOM */
            if(queryType === "filter")
            {
                /* Getting names of all input fields required */
                let inputVar = element.getAttribute('inputVar').split(',')
                clearCard()
                /* Adding Input field to DOM */
                appendInputElem(inputVar)
                /*Listening for input submission */
                let submitButton = document.getElementById('query_button')
                submitButton.addEventListener('click',(event)=>{
                    let inputTags = output.getElementsByTagName('input')
                    let input = []

                    for(let idx=0;idx<inputTags.length;idx++)
                    {
                        let nameOfInput = inputTags[idx].getAttribute('placeholder')
                        let valueOfInput = inputTags[idx].value
                        input.push({nameOfInput,valueOfInput})
                    }
                    console.log(input)
                    let timePeriod = document.getElementById('period').value
                    let reqBody = {
                        id:element.id,
                        usecase_id:element.getAttribute('usecase_id'),
                        input:input,
                        timePeriod:timePeriod
                    }
                    getAndShowData(reqBody)
                 })
            }
            else /* Else we send the reqBody */
            {
                let timePeriod = document.getElementById('period').value
                let reqBody ={
                    id:element.id,
                    usecase_id:element.getAttribute('usecase_id'),
                    type:queryType,
                    timePeriod:timePeriod
                }
                getAndShowData(reqBody)
            }
        })
    })
})