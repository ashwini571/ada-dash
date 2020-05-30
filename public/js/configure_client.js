/* Makes form editable, This needs to be global as it is called from  tag.onclick */
function handleEditQuery(id) {
    document.getElementById('type'+id).disabled = false
    document.getElementById('title'+id).disabled = false
    document.getElementById('query'+id).disabled = false
    document.getElementById('description'+id).disabled = false
    document.getElementById('edit-query'+id).hidden = true
    document.getElementById('save-query'+id).hidden = false


    return false
}
function handleEditUsecase(id) {
    document.getElementById('title-usecase').disabled = false
    document.getElementById('tablename-usecase').disabled = false

    document.getElementById('edit-usecase').hidden = true
    document.getElementById('save-usecase').hidden = false

    return false
}
$(document).ready(function() {
    // Updating via fetch()
    function putData(reqBody,url) {
        let init = {
            method: "PUT",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(reqBody)
        }
        fetch(url , init)
            .then((res) => {
                return res.json()
            }).then((data) => {
            if (data.msg){
                alert("Updated Successfully!")
                location.reload()
            }
            else
                console.log(data.error)
        })
    }

    function delData(url) {
        let init = {
            method: "DELETE",
        }
        fetch(url, init)
            .then((res) => {
                return res.json()
            }).then((data) => {
            if (data.msg) {
                alert("Deleted Successfully!")
                location.reload()
            }
            else
                alert(data.error)
        })
    }
    /*Update and delete for queries --START */
    let formsQuery = document.getElementsByClassName('form-horizontal')
    Array.from(formsQuery).forEach((element) => {
        element.addEventListener('submit', (event) => {
            event.preventDefault()

            let reqBody = {
                usecase_id: element.getAttribute('usecase_id'),
                id: element.id,
                type: element.getElementsByTagName('select')[0].value,
                title: element.getElementsByTagName('input')[0].value,
                query: element.getElementsByTagName('textarea')[0].value,
                description: element.getElementsByTagName('textarea')[1].value
            }
            putData(reqBody,"/config/query/update")
        })
    })

    let delButtonsQuery = document.getElementsByClassName('del-button')
    Array.from(delButtonsQuery).forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault()
            let id = element.id.slice(6)
            if(window.confirm("Are you sure ?"))
                delData(id)
        })
    })
    /*Update and delete for queries --END */


    /*Update and delete for Usecase --START */
    let usecaseForm = document.getElementById('usecase-form')
    let usecaseDelButton = document.getElementById('usecase-del')

    usecaseForm.addEventListener('submit',(event)=>{
        event.preventDefault()
        let reqBody = {
            id:document.getElementById('id-usecase').value,
            title:document.getElementById('title-usecase').value,
            tablename:document.getElementById('tablename-usecase').value
        }
        putData(reqBody,"/config/usecase/update")
    })

    usecaseDelButton.addEventListener('click',(event)=>{
        event.preventDefault()
        let id = element.id.slice(6)
        if(window.confirm("Are you sure ?"))
            delData(id)
    })
    /*Update and delete for Usecase --END */


})

