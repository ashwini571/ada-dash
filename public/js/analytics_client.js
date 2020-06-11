$(document).ready(function() {


    // Data Targets
    let output = document.getElementById('output')
    let title = document.getElementById('heading')
    let timePeriod = document.getElementById('period')
    let lastFetchedDiv = document.getElementById('last_fetched_div')
    let exportBtnDiv = document.getElementById('export_btn_div')
    let reqBodyCopy
    /* Used to clear the output area */
    function clearCard() {
        /* Emptying field */
        output.innerHTML = ""
        lastFetchedDiv.style.display = "none"
        exportBtnDiv.style.display = "none"
    }

    /* Adds the recieved data to output */
    function parseDataToDom(data, type) {
        clearCard()
        //Last-fetched time update (Suitable for every type except filter )
        if(type !== 'filter'){
            lastFetchedDiv.style.display = ""
            let lastFetchedTimeElement =document.getElementById('time_last_fetched')
            lastFetchedTimeElement.innerText = data.last_fetched
            lastFetchedTimeElement.innerText += "[UTC]"
        }
        // for export-csv button(suitable for only table output)
        if(type === 'filter' || type === 'custom'){
            exportBtnDiv.style.display = ""
        }

        // Data
        if (type === 'count') {
            let rows = JSON.parse(data.rows)
            output.innerHTML= `<h2> Count: ${rows[0].count} </h2>`
        }
        else if(type === 'percent'){
            let rows = JSON.parse(data.rows)
            output.innerHTML= `<h2> Percentage: ${rows[0].percentage} </h2>`
        }
        else if(type === 'plot') {
            createPlot(data,data.x_axis,data.y_axis)
        }
        else {
            createPivottable(data)
        }
    }
    /* In case of error or empty fields */
    function noDataToDom(data) {
        clearCard()
        if(data.error)
            output.innerHTML= `<h2> Error! </h2>`
        output.innerHTML += JSON.stringify(data)
    }

    function getAndShowData(reqBody,url) {
        /*getData function is in utils_client.js */
        getData(reqBody,url,(data)=>{
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

    let queryElements = document.getElementsByClassName('query-list')
    /* Event-listeners on query-options */
    Array.from(queryElements).forEach((element) => {
        element.addEventListener('click', (event) => {
            let queryType = element.getAttribute("query_type")
            clearCard()
            /* For filter type we need to add input fields to DOM */
            if(queryType === "filter") {
                /* Getting names of all input fields required */
                let inputVar = element.getAttribute('inputVar').split(',')

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
                    let time
                    if(element.getAttribute('time_dependent') == 0)
                        time = 0
                    else
                        time = (timePeriod === null || timePeriod===undefined)?0:timePeriod.value
                    let reqBody = {
                        id:element.id,
                        usecase_id:element.getAttribute('usecase_id'),
                        input:input,
                        type:queryType,
                        timePeriod:time
                    }
                    reqBodyCopy = reqBody
                    getAndShowData(reqBody,"/analytics/getData")
                 })
            }
            else /* Else we send the reqBody */{
                let time
                if(element.getAttribute('time_dependent') == 0)
                    time = 0
                else
                    time = (timePeriod === null || timePeriod===undefined)?0:timePeriod.value
                let reqBody ={
                    id:element.id,
                    usecase_id:element.getAttribute('usecase_id'),
                    type:queryType,
                    timePeriod: time
                }
                reqBodyCopy = reqBody
                getAndShowData(reqBody,"/analytics/getData")
            }
        })
    })

    let plotElements = document.getElementsByClassName('plot-list')
    /* Event-listeners on plot-options */
    Array.from(plotElements).forEach((element) => {
        element.addEventListener('click', (event) => {
            let time
            if(element.getAttribute('time_dependent') == 0)
                time = 0
            else
                time = (timePeriod === null || timePeriod===undefined)?0:timePeriod.value
            let reqBody ={
                id:element.id,
                usecase_id:element.getAttribute('usecase_id'),
                type:'plot',
                timePeriod:time
            }
            reqBodyCopy = reqBody
            getAndShowData(reqBody,"/analytics/getPlotdata")
        })
    })
    let refreshBtn = document.getElementById('refresh-btn')
    refreshBtn.addEventListener('click',(event)=>{
        event.preventDefault()
        reqBodyCopy.cacheReset = 1
        if(reqBodyCopy.type == 'plot')
            getAndShowData(reqBodyCopy,"/analytics/getPlotdata")
        else
            getAndShowData(reqBodyCopy,"/analytics/getData")
    })
    // Auto Selecting first query of count type
    document.querySelectorAll("a[query_type='count']")[0].click()


    document.getElementById("export_btn").addEventListener("click", function () {
        let tableHtml = document.querySelector("table").outerHTML
        console.log(tableHtml)
        exportTableToCsv(tableHtml, "output.csv")
    })


})