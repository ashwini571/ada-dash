$(document).ready(function() {

    let genSqlForm = document.getElementById('gen_sql_form')
    let textareaSql = document.getElementById('gen_sql')
    let sqlDivBlock = document.getElementById('sql_block')
    let genSqlBtn = document.getElementById('gen_sql_btn')
    let saveBtn = document.getElementById('save_btn')
    /* POST, Generate Sql */
    genSqlBtn.addEventListener('click', (event) => {
        event.preventDefault()
        let tablename =document.getElementById('tablename_form')
        let x_axis =  $("#x_axis_form :selected")
        let y_axis =  $("#y_axis_form :selected")
        let date_time_format = $("input[name='date_time_format']:checked")
        let reqBody = {
            tablename: tablename.value,
            x_axis: x_axis.val(),
            y_axis: y_axis.val(),
            date_time_format: date_time_format.val()
        }
        let init = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(reqBody)
        }
        fetch('/config/plot/gen_sql' , init)
            .then((res) => {
                return res.json()
            }).then((data) => {
            if (data){
                console.log(data)
                sqlDivBlock.style.display = ""
                textareaSql.innerText = data.sql
                saveBtn.style.display = ""
            }
        })
    })
})