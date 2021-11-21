const kCSVFileType = "text/csv"
const kJSONFileType = "application/json"
const kPNGFileType = "image/png"
const kJPEGFileType = "image/jpeg"

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

  if (file == null) { return }
  if (currentMapType.getCustomMapEnabled() == false && (file.type == kJSONFileType || file.type == kCSVFileType)) { return }

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
    currentCustomMapSource.setIconURL(jsonMapData.iconURL)
  }
  else
  {
    currentCustomMapSource.setIconURL("")
  }

  if (jsonMapData.customParties)
  {
    for (partyNum in jsonMapData.customParties)
    {
      var currentParty = jsonMapData.customParties[partyNum]
      politicalParties[currentParty.id] = new PoliticalParty(
        currentParty.id,
        currentParty.names,
        currentParty.shortName,
        currentParty.candidateName,
        currentParty.marginColors,
        currentParty.marginNames
      )
    }
  }

  if (jsonMapData.partyIDs)
  {
    currentCustomMapSource.setDropdownPartyIDs(jsonMapData.partyIDs)
  }

  currentCustomMapSource.setTextMapData(jsonMapData.mapData)

  currentMapSource = currentCustomMapSource
  updateNavBarForNewSource()
  loadDataMap(false, true)
}

function csvFileLoaded(e)
{
  var textMapData = e.target.result
  if (!textMapData) { return }

  currentCustomMapSource.setTextMapData(textMapData)

  currentMapSource = currentCustomMapSource
  updateNavBarForNewSource()
  loadDataMap(false, true)
}

function imageFileLoaded(e)
{
  var backgroundURL = "url('" + e.target.result + "')"
	$("#totalsPieChart").css("background-image", backgroundURL)
}

function downloadMapFile(mapSourceToDownload, fileType)
{
  if (!mapSourceToDownload.getTextMapData()) { return }

  var downloadLinkDiv = $(document.createElement("a"))
  downloadLinkDiv.hide()

  var pieChartIconURL = $("#totalsPieChart").css("background-image")
  if (pieChartIconURL)
  {
    pieChartIconURL = pieChartIconURL.replace("url(\"", "").replace("\")", "")
  }

  var fileToDownload = getMapFileBlob(mapSourceToDownload.getTextMapData(), fileType, pieChartIconURL, mapSourceToDownload.getDropdownPartyIDs())
  downloadLinkDiv.attr('href', window.URL.createObjectURL(fileToDownload))
  downloadLinkDiv.attr('download', "custom-map-" + getTodayString("-", true))

  downloadLinkDiv[0].click()

  downloadLinkDiv.remove()
}

function getMapFileBlob(textMapData, fileType, pieChartIconURL, partyIDs)
{
  var dataString
  switch (fileType)
  {
    case kJSONFileType:
    var customParties = []
    for (var partyNum in partyIDs)
    {
      if (partyIDs[partyNum].startsWith(customPartyIDPrefix))
      {
        customParties.push(politicalParties[partyIDs[partyNum]])
      }
    }
    dataString = JSON.stringify({mapData: textMapData, marginValues: marginValues, iconURL: pieChartIconURL, partyIDs: partyIDs, customParties: customParties})
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
