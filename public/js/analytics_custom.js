$(document).ready(function() {

    //Pivottable
    function createPivottable(data)
    {
        /* Emptying fields before appending */
        clearCard()

        let modifiedData = JSON.parse(data.rows)
        let derivers = $.pivotUtilities.derivers
        let renderers = $.extend($.pivotUtilities.renderers,
            $.pivotUtilities.plotly_renderers)
        $("#output").pivotUI(modifiedData, {
            renderers: renderers,
            rowOrder: "value_a_to_z", colOrder: "value_z_to_a",
        })
        //Popup Helpbox
        $('[data-toggle="popover"]').popover()
        $('.popover-dismiss').popover({
            trigger: 'focus'
        })
    }
    function clearCard()
    {
        let fieldsElem = document.getElementById('fields')
        let rowsElem= document.getElementById('rows')
        let pivotOutput = document.getElementById('output')

        /* Emptying fields before appending */
        fieldsElem.innerHTML = ""
        rowsElem.innerHTML = ""
        pivotOutput.innerHTML = ""
    }
    function parseDataToDom(data,type)
    {
        if(type == 'all_data')
            createPivottable(data)
        else
        {
            let rows = JSON.parse(data.rows)
            let fields = JSON.parse(data.fields)

            let fieldsElem = document.getElementById('fields')
            let rowsElem= document.getElementById('rows')
            let pivotOutput = document.getElementById('output')

            /* Emptying fields before appending */
            clearCard()

            for(let field in fields)
            {
                fieldsElem.innerHTML += `<th scope="col">${fields[field].name}</th>`
            }
            for(let row in rows)
            {
                let trTag = "<tr>"
                for(let col in rows[row])
                {
                    trTag+="<td>"+ rows[row][col] +"</td>"
                }
                trTag+="</tr>"
                rowsElem.innerHTML+=trTag
            }
        }
    }

    //Fetching data
    function getData(reqBody)
    {
        console.log(reqBody)
        let init ={
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(reqBody)
        }
        fetch("/analytics/getData",init)
            .then((res)=>{
              return res.json()
            }).then((data)=>{
                parseDataToDom(data,reqBody.type)
            })
    }

    var elements = document.getElementsByClassName('dropdown-item');

    //Event-listener for dropdown items
    Array.from(elements).forEach((element) => {
        element.addEventListener('click', (event) => {
            let queryType = element.getAttribute("query_type")

            if(queryType == "filter")
            {
                let outputDiv = document.getElementById('output')
                clearCard()
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
                    getData(reqBody)
                 })


            }
            else
            {
                let reqBody ={
                    usecase_id:element.getAttribute("usecase_id"),
                    title:element.innerText,
                    type:queryType
                }
                getData(reqBody)
            }
        });
    });


})