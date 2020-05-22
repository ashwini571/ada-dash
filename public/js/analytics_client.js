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

        if (type === 'all_data')
            createPivottable(data)
        else {   // Data
            let rows = JSON.parse(data.rows)
            let fields = JSON.parse(data.fields)

            if (type === 'filter')
                infoElem.innerText = "Count:-" + rows.length
            for (let field in fields) {
                fieldsElem.innerHTML += `<th scope="col">${fields[field].name}</th>`
            }
            for (let row in rows) {
                let trTag = "<tr>"
                for (let col in rows[row]) {
                    trTag += "<td>" + rows[row][col] + "</td>"
                }
                trTag += "</tr>"
                rowsElem.innerHTML += trTag
            }
        }
    }

    function noDataToDom(data) {
        clearCard()
        output.innerText = data
    }

    function getAndShowData(reqBody) {
        clearCard()
        getData(reqBody,"/analytics/getData",(data)=>{
            console.log(data)
            if(data.error)
                noDataToDom(data.error)
            else
                parseDataToDom(data,reqBody.type)
        })

    }

    let elements = document.getElementsByClassName('dropdown-item')

    /*Event-listener for dropdown items*/
    Array.from(elements).forEach((element) => {
        element.addEventListener('click', (event) => {
            let queryType = element.getAttribute("query_type")
            /* For filter type we need to add input fields to DOM */
            if(queryType === "filter")
            {
                let outputDiv = document.getElementById('output')
                clearCard()
                /* Adding Input field to DOM  */
                outputDiv.innerHTML = "<input type=\"text\" id=\"query_value\" name=\"query_value\">"
                outputDiv.innerHTML += "<button type=\"button\" id=\"query_button\">Search</button>"

                let submitButton = document.getElementById('query_button')

                submitButton.addEventListener('click',(event)=>{
                    let reqBody ={
                        usecase_id:element.getAttribute("usecase_id"),
                        title:element.innerText,
                        type:queryType,
                        input:outputDiv.getElementsByTagName('input')[0].value
                    }
                    getAndShowData(reqBody)
                 })
            }
            else /* Else we send the reqBody */
            {
                let reqBody ={
                    usecase_id:element.getAttribute("usecase_id"),
                    title:element.innerText,
                    type:queryType
                }
                getAndShowData(reqBody)
            }
        })
    })


})