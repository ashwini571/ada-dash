$(document).ready(function() {

    let genSqlForm = document.getElementById('gen_sql_form')
    let textareaSql = document.getElementById('gen_sql')
    let sqlDivBlock = document.getElementById('sql_block')
    let genSqlBtnAdd = document.getElementById('gen_sql_btn_add')
    let genSqlBtnEdit = document.getElementById('gen_sql_btn_edit')
    let saveBtn = document.getElementById('save_btn')
    const generateSql = ()=>{
        let reqBody = {
            tablename: document.getElementById('tablename_form').value,
            x_axis: $("#x_axis_form :selected").val(),
            y_axis: $("#y_axis_form :selected").val(),
            date_time_format: $("input[name='date_time_format']:checked").val()
        }
        getData(reqBody,"/config/plot/gen_sql",(data)=>{
            if (data){
                console.log(data)
                sqlDivBlock.style.display = ""
                textareaSql.innerText = data.sql
                saveBtn.style.display = ""
            }
        })
    }
    /* POST, Generate Sql for add_plot page*/
    genSqlBtnAdd.addEventListener('click', (event) => {
        event.preventDefault()
        generateSql()
    })
    /*POST, Generate Sql for Editing plot */
    genSqlBtnEdit.addEventListener('click',(event)=>{
        event.preventDefault()
        generateSql()

    })
})