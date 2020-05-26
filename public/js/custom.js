$(document).ready(function(){
    /* Adds options to datalist  */
    let timePeriod = document.querySelector('#period').value
    let dataList = document.querySelector('#periods')
    let optionsLen = 5
    for(let i=1;i<=optionsLen;i++)
        dataList.innerHTML+=`<option value="${Number(timePeriod)*i}"></option>`

})
