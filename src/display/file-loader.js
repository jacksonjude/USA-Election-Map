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

  let file = e.originalEvent.dataTransfer.files[0]
  loadUploadedFile(file)
})

function loadUploadedFile(file)
{
  let fr = new FileReader()

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

  let jsonMapData = JSON.parse(e.target.result)
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
    for (let partyNum in jsonMapData.customParties)
    {
      let currentParty = jsonMapData.customParties[partyNum]
      politicalParties[currentParty.id] = new PoliticalParty(
        currentParty.id,
        currentParty.names,
        currentParty.shortName,
        currentParty.candidateName,
        currentParty.marginColors
      )
    }
  }

  if (jsonMapData.partyIDs)
  {
    currentCustomMapSource.setDropdownPartyIDs(jsonMapData.partyIDs)
  }

  currentCustomMapSource.setTextMapData(jsonMapData.mapData)

	setMapSource(currentCustomMapSource, false, true)
}

function csvFileLoaded(e)
{
  let textMapData = e.target.result
  if (!textMapData) { return }

  currentCustomMapSource.setTextMapData(textMapData)

	setMapSource(currentCustomMapSource, false, true)
}

function imageFileLoaded(e)
{
  let backgroundURL = "url('" + e.target.result + "')"
	$("#totalsPieChart").css("background-image", backgroundURL)
}

function downloadMapFile(mapSourceToDownload, fileType)
{
  if (!mapSourceToDownload.getTextMapData()) { return }

  let downloadLinkDiv = $(document.createElement("a"))
  downloadLinkDiv.hide()

  let pieChartIconURL = $("#totalsPieChart").css("background-image")
  if (pieChartIconURL)
  {
    pieChartIconURL = pieChartIconURL.replace("url(\"", "").replace("\")", "")
  }

  let fileToDownload = getMapFileBlob(mapSourceToDownload.getTextMapData(), fileType, pieChartIconURL, mapSourceToDownload.getDropdownPartyIDs())
  downloadLinkDiv.attr('href', window.URL.createObjectURL(fileToDownload))
  downloadLinkDiv.attr('download', "custom-map-" + getTodayString("-", true))

  downloadLinkDiv[0].click()

  downloadLinkDiv.remove()
}

function getMapFileBlob(textMapData, fileType, pieChartIconURL, partyIDs)
{
  let dataString
  switch (fileType)
  {
    case kJSONFileType:
    let customParties = []
    for (let partyNum in partyIDs)
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

  let fileToDownload = new Blob([dataString], {type: fileType})
  return fileToDownload
}
