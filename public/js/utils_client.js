// Pivottable
function createPivottable(data)
{
    let modifiedData = JSON.parse(data.rows)
    let derivers = $.pivotUtilities.derivers
    let renderers = $.extend($.pivotUtilities.renderers,
        $.pivotUtilities.plotly_renderers)
    $("#output").pivotUI(modifiedData, {
        renderers: renderers,
        // rendererName: "Line Chart",
        // cols:["download_time"],
        rowOrder: "value_a_to_z", colOrder: "value_z_to_a",
    })

}

// Fetching data
function getData(reqBody,url,callback)
{
    /* Loader */
    document.getElementById("output").innerHTML = `<div class="loader"></div>`
    let init ={
        method:"POST",
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify(reqBody)
    }
    fetch(url,init)
        .then((res)=>{
            return res.json()
        }).then((data)=>{
        callback(data)
    })

}