// Pivottable
function createPivottable(data) {
    let modifiedData = JSON.parse(data.rows)
    // Brings an array of strings of column names
    let allColumns = Object.keys(modifiedData[0])
    let derivers = $.pivotUtilities.derivers
    let renderers = $.extend($.pivotUtilities.renderers,
        $.pivotUtilities.plotly_renderers)
    $("#output").pivotUI(modifiedData, {
        rows:allColumns,
        renderers: renderers,
        rowOrder: "value_a_to_z", colOrder: "value_z_to_a",
    },true)
}
// Pivottable with Line chart as default
function createPlot(data,x_axis,y_axis) {
    let modifiedData = JSON.parse(data.rows)
    let derivers = $.pivotUtilities.derivers
    let renderers = $.extend($.pivotUtilities.renderers,
        $.pivotUtilities.plotly_renderers)
    $("#output").pivotUI(modifiedData, {
        renderers: renderers,
        rendererName: "Bar Chart",
        cols:["days"],
        aggregatorName :"Sum",
        vals: [y_axis+"_count"],
        rowOrder: "value_a_to_z", colOrder: "value_z_to_a",
    },true)
}

// Fetching data from a url by providing reqBody
function getData(reqBody,url,callback) {
    /* Loader */
    let output =  document.getElementById("output")
    if(output !== null)
        output.innerHTML = `<div class="loader"></div>`
    let init ={
        method:"POST",
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify(reqBody)
    }
    fetch(url,init)
        .then((res)=>{
            return res.json()
        })
        .then((data)=>{
        callback(data)
        })
        .catch((error)=>{
            alert(error)
        })
}

/* functions for editing and deleting query and plots */
// Update function via fetch()
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
        .catch((error)=>{
            alert(error)
        })
}
// Delete function via fetch()
function delData(url,type) {
    let init = {
        method: "DELETE",
    }
    fetch(url, init)
        .then((res) => {
            return res.json()
        }).then((data) => {
        if (data.msg) {
            alert("Deleted Successfully!")
            if(type==='usecase')
                window.location.replace('/')
            else
                location.reload()
        }
        else
            alert(data.error)
        })
        .catch((error)=>{
            alert(error)
        })
}

/* functions for creating csv from html */
function downloadCsv(csv, filename) {
    let csvFile
    let downloadLink

    // CSV FILE
    csvFile = new Blob([csv], {type: "text/csv"})

    // Download link
    downloadLink = document.createElement("a")

    // File name
    downloadLink.download = filename

    // We have to create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile)

    // Make sure that the link is not displayed
    downloadLink.style.display = "none"

    // Add the link to your DOM
    document.body.appendChild(downloadLink)

    // Lanzamos
    downloadLink.click()
}

function exportTableToCsv(html, filename) {
    let csv = []
    let rows = document.querySelectorAll("table.pvtTable tr")

    for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll("td, th")

        for (let j = 0 ;j < cols.length; j++)
            row.push(cols[j].innerText)

        csv.push(row.join(","))
    }
    // Download CSV
    downloadCsv(csv.join("\n"), filename)
}