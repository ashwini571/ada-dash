function handleEditUsecase(id) {
    document.getElementById('title-usecase').disabled = false
    document.getElementById('tablename-usecase').disabled = false

    document.getElementById('edit-usecase').hidden = true
    document.getElementById('save-usecase').hidden = false

    return false
}
$(document).ready(function() {

    /*Update and delete for Usecase --START */
    let usecaseForm = document.getElementById('form-usecase')
    let usecaseDelButton = document.getElementById('del-usecase')

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

