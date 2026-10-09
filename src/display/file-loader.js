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
  if (!e.target.result) { return false }

  let jsonMapData = JSON.parse(e.target.result)
  if (!jsonMapData || !jsonMapData.mapData) { return false }

  if (jsonMapData.marginValues && Object.keys(jsonMapData.marginValues).toString() == Object.keys(marginValues).toString())
  {
    currentCustomMapSource.setCustomDefaultMargins(jsonMapData.marginValues)
  }
  else
  {
    currentCustomMapSource.setCustomDefaultMargins(cloneObject(defaultMarginValues))
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
  
  currentEditingMode = jsonMapData.editingMode ?? EditingMode.margin
  updateSelectedEditMode()
  currentCustomMapSource.setEditingMode(currentEditingMode)

  currentCustomMapSource.setTextMapData(jsonMapData.mapData)

	setMapSource(currentCustomMapSource, true, true)
  
  return true
}

function csvFileLoaded(e)
{
  let textMapData = e.target.result
  if (!textMapData) { return }

  currentCustomMapSource.setTextMapData(textMapData)

	setMapSource(currentCustomMapSource, true, true)
}

function imageFileLoaded(e)
{
  let backgroundURL = "url('" + e.target.result + "')"
	$("#totalsPieChart").css("background-image", backgroundURL)
  
  if (currentMapSource.isCustom())
  {
    autoSaveCurrentUserMap()
  }
}

function downloadMapFile(mapSourceToDownload, fileType)
{
  if (!mapSourceToDownload.getTextMapData()) { return }

  const downloadLinkDiv = $(document.createElement("a"))
  downloadLinkDiv.hide()

  const fileDataString = getMapFileDataString(mapSourceToDownload.getTextMapData(), fileType, mapSourceToDownload.getDropdownPartyIDs())
  const fileToDownload = new Blob([fileDataString], {type: fileType})
  downloadLinkDiv.attr('href', window.URL.createObjectURL(fileToDownload))
  downloadLinkDiv.attr('download', "custom-map-" + getTodayString("-", true))

  downloadLinkDiv[0].click()

  downloadLinkDiv.remove()
}

function getMapFileDataString(textMapData, fileType, partyIDs)
{
  let dataString
  switch (fileType)
  {
    case kJSONFileType:
    let pieChartIconURL = $("#totalsPieChart").css("background-image")
    if (pieChartIconURL)
    {
      pieChartIconURL = pieChartIconURL.replace("url(\"", "").replace("\")", "")
    }
    
    let customParties = []
    for (let partyNum in partyIDs)
    {
      if (partyIDs[partyNum].startsWith(customPartyIDPrefix))
      {
        customParties.push(politicalParties[partyIDs[partyNum]])
      }
    }
    
    dataString = JSON.stringify({
      mapData: textMapData,
      marginValues: marginValues,
      iconURL: pieChartIconURL,
      partyIDs: partyIDs,
      customParties: customParties,
      editingMode: currentEditingMode
    })
    break

    case kCSVFileType:
    dataString = textMapData
    break

    default:
    dataString = ""
    break
  }

  return dataString
}
