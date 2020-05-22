/* Makes form editable, This needs to be global as it is called from  tag.onclick */
function handleEdit(id) {
    document.getElementById('type'+id).disabled = false;
    document.getElementById('title'+id).disabled = false;
    document.getElementById('query'+id).disabled = false;
    document.getElementById('edit'+id).hidden = true;
    document.getElementById('save'+id).hidden = false;

    return false;
}
$(document).ready(function() {
    // Updating via fetch()
    function putData(reqBody) {
        let init = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(reqBody)
        }
        fetch("/add_query/" + reqBody.usecase_id + "/update", init)
            .then((res) => {
                return res.json()
            }).then((data) => {
            if (data.msg)
                alert("Updated Successfully!")
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
                query: element.getElementsByTagName('textarea')[0].value
            }
            putData(reqBody)
        })
    })

})

