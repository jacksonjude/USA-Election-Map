var compareMapQueue = []
var isRunningCompareMapQueue = false

var currentCompareSliderDate

var showingCompareMap
var compareMapSourceIDArray
var compareMapDataArray
var selectedCompareSlider

function initializeCompareVariables()
{
  showingCompareMap = false
  currentCompareSliderDate = null
  compareMapSourceIDArray = [null, null]
  compareMapDataArray = [null, null]
  selectedCompareSlider = null
}

function createComparePresetDropdownItems()
{
  $("#comparePresetsDropdownContainer").html("")
  for (var comparePresetNum in currentMapType.getDefaultCompareSourceIDs())
  {
    var compareIDPair = currentMapType.getDefaultCompareSourceIDs()[comparePresetNum]

    $("#comparePresetsDropdownContainer").append("<div class='dropdown-separator'></div>")
    $("#comparePresetsDropdownContainer").append("<a style='' onclick='loadComparePreset(\"" + comparePresetNum + "\")'>(" + comparePresetNum + ")&nbsp;&nbsp;" + mapSources[compareIDPair[0]].getName() + " vs " + mapSources[compareIDPair[1]].getName() + "</a>")
  }
}

function swapCompareMapSources()
{
  var tempSourceID = compareMapSourceIDArray[0]
  compareMapSourceIDArray[0] = compareMapSourceIDArray[1]
  compareMapSourceIDArray[1] = tempSourceID
}

async function loadCompareItemMapSource(compareItemNum)
{
  await setMapSource(mapSources[compareMapSourceIDArray[compareItemNum]])

  var dateIndexToSet
  switch (compareItemNum)
  {
    case 0:
    dateIndexToSet = $("#firstCompareDataMapDateSlider")[0].value
    break

    case 1:
    dateIndexToSet = $("#secondCompareDataMapDateSlider")[0].value
    break
  }

  $("#dataMapDateSlider").val(dateIndexToSet)
  await displayDataMap(dateIndexToSet)
  updateCompareMapSlidersVisibility(false)
}

async function loadComparePreset(comparePresetNum)
{
  var defaultCompareSourceIDs = currentMapType.getDefaultCompareSourceIDs()

  await toggleCompareMapSourceCheckbox(defaultCompareSourceIDs[comparePresetNum][0], true)
  await toggleCompareMapSourceCheckbox(defaultCompareSourceIDs[comparePresetNum][1], true)

  var latestSliderTickEnabled = currentMapType.getMapSettingValue("latestTick")

  if (defaultCompareSourceIDs[comparePresetNum][0] == defaultCompareSourceIDs[comparePresetNum][1])
  {
    $("#secondCompareDataMapDateSlider").val(mapSources[compareMapSourceIDArray[1]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0)-1-(latestSliderTickEnabled ? 1 : 0))
    setCompareSourceDate(1, mapSources[compareMapSourceIDArray[1]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0)-1-(latestSliderTickEnabled ? 1 : 0))
  }
}

const CompareSortMode = {
  voteshare: 0,
  shiftMargin: 1
}

var compareSortMode = CompareSortMode.voteshare

function toggleCompareSortMode(div)
{
  switch (compareSortMode)
  {
    case CompareSortMode.voteshare:
    compareSortMode = CompareSortMode.shiftMargin
    div.innerHTML = "Sort by shift"
    break

    case CompareSortMode.shiftMargin:
    compareSortMode = CompareSortMode.voteshare
    div.innerHTML = "Sort by voteshare"
    break
  }
}

async function addCompareMapSource(mapSourceID, clickDivIDToIgnore)
{
  if (clickDivIDToIgnore != null)
  {
    ignoreMapUpdateClickArray.push(clickDivIDToIgnore)
  }

  var checkboxID = mapSourceID.replace(/\s/g, '') + "-compare"
  var checkboxChecked = $("#" + checkboxID).prop('checked')

  var compareSourcesUpdated
  var mapSourceToUncheck
  if (checkboxChecked && compareMapSourceIDArray[0] == null && compareMapSourceIDArray[1] == null)
  {
    compareSourcesUpdated = [true, true]
    compareMapSourceIDArray[0] = mapSourceID
    compareMapSourceIDArray[1] = mapSourceID
  }
  else if (checkboxChecked && compareMapSourceIDArray[0] == compareMapSourceIDArray[1])
  {
    compareSourcesUpdated = [false, true]
    compareMapSourceIDArray[1] = mapSourceID
  }
  else if (checkboxChecked)
  {
    compareSourcesUpdated = [true, true]
    mapSourceToUncheck = shouldSwapCompareMapSources(compareMapSourceIDArray[0], compareMapSourceIDArray[1]) ? compareMapSourceIDArray[0] : compareMapSourceIDArray[1]
    compareMapSourceIDArray[0] = compareMapSourceIDArray[0] == mapSourceToUncheck ? mapSourceID : compareMapSourceIDArray[0]
    compareMapSourceIDArray[1] = compareMapSourceIDArray[1] == mapSourceToUncheck ? mapSourceID : compareMapSourceIDArray[1]
  }
  else if (!checkboxChecked && compareMapSourceIDArray[0] != compareMapSourceIDArray[1])
  {
    if (compareMapSourceIDArray[0] == mapSourceID)
    {
      compareSourcesUpdated = [true, false]
      compareMapSourceIDArray[0] = compareMapSourceIDArray[1]
    }
    else if (compareMapSourceIDArray[1] == mapSourceID)
    {
      compareSourcesUpdated = [false, true]
      compareMapSourceIDArray[1] = compareMapSourceIDArray[0]
    }
  }
  else if (!checkboxChecked && compareMapSourceIDArray[0] == compareMapSourceIDArray[1])
  {
    clearMap()
    return
  }

  if (mapSourceToUncheck)
  {
    $("#" + mapSourceToUncheck.replace(/\s/g, '') + "-compare").prop('checked', false)
  }

  await updateCompareMapSources(compareSourcesUpdated, false)

  showingCompareMap = true
  toggleMapSettingDisable("seatArrangement", true)
  updateCompareMapSlidersVisibility()
}

async function updateCompareMapSources(compareSourcesToUpdate, overrideSwapSources, swapSliderValues)
{
  $('.comparesourcecheckbox').prop('disabled', true)
  if (compareSourcesToUpdate[0])
  {
    await loadCompareMapSource(compareMapSourceIDArray[0])
  }
  if (compareSourcesToUpdate[1] && compareMapSourceIDArray[1] != compareMapSourceIDArray[0])
  {
    await loadCompareMapSource(compareMapSourceIDArray[1])
  }
  $('.comparesourcecheckbox').prop('disabled', false)

  if (shouldSwapCompareMapSources(compareMapSourceIDArray[0], compareMapSourceIDArray[1]) && !overrideSwapSources)
  {
    swapCompareMapSources()
    compareSourcesToUpdate = [true, true]
  }

  var overrideDateValues = [null, null]
  if (swapSliderValues)
  {
    overrideDateValues[0] = $("#secondCompareDataMapDateSlider").val()
    overrideDateValues[1] = $("#firstCompareDataMapDateSlider").val()
  }

  var latestSliderTickEnabled = currentMapType.getMapSettingValue("latestTick")

  if (compareSourcesToUpdate[0])
  {
    setDataMapDateSliderRange(true, "firstCompareDataMapDateSlider", "firstCompareDataMapSliderStepList", mapSources[compareMapSourceIDArray[0]].getMapDates())
    $("#firstCompareDataMapDateSlider").val(overrideDateValues[0] || mapSources[compareMapSourceIDArray[0]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0))
    setCompareSourceDate(0, overrideDateValues[0] || mapSources[compareMapSourceIDArray[0]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0), !compareSourcesToUpdate[1])
    $("#compareItemImage-0").css('display', "block")
    $("#compareItemImage-0").prop('src', mapSources[compareMapSourceIDArray[0]].getIconURL())
  }
  if (compareSourcesToUpdate[1])
  {
    setDataMapDateSliderRange(true, "secondCompareDataMapDateSlider", "secondCompareDataMapSliderStepList", mapSources[compareMapSourceIDArray[1]].getMapDates())
    $("#secondCompareDataMapDateSlider").val(overrideDateValues[1] || mapSources[compareMapSourceIDArray[1]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0))
    setCompareSourceDate(1, overrideDateValues[1] || mapSources[compareMapSourceIDArray[1]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0))
    $("#compareItemImage-1").css('display', "block")
    $("#compareItemImage-1").prop('src', mapSources[compareMapSourceIDArray[1]].getIconURL())
  }
}

async function loadCompareMapSource(sourceID)
{
  await downloadDataForMapSource(sourceID, getIconDivsToUpdateArrayForSourceID(sourceID))

  // let mapSource = mapSources[sourceID]
  // let voteshareCutoff = mapSource.voteshareCutoffMargin
  // mapSource.voteshareCutoffMargin = null
  // await mapSource.loadMap()
  // mapSource.voteshareCutoffMargin = voteshareCutoff
}

function shouldSwapCompareMapSources(firstMapSourceID, secondMapSourceID)
{
  return mapSources[firstMapSourceID].getMapDates().slice(-1)[0] < mapSources[secondMapSourceID].getMapDates().slice(-1)[0]
}

function updateCompareMapSlidersVisibility(overrideShowHide)
{
  var showCompareSliders = overrideShowHide
  if (showCompareSliders == null)
  {
    showCompareSliders = showingCompareMap
  }

  if (showCompareSliders)
  {
    $("#firstCompareSliderDateDisplayContainer").css('display', 'flex')
    $("#secondCompareSliderDateDisplayContainer").css('display', 'flex')

    $("#sliderDateDisplayContainer").hide()
  }
  else
  {
    $("#firstCompareSliderDateDisplayContainer").hide()
    $("#secondCompareSliderDateDisplayContainer").hide()

    $("#sliderDateDisplayContainer").css('display', 'flex')
  }

  if (showingCompareMap)
  {
    $("#compareButton").addClass('active')
    $("#compareArrayDropdownContainer").show()
    $("#comparePresetsDropdownContainer").hide()
  }
  else
  {
    $("#compareButton").removeClass('active')
    $("#comparePresetsDropdownContainer").show()
    $("#compareArrayDropdownContainer").hide()
  }
}

function setMapCompareItem(compareArrayIndex)
{
  if (!showingDataMap) { return }
  compareMapDataArray[compareArrayIndex] = cloneObject(displayRegionDataArray)
  $("#compareItem-" + compareArrayIndex).html(currentMapSource.getName() + " : " + getDateString(currentSliderDate))
}

function addToCompareMapQueue(compareArrayIndex, dateIndex, shouldApply = true)
{
  compareMapQueue.unshift([compareArrayIndex, dateIndex, shouldApply])
  executeCompareMapQueue()
}

async function executeCompareMapQueue()
{
  if (isRunningCompareMapQueue) { return }

  isRunningCompareMapQueue = true

  while (compareMapQueue.length > 0)
  {
    await setCompareSourceDate(...compareMapQueue[0])
    compareMapQueue.splice(-1, 1)
  }

  isRunningCompareMapQueue = false
}

async function setCompareSourceDate(compareArrayIndex, dateIndex, shouldApply = true)
{
  var mapDates = mapSources[compareMapSourceIDArray[compareArrayIndex]].getMapDates()

  var dateToDisplay
  var overrideDateString
  if (dateIndex-1 > mapDates.length-1)
  {
    dateToDisplay = new Date(mapDates[dateIndex-1-1])
    overrideDateString = "Latest (" + getDateString(dateToDisplay, "/", false, true) + ")"
    // overrideDateString = "Latest (" + (zeroPadding(dateToDisplay.getMonth()+1)) + "/" + zeroPadding(dateToDisplay.getDate()) + "/" + dateToDisplay.getFullYear() + ")"
  }
  else
  {
    dateToDisplay = new Date(mapDates[dateIndex-1])
  }
  updateSliderDateDisplay(dateToDisplay, overrideDateString, compareArrayIndex == 0 ? "firstCompareDateDisplay" : "secondCompareDateDisplay")

  $("#compareItem-" + compareArrayIndex).html(mapSources[compareMapSourceIDArray[compareArrayIndex]].getName() + " (" + getDateString(dateToDisplay) + ")")

  compareMapDataArray[compareArrayIndex] = mapSources[compareMapSourceIDArray[compareArrayIndex]].getMapData()[dateToDisplay.getTime()]

  if (compareArrayIndex == 0)
  {
    currentCustomMapSource.setCandidateNames(mapSources[compareMapSourceIDArray[compareArrayIndex]].getCandidateNames(dateToDisplay.getTime()), dateToDisplay.getTime())
    currentCompareSliderDate = dateToDisplay
  }

  shouldApply && await applyCompareToCustomMap()
}

async function applyCompareToCustomMap()
{
  if (compareMapDataArray.length < 2 || compareMapDataArray[0] == null || compareMapDataArray[1] == null) { return }

  let voteshareCutoffMargin0 = mapSources[compareMapSourceIDArray[0]].voteshareCutoffMargin
  let voteshareCutoffMargin1 = mapSources[compareMapSourceIDArray[1]].voteshareCutoffMargin

  var resultMapArray = {}
  for (var regionID in compareMapDataArray[0])
  {
    var compareRegionData0 = compareMapDataArray[0][regionID]
    var compareRegionData1 = compareMapDataArray[1][regionID]

    if (currentMapType.getMapSettings().seatArrangement == "election-type" && compareRegionData0.seatClass != compareRegionData1.seatClass)
    {
      if (regionID.endsWith("-S"))
      {
        compareRegionData1 = compareMapDataArray[1][regionID.replace("-S", "")]
      }
      else
      {
        compareRegionData1 = compareMapDataArray[1][regionID + "-S"]
      }
    }

    if (compareRegionData0 && compareRegionData0.partyID == TossupParty.getID())
    {
      resultMapArray[regionID] = cloneObject(compareRegionData0)
    }
    else if (!compareRegionData0 || !compareRegionData1 || compareRegionData0.disabled == true || compareRegionData1.disabled == true)
    {
      resultMapArray[regionID] = cloneObject(compareRegionData0)
      resultMapArray[regionID].disabled = true
      resultMapArray[regionID].margin = 101
    }
    else
    {
      resultMapArray[regionID] = {}

      if (compareRegionData0.partyID == compareRegionData1.partyID)
      {
        resultMapArray[regionID].margin = compareRegionData0.margin-compareRegionData1.margin
      }
      else
      {
        resultMapArray[regionID].margin = compareRegionData0.margin+compareRegionData1.margin
      }

      if (resultMapArray[regionID].margin < 0)
      {
        var sortedVoteshareArray = compareRegionData0.partyVotesharePercentages.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
        resultMapArray[regionID].partyID = sortedVoteshareArray.length >= 2 ? sortedVoteshareArray[1].partyID : TossupParty.getID()
        resultMapArray[regionID].margin = Math.abs(resultMapArray[regionID].margin)
      }
      else
      {
        resultMapArray[regionID].partyID = compareRegionData0.partyID
      }

      if (compareRegionData0.seatClass)
      {
        resultMapArray[regionID].seatClass = compareRegionData0.seatClass
      }

      if (compareRegionData0.partyVotesharePercentages && compareRegionData1.partyVotesharePercentages)
      {
        compareRegionData0.partyVotesharePercentages.sort((candidateData0, candidateData1) => candidateData0.voteshare-candidateData1.voteshare)
        compareRegionData1.partyVotesharePercentages.sort((candidateData0, candidateData1) => candidateData0.voteshare-candidateData1.voteshare)

        let partiesChecked = new Set()
        let partiesToRemove = new Set([IndependentGenericParty.getID()])
        let candidatesToKeep = new Set()
        for (let candidateData0 of compareRegionData0.partyVotesharePercentages)
        {
          let candidateData1 = compareRegionData1.partyVotesharePercentages.find(candidateData => candidateData.partyID == candidateData0.partyID)
          if (candidateData0.voteshare < voteshareCutoffMargin0 && (!candidateData1 || candidateData1.voteshare < voteshareCutoffMargin1))
          {
            partiesToRemove.add(candidateData0.partyID)
          }
          else if (partiesToRemove.has(candidateData0.partyID))
          {
            candidatesToKeep.add(candidateData0.candidate)
          }
          partiesChecked.add(candidateData0.partyID)
        }
        for (let candidateData1 of compareRegionData1.partyVotesharePercentages)
        {
          if (partiesChecked.has(candidateData1.partyID)) { continue }
          let candidateData0 = compareRegionData0.partyVotesharePercentages.find(candidateData => candidateData.partyID == candidateData1.partyID)
          if (candidateData1.voteshare < voteshareCutoffMargin1 && (!candidateData0 || candidateData0.voteshare < voteshareCutoffMargin0))
          {
            partiesToRemove.add(candidateData1.partyID)
          }
          else if (partiesToRemove.has(candidateData1.partyID))
          {
            candidatesToKeep.add(candidateData1.candidate)
          }
        }
        let filteredVoteshares0 = compareRegionData0.partyVotesharePercentages.filter(candidateData => !partiesToRemove.has(candidateData.partyID) || candidatesToKeep.has(candidateData.candidate)).sort((candidateData1, candidateData2) => candidateData2.voteshare-candidateData1.voteshare)
        let filteredVoteshares1 = compareRegionData1.partyVotesharePercentages.filter(candidateData => !partiesToRemove.has(candidateData.partyID) || candidatesToKeep.has(candidateData.candidate)).sort((candidateData1, candidateData2) => candidateData2.voteshare-candidateData1.voteshare)

        let candidateOn = 0

        resultMapArray[regionID].partyVotesharePercentages = filteredVoteshares0.map(candidateData => {
          let differenceCandidateData = cloneObject(candidateData)
          let previousCandidateData = filteredVoteshares1.find(candidateData => candidateData.partyID == differenceCandidateData.partyID)
          differenceCandidateData.voteshare = previousCandidateData ? differenceCandidateData.voteshare-previousCandidateData.voteshare : differenceCandidateData.voteshare

          differenceCandidateData.order = candidateOn
          candidateOn += 1

          return differenceCandidateData
        })

        resultMapArray[regionID].partyVotesharePercentages = resultMapArray[regionID].partyVotesharePercentages.concat(filteredVoteshares1.filter(candidateData => {
          return resultMapArray[regionID].partyVotesharePercentages.every(existingCandidateData => existingCandidateData.partyID != candidateData.partyID)
        }).map(candidateData => {
          let newCandidateData = {...candidateData, voteshare: -candidateData.voteshare, order: candidateOn}
          candidateOn += 1
          return newCandidateData
        }))

        if (compareSortMode == CompareSortMode.shiftMargin)
        {
          resultMapArray[regionID].partyVotesharePercentages = resultMapArray[regionID].partyVotesharePercentages.sort((cand1, cand2) => cand2.voteshare-cand1.voteshare)
          for (let candidateOn in resultMapArray[regionID].partyVotesharePercentages)
          {
            let candidateData = resultMapArray[regionID].partyVotesharePercentages[candidateOn]
            candidateData.order = candidateOn == 0 ? 0 : candidateOn+1
          }
        }
      }
    }
  }

  currentCustomMapSource.updateMapData(resultMapArray, (new Date(getTodayString("/", false, "mdy"))).getTime(), true, null, EditingMode.voteshare)

  await setMapSource(currentCustomMapSource)
}
