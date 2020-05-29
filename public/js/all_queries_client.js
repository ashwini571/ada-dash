/* Makes form editable, This needs to be global as it is called from  tag.onclick */
function handleEdit(id) {
    document.getElementById('type'+id).disabled = false
    document.getElementById('title'+id).disabled = false
    document.getElementById('query'+id).disabled = false
    document.getElementById('description'+id).disabled = false
    document.getElementById('edit'+id).hidden = true
    document.getElementById('save'+id).hidden = false


    return false
}
$(document).ready(function() {
    // Updating via fetch()
    function putData(reqBody) {
        let init = {
            method: "PUT",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(reqBody)
        }
        fetch("/config/query/update" , init)
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

    let elements = document.getElementsByClassName('form-horizontal')
    Array.from(elements).forEach((element) => {
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
            putData(reqBody)
        })
    })

    function delData(id) {
        let init = {
            method: "DELETE",
        }
        fetch("/config/query/delete/"+id, init)
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

    let delButtons = document.getElementsByClassName('del-button')
    Array.from(delButtons).forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault()
            let id = element.id.slice(6)
            console.log(id)
            if(window.confirm("Are you sure ?"))
                delData(id)
        })
    })


})

