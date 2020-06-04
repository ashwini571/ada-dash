$(document).ready(function(){
    /* Adds options to datalist  */
    let timePeriod = document.querySelector('#period')
    let dataList = document.querySelector('#periods')
    let optionsLen = 5
    for(let i=1;i<=optionsLen;i++)
        dataList.innerHTML+=`<option value="${Number(timePeriod.value)*i}"></option>`


    function setAttributes(el, attrs) {
        for(var key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    }


    let queryList = Array.prototype.slice.call(document.getElementsByClassName("query-list"), 0)
    let plotList = Array.prototype.slice.call(document.getElementsByClassName("plot-list"), 0)
    let optionsList = queryList.concat(plotList)

    /* Adding indicator on icon */
    Array.from(optionsList).forEach((element)=>{
       if(element.getAttribute('time_dependent') === '1') {
           setAttributes(element.getElementsByClassName('circle')[0],{"style":"background-color:yellow"})
           setAttributes(element.getElementsByClassName('icon')[0],{"data-toggle":"tooltip", "data-placement":"right", "title":"Results are time-dependent"})
       }
    })
    /* Flash icons on input change */
    timePeriod.addEventListener('input',(event)=>{
        Array.from(optionsList).forEach((element)=>{
            if(element.getAttribute('time_dependent') === '1') {
                element.getElementsByClassName('block')[0].classList.add("flash")
                setTimeout(function () {
                    console.log(1)
                    element.getElementsByClassName('block')[0].classList.remove("flash")
                },1500)
            }
        })
    })

    /* Listeners for Maximize button */
    let maximizeBtn = document.getElementById('maximize')
    maximizeBtn.addEventListener('click',(event)=>{
        let outputData = document.getElementById('output_window')
        let modalBody = document.getElementsByClassName('modal-body')[0]
        modalBody.innerHTML = outputData.innerHTML
        // Removing plotly icons
        let icons = modalBody.getElementsByClassName('modebar')
        Array.prototype.slice.call(icons).forEach(
            function(item) {
                item.remove();
            })
    })
})

/* Reference :- codepen.io */
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