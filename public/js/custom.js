$(document).ready(function(){
    /* Adds options to datalist  */
    let timePeriod = document.querySelector('#period').value
    let dataList = document.querySelector('#periods')
    let optionsLen = 5
    for(let i=1;i<=optionsLen;i++)
        dataList.innerHTML+=`<option value="${Number(timePeriod)*i}"></option>`

})

$(function() {
    $(".tabs").tabs({
        show: { effect: "blind", direction: "right", duration: 300 }
    })
    $( "#accordion" ).accordion()

    var btn = $('#accordion li a')
    var wrapper = $('#accordion li')

    $(btn).on('click', function() {
        $(btn).removeClass('active')
        $(btn).parent().find('.addon').removeClass('fadein')

        $(this).addClass('active')
        $(this).parent().find('.addon').addClass('fadein')
    })
})