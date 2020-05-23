$(document).ready(function(){

    let runBtn = document.querySelector('#run_query')
    let output = document.querySelector('#output')
    let info = document.querySelector('#info')
    runBtn.addEventListener('click',(e)=>{
        e.preventDefault()
        let query = document.querySelector('textarea').value

        let reqBody = {
            query:query
        }
        getData(reqBody,"/run_query",(data)=>{
            if(data.error) {
                output.innerHTML = ""
                info.innerHTML = ""
                output.innerText = data.error
            }
            else{
                output.innerHTML = ""
                info.innerHTML = ""
                createPivottable(data)
            }
        })
    })
})