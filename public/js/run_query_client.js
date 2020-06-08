$(document).ready(function(){

    let runBtn = document.querySelector('#run_query')
    let output = document.querySelector('#output')
    let info = document.querySelector('#info')
    let form = document.querySelector('textarea')

    let handler = (e)=>{
        /* Click event + (Ctrl+Enter) Event */
        if (e.type === 'click' || (e.ctrlKey && e.keyCode === 13)) {
            e.preventDefault()
            let query = document.querySelector('textarea').value
            let reqBody = {
                query:query
            }
            getData(reqBody,"/run_query",(data)=>{
                if(data.error) {
                    output.innerHTML = ""
                    info.innerHTML = ""
                    output.innerHTML= `<h2> Error! </h2>`
                    output.innerHTML += JSON.stringify(data.error)
                }
                else{
                    output.innerHTML = ""
                    info.innerHTML = ""
                    createPivottable(data)
                }
            })
        }

    }
    runBtn.addEventListener('click',handler)
    form.addEventListener('keydown',handler)
})