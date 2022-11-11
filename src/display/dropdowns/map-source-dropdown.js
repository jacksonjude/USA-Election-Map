function createMapSourceDropdownItems()
{
  $("#mapSourcesDropdownContainer").html("")
  for (var sourceNum in mapSourceIDs)
  {
    $("#mapSourcesDropdownContainer").append("<div class='dropdown-separator'></div>")

    var mapSourceID = mapSourceIDs[sourceNum]
    var mapSourceIDNoSpace = mapSourceID.replace(/\s/g, '')
    var mapSourceName = mapSources[mapSourceID].getName()
    var mapSourceIcon = mapSources[mapSourceID].getIconURL(true) ?? "./assets/edit-icon.png"

    var divStringToAppend = ""
    divStringToAppend += "<a id='" + mapSourceIDNoSpace + "' style='display: flex; justify-content: space-between; align-items: center' onclick='updateMapSource(\"" + mapSourceID + "\", \"#sourceToggleButton\")'>" + "<span style='display: flex; align-items: center'>"
    divStringToAppend += "<img style='width: 20rem; height: 20rem' src='" + mapSourceIcon + "' />" + "<span style='margin-left: 8rem'>" + mapSourceName + "</span></span>"
    divStringToAppend += "<span style='display: flex; align-items: center'>"

    if (mapSourceID != currentCustomMapSource.getID())
    {
      divStringToAppend += "<input class='comparesourcecheckbox' type='checkbox' id='" + mapSourceIDNoSpace + "-compare' data-mapsource='" + mapSourceID + "' style='width: 20rem; height: 20rem; margin: 0 8rem 0 0' />"
      divStringToAppend += "<img id='" + mapSourceIDNoSpace + "-icon' data-mapsource='" + mapSourceID + "' class='status' src='./assets/icon-download-none.png' style='width: 24rem; height: 24rem;'/>"
    }
    else
    {
      divStringToAppend += "<img id='" + mapSourceIDNoSpace + "-download-icon' class='status' src='./assets/icon-download.png' style='width: 24rem; height: 24rem; margin-right: 6rem;' />"
      divStringToAppend += "<img id='" + mapSourceIDNoSpace + "-upload-icon' class='status' src='./assets/icon-upload.png' style='width: 24rem; height: 24rem;' />"
    }

    divStringToAppend += "</span>"
    divStringToAppend += "</a>"

    $("#mapSourcesDropdownContainer").append(divStringToAppend)

    if (!mapSources[mapSourceID].isCustom())
    {
      $("#" + mapSourceIDNoSpace + "-icon")[0].addEventListener('click', function() {
        let mapSource = $(this).data("mapsource")
        let mapSourceNoSpace = mapSource.replace(/\s/g, '')
        downloadDataForMapSource(mapSource, getIconDivsToUpdateArrayForSourceID(mapSource), mapSourceNoSpace, true, true)
      })
      $("#" + mapSourceIDNoSpace + "-compare")[0].addEventListener('click', function() {
        let mapSource = $(this).data("mapsource")
        let mapSourceNoSpace = mapSource.replace(/\s/g, '')
        addCompareMapSource(mapSource, mapSourceNoSpace)
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

async function toggleCompareMapSourceCheckbox(mapSourceID, overrideAdd)
{
  var checkboxID = mapSourceID.replace(/\s/g, '') + '-compare'
  if (!$('#' + checkboxID).prop('disabled') || overrideAdd)
  {
    $('#' + checkboxID).prop('checked', !$('#' + checkboxID).prop('checked') || overrideAdd)
    await addCompareMapSource(mapSourceID)
  }
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

function downloadDataForMapSource(mapSourceID, divsToUpdateStatus, mapIDToIgnore, forceDownload, refreshMap, onlyAttemptLocalFetch, resetCandidateNames)
{
  if (mapIDToIgnore != null)
  {
    ignoreMapUpdateClickArray.push(mapIDToIgnore)
  }
  var downloadDataPromise = new Promise(async (resolve) => {
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
      resolve(false)
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
      resolve(true)
    }
  })

  return downloadDataPromise
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
