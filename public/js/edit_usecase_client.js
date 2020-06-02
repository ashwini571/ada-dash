function handleEditUsecase() {
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
        let id = usecaseDelButton.getAttribute('usecase_id')
        if(window.confirm("Are you sure ?"))
            delData("/config/usecase/delete/"+id,'usecase')
    })
    /*Update and delete for Usecase --END */


})

