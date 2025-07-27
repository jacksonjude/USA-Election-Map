var compareMapQueue = []
var isRunningCompareMapQueue = false

var currentCompareSliderDate

var showingCompareMap
var compareMapSourceIDArray
var compareMapDataArray
var selectedCompareSlider

var showingCustomCompare
var customCompareSourceToSet

var shouldCombineMinorThirdParties = true
var getCompareMajorParties

var compareResultCustomMapSource
var shouldSetCompareMapSource

function resetCompareVariables()
{
  showingCompareMap = false
  currentCompareSliderDate = null
  compareMapSourceIDArray = [null, null]
  compareMapDataArray = [null, null]
  selectedCompareSlider = null
  
  getCompareMajorParties = null
  compareResultCustomMapSource = null
  shouldSetCompareMapSource = true
  
  showingCustomCompare = false
  customCompareSourceToSet = 0
}

function createComparePresetDropdownItems()
{
  $("#comparePresetsDropdownContainer").html("")
  for (var comparePresetNum in currentMapType.getDefaultCompareSourceIDs())
  {
    var compareIDPair = currentMapType.getDefaultCompareSourceIDs()[comparePresetNum]

    $("#comparePresetsDropdownContainer").append("<div class='dropdown-separator'></div>")
    $("#comparePresetsDropdownContainer").append("<a style='' onclick='loadComparePreset(\"" + comparePresetNum + "\")'><span style='margin-right: 8px'>" + getEmojiForComparePresetNum(comparePresetNum) + "</span>" + mapSources[compareIDPair[0]].getName() + " vs " + mapSources[compareIDPair[1]].getName() + "</a>")
  }
  
  $("#comparePresetsDropdownContainer").append("<div class='dropdown-separator'></div>")
  $("#comparePresetsDropdownContainer").append("<a style='' onclick='showCustomCompareSelection()'><span style='margin-right: 8px'>#️⃣</span>Other vs Other</a>")
}

function getEmojiForComparePresetNum(comparePresetNum)
{
  comparePresetNum = parseInt(comparePresetNum)
  switch (comparePresetNum)
  {
    case 1: return '1️⃣'
    case 2: return '2️⃣'
    case 3: return '3️⃣'
    case 4: return '4️⃣'
    case 5: return '5️⃣'
    case 6: return '6️⃣'
    case 7: return '7️⃣'
    case 8: return '8️⃣'
    case 9: return '9️⃣'
  }
}

function showCustomCompareSelection()
{
  showingCustomCompare = true
  $("#compareDropdownContent").css('display', "block")
  selectedDropdownDivID = "compareDropdownContent"
  
  for (let compareArrayIndex in compareMapSourceIDArray)
  {
    const mapSourceName = mapSources[compareMapSourceIDArray[compareArrayIndex]]?.getName()
    const mapSourceIcon = mapSources[compareMapSourceIDArray[compareArrayIndex]]?.getIconURL(true) ?? "./assets/edit-icon.png"
    
    $(`#compareCustomItem-${compareArrayIndex}`).html(mapSourceName ? `<img style='width: 19px; height: 19px' src='${mapSourceIcon}' /> ${mapSourceName} (Edit)` : "<span style='color: #888'>Select Map</span>")
  }
  
  $("#comparePresetsDropdownContainer").hide()
  $("#compareCustomDropdownContainer").show()
  $("#compareButton").addClass('active')
}

function listCustomCompareMapSources(sourceIndex)
{
  customCompareSourceToSet = sourceIndex
  
  $("#compareCustomListDropdownContainer").html("")
  
  for (let mapSourceID of mapSourceIDs)
  {
    $("#compareCustomListDropdownContainer").append("<div class='dropdown-separator'></div>")
    
    const mapSourceName = mapSources[mapSourceID].getName()
    const mapSourceIcon = mapSources[mapSourceID].getIconURL(true) ?? "./assets/edit-icon.png"
    
    let mapSourceDiv = "<a id='" + mapSourceID.replace(/\s/g, '') + "' onclick='selectCustomCompareMapSource(\"" + mapSourceID + "\")'>"
    mapSourceDiv += "<span style='display: flex; align-items: center'>"
    mapSourceDiv += "<img style='width: 19px; height: 19px' src='" + mapSourceIcon + "' />"
    mapSourceDiv += "<span style='margin-left: 8px'>" + mapSourceName + "</span>"
    mapSourceDiv += "<span style='flex-grow: 1'></span>"
    if (compareMapSourceIDArray.includes(mapSourceID)) mapSourceDiv += "<span>✅</span>"
    mapSourceDiv += "</span>"
    mapSourceDiv += "</a>"
    $("#compareCustomListDropdownContainer").append(mapSourceDiv)
  }
  
  $("#compareCustomDropdownContainer").hide()
  $("#compareCustomListDropdownContainer").show()
}

function selectCustomCompareMapSource(sourceID)
{
  compareMapSourceIDArray[customCompareSourceToSet] = sourceID
  $("#compareCustomListDropdownContainer").hide()
  showCustomCompareSelection()
}

async function hideCustomCompareSelection(shouldReset)
{
  $("#compareCustomDropdownContainer").hide()
  
  if (shouldReset)
  {
    resetCompareVariables()
    $("#compareButton").removeClass('active')
    $("#comparePresetsDropdownContainer").show()
  }
  else if (compareMapSourceIDArray[0] != null && compareMapSourceIDArray[1] != null)
  {
    showingCompareMap = true
    showingCustomCompare = false
    deselectDropdownButton()
    
    await updateCompareMapSources([true, true], false)
    
    toggleMapSettingDisable("seatArrangement", true)
    updateCompareMapSlidersVisibility()
    
    setCompareSliderDates()
  }
  else
  {
    $("#compareCustomDropdownContainer").show()
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
  
  await addCompareMapSource(defaultCompareSourceIDs[comparePresetNum][0])
  if (defaultCompareSourceIDs[comparePresetNum][0] != defaultCompareSourceIDs[comparePresetNum][1])
  {
    await addCompareMapSource(defaultCompareSourceIDs[comparePresetNum][1])
  }

  setCompareSliderDates()
}

function setCompareSliderDates()
{
  if (compareMapSourceIDArray[0] == compareMapSourceIDArray[1])
  {
    $("#secondCompareDataMapDateSlider").val(mapSources[compareMapSourceIDArray[1]].getMapDates().length-1)
    setCompareSourceDate(1, mapSources[compareMapSourceIDArray[1]].getMapDates().length-1)
  }
}

var compareSortMode = CompareSortMode.voteshare

function toggleCompareSortMode(div)
{
  const emojiPrefix = '<span style="margin-right: 8px;">🔼</span>'
  
  switch (compareSortMode)
  {
    case CompareSortMode.voteshare:
    compareSortMode = CompareSortMode.shiftMargin
    div.innerHTML = emojiPrefix + "Sort by: shift"
    break

    case CompareSortMode.shiftMargin:
    compareSortMode = CompareSortMode.voteshare
    div.innerHTML = emojiPrefix + "Sort by: voteshare"
    break
  }
}

async function addCompareMapSource(mapSourceID, clickDivIDToIgnore)
{
  if (clickDivIDToIgnore != null)
  {
    ignoreMapUpdateClickArray.push(clickDivIDToIgnore)
  }
  
  if (currentViewingState == ViewingState.zooming && showingCompareMap && currentMapSource.isCompare() && !mapSources[mapSourceID].zoomingDataFunction)
  {
    await zoomOutMap()
  }

  var compareSourcesUpdated
  if (compareMapSourceIDArray[0] == null && compareMapSourceIDArray[1] == null)
  {
    compareSourcesUpdated = [true, true]
    compareMapSourceIDArray[0] = mapSourceID
    compareMapSourceIDArray[1] = mapSourceID
  }
  else if (compareMapSourceIDArray[0] == compareMapSourceIDArray[1])
  {
    compareSourcesUpdated = [false, true]
    compareMapSourceIDArray[1] = mapSourceID
  }
  else
  {
    compareSourcesUpdated = [true, true]
    const shouldSwap = mapSourceToUncheck = shouldSwapCompareMapSources(compareMapSourceIDArray[0], compareMapSourceIDArray[1]) ? compareMapSourceIDArray[0] : compareMapSourceIDArray[1]
    compareMapSourceIDArray[0] = compareMapSourceIDArray[0] == shouldSwap ? mapSourceID : compareMapSourceIDArray[0]
    compareMapSourceIDArray[1] = compareMapSourceIDArray[1] == shouldSwap ? mapSourceID : compareMapSourceIDArray[1]
  }

  showingCompareMap = true
  
  await updateCompareMapSources(compareSourcesUpdated, false)
  
  toggleMapSettingDisable("seatArrangement", true)
  updateCompareMapSlidersVisibility()
}

async function updateCompareMapSources(compareSourcesToUpdate, _overrideSwapSources, swapSliderValues, overrideDateValues = [null, null])
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

  // if (shouldSwapCompareMapSources(compareMapSourceIDArray[0], compareMapSourceIDArray[1]) && !overrideSwapSources)
  // {
  //   swapCompareMapSources()
  //   compareSourcesToUpdate = [true, true]
  // }

  if (swapSliderValues)
  {
    overrideDateValues[0] = $("#secondCompareDataMapDateSlider").val()
    overrideDateValues[1] = $("#firstCompareDataMapDateSlider").val()
  }

  if (compareSourcesToUpdate[0])
  {
    setDataMapDateSliderRange(true, "firstCompareDataMapDateSlider", "firstCompareDataMapSliderStepList", mapSources[compareMapSourceIDArray[0]].getMapDates())
    $("#firstCompareDataMapDateSlider").val(overrideDateValues[0] || mapSources[compareMapSourceIDArray[0]].getMapDates().length)
    await setCompareSourceDate(0, overrideDateValues[0] || mapSources[compareMapSourceIDArray[0]].getMapDates().length, !compareSourcesToUpdate[1])
    $("#compareItemImage-0").css('display', "block")
    $("#compareItemImage-0").prop('src', mapSources[compareMapSourceIDArray[0]].getIconURL() ?? "./assets/edit-icon.png")
  }
  if (compareSourcesToUpdate[1])
  {
    setDataMapDateSliderRange(true, "secondCompareDataMapDateSlider", "secondCompareDataMapSliderStepList", mapSources[compareMapSourceIDArray[1]].getMapDates())
    $("#secondCompareDataMapDateSlider").val(overrideDateValues[1] || mapSources[compareMapSourceIDArray[1]].getMapDates().length)
    await setCompareSourceDate(1, overrideDateValues[1] || mapSources[compareMapSourceIDArray[1]].getMapDates().length)
    $("#compareItemImage-1").css('display', "block")
    $("#compareItemImage-1").prop('src', mapSources[compareMapSourceIDArray[1]].getIconURL() ?? "./assets/edit-icon.png")
  }
}

async function loadCompareMapSource(sourceID)
{
  await downloadDataForMapSource(sourceID, getIconDivsToUpdateArrayForSourceID(sourceID))
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
    $("#compareCustomDropdownContainer").hide()
    $("#compareCustomListDropdownContainer").hide()
  }
  else
  {
    $("#compareButton").removeClass('active')
    $("#comparePresetsDropdownContainer").show()
    $("#compareArrayDropdownContainer").hide()
    $("#compareCustomDropdownContainer").hide()
    $("#compareCustomListDropdownContainer").hide()
  }
}

function hoveredCompareDropdownButton()
{
  if (showingCustomCompare)
  {
    $("#compareDropdownContent").css('display', "block")
    selectedDropdownDivID = "compareDropdownContent"
    $("#compareButton").addClass('active')
  }
  else
  {
    deselectDropdownButton()
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
  let mapSource = mapSources[compareMapSourceIDArray[compareArrayIndex]]
  
  var mapDates = mapSource.getMapDates()

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

  $("#compareItem-" + compareArrayIndex).html(mapSource.getName() + " (" + getDateString(dateToDisplay) + ")")
  
  compareMapDataArray[compareArrayIndex] = mapSource.getMapData()[dateToDisplay.getTime()]
  if (currentMapZoomRegion != null && currentMapType.getID() == USAPresidentMapType.getID())
  {
    compareMapDataArray[compareArrayIndex] = await mapSource.getZoomingData(compareMapDataArray[compareArrayIndex], currentMapZoomRegion, dateToDisplay.getTime())
  }

  if (compareArrayIndex == 0)
  {
    let candidateNames = mapSource.getCandidateNames(dateToDisplay.getTime())
    currentCustomMapSource.setCandidateNames(candidateNames, dateToDisplay.getTime())
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

    if (currentMapType.getMapSettings().seatArrangement == "election-type" && compareRegionData0?.seatClass != compareRegionData1?.seatClass)
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
        if (compareRegionData0.partyVotesharePercentages)
        {
          var sortedVoteshareArray = compareRegionData0.partyVotesharePercentages.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          resultMapArray[regionID].partyID = sortedVoteshareArray.length >= 2 ? sortedVoteshareArray[1].partyID : TossupParty.getID()
        }
        else
        {
          resultMapArray[regionID].partyID = Object.keys(compareRegionData0.candidateMap).filter(p => p != resultMapArray[regionID].partyID)[0] ?? TossupParty.getID()
        }
        
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
        const compareMajorParties = getCompareMajorParties?.()
        if (shouldCombineMinorThirdParties && compareMajorParties?.length == 2)
        {
          [[compareRegionData0, compareMajorParties[0]], [compareRegionData1, compareMajorParties[1]]].forEach(compareData => {
            let compareRegionData = compareData[0]
            let majorPartyIDs = compareData[1]
            
            let minorPartyData = compareRegionData.partyVotesharePercentages
              .filter(voteshareData => !majorPartyIDs.includes(voteshareData.partyID))
              
            compareRegionData.partyVotesharePercentages = compareRegionData.partyVotesharePercentages
              .filter(voteshareData => majorPartyIDs.includes(voteshareData.partyID))
            
            let totalMinorPartyVoteshare = minorPartyData.reduce((otherVoteshare, voteshareData) => {
              return otherVoteshare + voteshareData.voteshare
            }, 0)
            
            compareRegionData.partyVotesharePercentages.push({
              candidate: "Other",
              partyID: IndependentGenericParty.getID(),
              voteshare: totalMinorPartyVoteshare
            })
          })
        }
        
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
            candidatesToKeep.add(getRegionCandidateName(candidateData0.partyID, compareRegionData0, candidateData0))
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
            candidatesToKeep.add(getRegionCandidateName(candidateData1.partyID, compareRegionData1, candidateData1))
          }
        }
        let filteredVoteshares0 = compareRegionData0.partyVotesharePercentages.filter(candidateData => !partiesToRemove.has(candidateData.partyID) || candidatesToKeep.has(getRegionCandidateName(candidateData.partyID, compareRegionData0, candidateData))).sort((candidateData1, candidateData2) => candidateData2.voteshare-candidateData1.voteshare)
        let filteredVoteshares1 = compareRegionData1.partyVotesharePercentages.filter(candidateData => !partiesToRemove.has(candidateData.partyID) || candidatesToKeep.has(getRegionCandidateName(candidateData.partyID, compareRegionData1, candidateData))).sort((candidateData1, candidateData2) => candidateData2.voteshare-candidateData1.voteshare)

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

  (compareResultCustomMapSource ?? currentCompareMapSource ?? currentCustomMapSource).updateMapData(resultMapArray, (new Date(getTodayString("/", false, "mdy"))).getTime(), true, mapSources[compareMapSourceIDArray[0]].getCandidateNames(currentCompareSliderDate.getTime()), EditingMode.voteshare)

  if (shouldSetCompareMapSource)
  {
    await setMapSource(currentCompareMapSource ?? currentCustomMapSource)
  }
}
