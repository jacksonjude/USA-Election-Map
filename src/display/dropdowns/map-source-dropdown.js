function createMapSourceDropdownItems()
{
  $("#mapSourcesDropdownContainer").html("")
  for (let sourceNum in mapSourceIDs)
  {
    $("#mapSourcesDropdownContainer").append("<div class='dropdown-separator'></div>")

    const mapSourceID = mapSourceIDs[sourceNum]
    const mapSourceIDNoSpace = mapSourceID.replace(/\s/g, '')
    const mapSourceName = mapSources[mapSourceID].getName()
    const mapSourceIcon = mapSources[mapSourceID].getIconURL(true) ?? "./assets/edit-icon.png"
    const mapCycleYear = mapSources[mapSourceID].getCycleYear()
    
    if (currentMapType.getCurrentMapCycle() == allYearsCycle && (sourceNum == 0 || mapSources[mapSourceIDs[parseInt(sourceNum)-1]].getCycleYear() != mapCycleYear))
    {
      if (sourceNum > 0)
      {
        $("#mapSourcesDropdownContainer").append("<div class='dropdown-separator-big'></div>")
      }
      
      if (mapCycleYear != allYearsCycle)
      {
        $("#mapSourcesDropdownContainer").append(`<a style='display: flex; align-items: center; padding-top: 0; padding-bottom: 0; height: 29px;'><span>${mapCycleYear} Election</span></a>`)
        $("#mapSourcesDropdownContainer").append("<div class='dropdown-separator'></div>")
      }
    }

    let divStringToAppend = ""
    divStringToAppend += "<a id='" + mapSourceIDNoSpace + "' style='display: flex; justify-content: space-between; align-items: center;' onclick='updateMapSource(\"" + mapSourceID + "\", \"#sourceToggleButton\")'>" + "<span style='display: flex; align-items: center'>"
    divStringToAppend += "<img style='width: 19px; height: 19px' src='" + mapSourceIcon + "' />" + "<span style='margin-left: 8px'>" + mapSourceName + "</span></span>"
    divStringToAppend += "<span style='display: flex; align-items: center'>"

    if (!mapSources[mapSourceID].isCustom())
    {
      divStringToAppend += "<img id='" + mapSourceIDNoSpace + "-icon' data-mapsource='" + mapSourceID + "' class='status' src='./assets/icon-download-none.png' style='width: 23px; height: 23px;'/>"
    }
    else
    {
      divStringToAppend += "<img id='" + mapSourceIDNoSpace + "-download-icon' class='status' src='./assets/icon-download.png' style='width: 23px; height: 23px; margin-right: 6px;' />"
      divStringToAppend += "<img id='" + mapSourceIDNoSpace + "-upload-icon' class='status' src='./assets/icon-upload.png' style='width: 23px; height: 23px;' />"
    }

    divStringToAppend += "</span>"
    divStringToAppend += "</a>"

    $("#mapSourcesDropdownContainer").append(divStringToAppend)

    if (!mapSources[mapSourceID].isCustom())
    {
      $("#" + mapSourceIDNoSpace + "-icon")[0].addEventListener('click', function() {
        let mapSource = $(this).data("mapsource")
        let mapSourceNoSpace = mapSource.replace(/\s/g, '')
        downloadDataForMapSource(mapSource, getIconDivsToUpdateArrayForSourceID(mapSource), mapSourceNoSpace, true, true).then(() => {
          updateMapSource(mapSource, "#sourceToggleButton")
        })
      })
    }
    else
    {
      var customMapSourceID = mapSourceID
      $("#" + mapSourceIDNoSpace + "-download-icon")[0].addEventListener('click', function(e) {
        ignoreMapUpdateClickArray.push(customMapSourceID)
        downloadMapFile(currentMapSource, e.altKey ? kCSVFileType : kJSONFileType)
      })
      $("#" + mapSourceIDNoSpace + "-upload-icon")[0].addEventListener('click', function() {
        ignoreMapUpdateClickArray.push(customMapSourceID)
        $("#uploadFileInput").click()
      })
    }
  }
}

function toggleMapSource(buttonDiv)
{
  var mapSourceArrayIndex = mapSourceIDs.indexOf(currentMapSource.getID())
  mapSourceArrayIndex++
  if (mapSourceArrayIndex > mapSourceIDs.length-1)
  {
    mapSourceArrayIndex = 0
  }

  updateMapSource(mapSourceIDs[mapSourceArrayIndex], buttonDiv)
}

function updateMapSource(sourceID, _, forceDownload)
{
  if (ignoreMapUpdateClickArray.includes(sourceID.replace(/\s/g, '')))
  {
    ignoreMapUpdateClickArray.splice(ignoreMapUpdateClickArray.indexOf(sourceID), 1)
    return
  }

  setMapSource(mapSources[sourceID], false, forceDownload)
}

function getIconDivsToUpdateArrayForSourceID(mapSourceID)
{
  var iconDivID = mapSourceID.replace(/\s/g, '') + "-icon"

  var iconDivDictionary = {}
  iconDivDictionary[iconDivID] = {loading: "./assets/icon-loading.png", error: "./assets/icon-download-none.png", success: "./assets/icon-download-complete.png"}

  return iconDivDictionary
}

async function updateIconsBasedOnLocalCSVData()
{
  for (var sourceIDNum in mapSourceIDs)
  {
    var divsToUpdateStatus = getIconDivsToUpdateArrayForSourceID(mapSourceIDs[sourceIDNum])
    var csvIsStored = await CSVDatabase.hasFile(mapSourceIDs[sourceIDNum])
    if (csvIsStored)
    {
      for (let divID in divsToUpdateStatus)
      {
        setStatusImage(divID, divsToUpdateStatus[divID].success)
      }
    }
    else
    {
      for (let divID in divsToUpdateStatus)
      {
        setStatusImage(divID, divsToUpdateStatus[divID].error)
      }
    }
  }
}

function setStatusImage(divID, icon)
{
  $("#" + divID).attr('src', icon)
}

async function downloadDataForMapSource(mapSourceID, divsToUpdateStatus, mapIDToIgnore, forceDownload, refreshMap, onlyAttemptLocalFetch, resetCandidateNames)
{
  if (mapIDToIgnore != null)
  {
    ignoreMapUpdateClickArray.push(mapIDToIgnore)
  }

  for (let divID in divsToUpdateStatus)
  {
    setStatusImage(divID, divsToUpdateStatus[divID].loading)
  }

  var loadedSuccessfully = await mapSources[mapSourceID].loadMap(forceDownload, onlyAttemptLocalFetch, resetCandidateNames)

  if (!loadedSuccessfully)
  {
    for (let divID in divsToUpdateStatus)
    {
      setStatusImage(divID, divsToUpdateStatus[divID].error)
    }
    return false
  }
  else
  {
    for (let divID in divsToUpdateStatus)
    {
      setStatusImage(divID, divsToUpdateStatus[divID].success)
    }

    if (refreshMap && currentMapSource.getID() == mapSourceID)
    {
      setDataMapDateSliderRange()
      await displayDataMap()
      $("#dataMapDateSliderContainer").show()
      $("#dateDisplay").show()
    }
    return true
  }
}

async function downloadAllMapData()
{
  for (var sourceIDNum in mapSourceIDs)
  {
    var iconDivDictionary = getIconDivsToUpdateArrayForSourceID(mapSourceIDs[sourceIDNum])
    downloadDataForMapSource(mapSourceIDs[sourceIDNum], iconDivDictionary, null, true).then(function(loadedSuccessfully) {
      if (showingDataMap && mapSourceIDs[sourceIDNum] == currentMapSource.getID() && loadedSuccessfully)
      {
        loadDataMap(true)
      }
    })
  }
}
