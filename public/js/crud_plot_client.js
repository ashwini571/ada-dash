$(document).ready(function() {
    /* Generate Sql for Editing plot */
    let generateSqlButtonsForEdit = document.getElementsByClassName('generate')
    Array.from(generateSqlButtonsForEdit).forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault()
            let id = element.id
            let textareaSql = document.getElementById('query'+id)
            let reqBody = {
                tablename: document.getElementById('tablename'+id).value,
                x_axis: $("#x_axis"+id+" :selected").val(),
                y_axis: $("#y_axis"+id+" :selected").val(),
                date_time_format: $("input[name=date_time_format"+id+"]:checked").val()
            }
            getData(reqBody,"/config/plot/gen_sql",(data)=>{
                if (data){
                    console.log(data)
                    textareaSql.innerText = data.sql
                }
            })
        })
    })
})