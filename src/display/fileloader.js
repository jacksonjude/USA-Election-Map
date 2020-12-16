$("html").on('dragenter', function(e) {
  e.stopPropagation()
  e.preventDefault()
})

$("html").on('dragover', function(e) {
  e.stopPropagation()
  e.preventDefault()
})

$("html").on('drop', function(e) {
  e.stopPropagation()
  e.preventDefault()

  var file = e.originalEvent.dataTransfer.files[0]
  loadUploadedFile(file)
})

function loadUploadedFile(file)
{
  var fr = new FileReader()

  switch (file.type)
  {
    case kJSONFileType:
    fr.onload = jsonFileLoaded
    fr.readAsText(file)
    break

    case kCSVFileType:
    fr.onload = csvFileLoaded
    fr.readAsText(file)
    break

    case kJPEGFileType:
    case kPNGFileType:
    fr.onload = imageFileLoaded
    fr.readAsDataURL(file)
    break

    default:
    return
  }
}

function jsonFileLoaded(e)
{
  if (!e.target.result) { return }

  var jsonMapData = JSON.parse(e.target.result)
  if (!jsonMapData || !jsonMapData.mapData) { return }

  if (jsonMapData.marginValues && Object.keys(jsonMapData.marginValues).toString() == Object.keys(marginValues).toString())
  {
    marginValues = jsonMapData.marginValues
  }
  else
  {
    marginValues = cloneObject(defaultMarginValues)
  }
  createMarginEditDropdownItems()

  if (jsonMapData.iconURL)
  {
    CustomMapSource.setIconURL(jsonMapData.iconURL)
  }
  else
  {
    CustomMapSource.setIconURL("")
  }

  CustomMapSource.setTextMapData(jsonMapData.mapData)

  currentMapSource = CustomMapSource
  updateMapSourceButton()
  loadDataMap(false, true)
}

function csvFileLoaded(e)
{
  var textMapData = e.target.result
  if (!textMapData) { return }

  CustomMapSource.setTextMapData(textMapData)

  currentMapSource = CustomMapSource
  updateMapSourceButton()
  loadDataMap(false, true)
}

function imageFileLoaded(e)
{
  var backgroundURL = "url('" + e.target.result + "')"
	$("#evPieChart").css("background-image", backgroundURL)
}

function downloadMapFile(mapSourceToDownload, fileType)
{
  if (!mapSourceToDownload.getTextMapData()) { return }

  var downloadLinkDiv = $(document.createElement("a"))
  downloadLinkDiv.hide()

  var pieChartIconURL = $("#evPieChart").css("background-image")
  if (pieChartIconURL)
  {
    pieChartIconURL = pieChartIconURL.replace("url(\"", "").replace("\")", "")
  }

  var fileToDownload = getMapFileBlob(mapSourceToDownload.getTextMapData(), fileType, pieChartIconURL)
  downloadLinkDiv.attr('href', window.URL.createObjectURL(fileToDownload))
  downloadLinkDiv.attr('download', "custom-map-" + getTodayString("-", true))

  downloadLinkDiv[0].click()

  downloadLinkDiv.remove()
}

function getMapFileBlob(textMapData, fileType, pieChartIconURL)
{
  var dataString
  switch (fileType)
  {
    case kJSONFileType:
    dataString = JSON.stringify({mapData: textMapData, marginValues: marginValues, iconURL: pieChartIconURL})
    break

    case kCSVFileType:
    dataString = textMapData
    break

    default:
    dataString = ""
    break
  }

  var fileToDownload = new Blob([dataString], {type: fileType})
  return fileToDownload
}
