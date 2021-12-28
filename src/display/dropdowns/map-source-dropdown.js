function createMapSourceDropdownItems()
{
  $("#mapSourcesDropdownContainer").html("")
  for (var sourceNum in mapSourceIDs)
  {
    $("#mapSourcesDropdownContainer").append("<div class='dropdown-separator'></div>")

    var mapSourceID = mapSourceIDs[sourceNum]
    var mapSourceIDNoSpace = mapSourceID.replace(/\s/g, '')
    var mapSourceName = mapSources[mapSourceID].getName()

    var divStringToAppend = ""

    if (mapSourceID != currentCustomMapSource.getID())
    {
      divStringToAppend += "<a id='" + mapSourceIDNoSpace + "' onclick='updateMapSource(\"" + mapSourceID + "\", \"#sourceToggleButton\")'>" + "(" + (parseInt(sourceNum)+1) + ")" + "&nbsp;&nbsp;" + mapSourceName
      divStringToAppend += "<span id='" + mapSourceIDNoSpace + "-icon' style='float: right;' onclick='downloadDataForMapSource(\"" + mapSourceID + "\", {\"" + mapSourceIDNoSpace + "-icon\":{loading: \"./assets/icon-loading.png\", error: \"./assets/icon-download-none.png\", success: \"./assets/icon-download-complete.png\", top: -1, width: 24, height: 24}}, \"" + mapSourceIDNoSpace + "\", true, true)'>"
      divStringToAppend += "<img class='status' src='./assets/icon-download-none.png' style='position: relative; top: -1px; width: 24px; height: 24px;' />"
      divStringToAppend += "</span>"
      divStringToAppend += "<input class='comparesourcecheckbox' type='checkbox' id='" + mapSourceIDNoSpace + "-compare' onclick='addCompareMapSource(\"" + mapSourceID + "\", \"" + mapSourceIDNoSpace + "\")' style='position: relative; top: -2px; right: -4px; float: right; width: 20px; height: 20px;' />"
      divStringToAppend += "</a>"
    }
    else
    {
      divStringToAppend += "<a id='" + mapSourceIDNoSpace + "' onclick='updateMapSource(\"" + mapSourceID + "\", \"#sourceToggleButton\")'>" + "(" + (parseInt(sourceNum)+1) + ")" + "&nbsp;&nbsp;" + mapSourceName

      divStringToAppend += "<span id='" + mapSourceIDNoSpace + "-download-icon' style='float:right;'>"
      divStringToAppend += "<img class='status' src='./assets/icon-download.png' style='position: relative; top: -1px; width: 24px; height: 24px;' />"
      divStringToAppend += "</span>"

      divStringToAppend += "<span id='" + mapSourceIDNoSpace + "-upload-icon' style='float:right;' onclick='ignoreMapUpdateClickArray.push(\"" + mapSourceID + "\"); $(\"#uploadFileInput\").click()'>"
      divStringToAppend += "<img class='status' src='./assets/icon-upload.png' style='position: relative; top: -1px; width: 24px; height: 24px; margin-right: 6px' />"
      divStringToAppend += "</span>"

      divStringToAppend += "</a>"
    }

    $("#mapSourcesDropdownContainer").append(divStringToAppend)

    if (mapSources[mapSourceID].isCustom())
    {
      var customMapSourceID = mapSourceID
      $("#" + mapSourceIDNoSpace + "-download-icon")[0].addEventListener('click', function(e) {
        ignoreMapUpdateClickArray.push(customMapSourceID)
        downloadMapFile(currentMapSource, e.altKey ? kCSVFileType : kJSONFileType)
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

  currentMapSource = mapSources[sourceID]

  updateNavBarForNewSource()
  loadDataMap(false, forceDownload)
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
  iconDivDictionary[iconDivID] = {loading: "./assets/icon-loading.png", error: "./assets/icon-download-none.png", success: "./assets/icon-download-complete.png", top: -1, width: 24, height: 24}

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
        removeStatusImage(divID)
        insertStatusImage(divID, divsToUpdateStatus[divID].success, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
      }
    }
    else
    {
      for (let divID in divsToUpdateStatus)
      {
        removeStatusImage(divID)
        insertStatusImage(divID, divsToUpdateStatus[divID].error, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
      }
    }
  }
}

function insertStatusImage(divID, icon, width, height, top)
{
  $("#" + divID).html($("#" + divID).html() + ('<span class="status">&nbsp;&nbsp;&nbsp;<img src="' + icon + '" style="position: relative; top: ' + (top || 2) + 'px; width: ' + (width || 16) + 'px; height: ' + (height || 16) + 'px;" /></span>'))
}

function removeStatusImage(divID)
{
  $("#" + divID + " .status").remove()
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
      removeStatusImage(divID)
    }

    for (let divID in divsToUpdateStatus)
    {
      insertStatusImage(divID, divsToUpdateStatus[divID].loading, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
    }

    var loadedSuccessfully = await mapSources[mapSourceID].loadMap(forceDownload, onlyAttemptLocalFetch, resetCandidateNames)
    for (let divID in divsToUpdateStatus)
    {
      removeStatusImage(divID)
    }

    if (!loadedSuccessfully)
    {
      for (let divID in divsToUpdateStatus)
      {
        insertStatusImage(divID, divsToUpdateStatus[divID].error, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
      }
      resolve(false)
    }
    else
    {
      for (let divID in divsToUpdateStatus)
      {
        insertStatusImage(divID, divsToUpdateStatus[divID].success, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
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
  var sourcesLoaded = 0
  for (var sourceIDNum in mapSourceIDs)
  {
    var iconDivDictionary = getIconDivsToUpdateArrayForSourceID(mapSourceIDs[sourceIDNum])
    downloadDataForMapSource(mapSourceIDs[sourceIDNum], iconDivDictionary, null, true).then(function(loadedSuccessfully) {
      if (showingDataMap && mapSourceIDs[sourceIDNum] == currentMapSource.getID() && loadedSuccessfully)
      {
        loadDataMap(true)
      }

      sourcesLoaded += 1
      if (sourcesLoaded < mapSourceIDs.length)
      {
        $("#loader").show()
      }
    })
  }
}
