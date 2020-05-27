$(document).ready(function() {

    // Data Targets
    let output = document.getElementById('output')
    let title = document.getElementById('heading')
    let timePeriod = document.getElementById('period')
    let helpbox = document.getElementById('helpbox')



    /* Used to clear the output area */
    function clearCard() {
        /* Emptying field */
        output.innerHTML = ""
        helpbox.innerHTML = ""
        
    }

    /* Adds the recieved data to output */
    function parseDataToDom(data, type) {
        clearCard()
        if (type === 'count') {
            console.log(title.innerText)
            let rows = JSON.parse(data.rows)
            output.innerText = "Count:-" + rows[0].count
        }
        else {
            console.log(data)
            if(data.help){
                helpbox.innerHTML = `<button type="button" id="help" class="btn btn-sm btn-info" data-toggle="popover" data-trigger="focus" title="Help" data-content="${data.help}" >Help!</button>`
                //Popup helpbox
                $('[data-toggle="popover"]').popover()
                $('.popover-dismiss').popover({
                    trigger: 'focus'
                })
            }
            createPivottable(data)
        }
    }

    function noDataToDom(data) {
        clearCard()
        output.innerText = data
    }

    function getAndShowData(reqBody) {
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

    let elements = document.getElementsByClassName('options-list')

    /* Event-listeners on elements */
    Array.from(elements).forEach((element) => {
        element.addEventListener('click', (event) => {
            let queryType = element.getAttribute("query_type")
            clearCard()
            /* For filter type we need to add input fields to DOM */
            if(queryType === "filter")
            {
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
                    console.log(input)

                    let reqBody = {
                        id:element.id,
                        usecase_id:element.getAttribute('usecase_id'),
                        input:input,
                        timePeriod:timePeriod.value
                    }
                    getAndShowData(reqBody)
                 })
            }
            else /* Else we send the reqBody */
            {
                let reqBody ={
                    id:element.id,
                    usecase_id:element.getAttribute('usecase_id'),
                    type:queryType,
                    timePeriod:timePeriod.value
                }
                getAndShowData(reqBody)
            }
        })
    })
})