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
$(document).ready(function() {

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

    let delButtonsQuery = document.getElementsByClassName('del-btn-query')
    Array.from(delButtonsQuery).forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault()
            let id = element.id.slice(12)
            if(window.confirm("Are you sure ?"))
                delData("/config/query/delete/"+id,'query')
        })
    })
    /*Update and delete for queries --END */

})

