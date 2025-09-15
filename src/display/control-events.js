const shiftNumberKeycodes = ["!", "@", "#", "$", "%", "^", "&", "*", "("]

var arrowKeysDown = {left: 0, right: 0, up: 0, down: 0}
var arrowKeyTimeouts = {left: 0, right: 0, up: 0, down: 0}
var shiftKeyDown = false
var altKeyDown = false

const openLinksWithLeftClick = true

document.addEventListener('keydown', function(e) {
  if (!isEditingTextbox() && showingDataMap)
  {
    switch (e.key)
    {
      case "ArrowLeft":
      if (arrowKeysDown.left > 0) { return }
      arrowKeysDown.left = 1
      arrowKeyTimeouts.left = setTimeout(function() { arrowKeyCycle("left") }, initialKeyPressDelay)

      incrementSlider("left")
      break

      case "ArrowRight":
      if (arrowKeysDown.right > 0) { return }
      arrowKeysDown.right = 1
      arrowKeyTimeouts.right = setTimeout(function() { arrowKeyCycle("right") }, initialKeyPressDelay)

      incrementSlider("right")
      break

      case "ArrowDown":
      if (arrowKeysDown.down > 0) { return }
      arrowKeysDown.down = 1
      arrowKeyTimeouts.down = setTimeout(function() { arrowKeyCycle("down") }, initialKeyPressDelay)

      incrementSlider("down")
      break

      case "ArrowUp":
      if (arrowKeysDown.up > 0) { return }
      arrowKeysDown.up = 1
      arrowKeyTimeouts.up = setTimeout(function() { arrowKeyCycle("up") }, initialKeyPressDelay)

      incrementSlider("up")
      break

      case "Shift":
      shiftKeyDown = true
      updateRegionBox()
      break
      
      case "Alt":
      altKeyDown = true
      updateRegionBox()
      break
    }
  }
  else if (editingRegionVotesharePercentages && e.key == "ArrowUp")
  {
    e.preventDefault()
    cycleSelectedRegionVoteshare(-1)
  }
  else if (editingRegionVotesharePercentages && e.key == "ArrowDown")
  {
    e.preventDefault()
    cycleSelectedRegionVoteshare(1)
  }
})

function arrowKeyCycle(keyString)
{
  switch (arrowKeysDown[keyString])
  {
    case 0:
    break

    case 1:
    arrowKeysDown[keyString] = 2
    /* falls through */
    case 2:
    incrementSlider(keyString)
    var mapDatesLength = currentMapSource.getMapDates().length

    if (showingCompareMap && currentMapSource.isCompare())
    {
      switch (selectedCompareSlider)
      {
        case null:
        return

        case 0:
        mapDatesLength = mapSources[compareMapSourceIDArray[0]].getMapDates().length
        break

        case 1:
        mapDatesLength = mapSources[compareMapSourceIDArray[1]].getMapDates().length
        break
      }
    }

    setTimeout(function() { arrowKeyCycle(keyString) }, zoomKeyPressDelayForHalf*2.0/mapDatesLength)
    break
  }
}

function incrementSlider(keyString)
{
  var sliderDiv = $("#dataMapDateSlider")[0]

  if (showingCompareMap && currentMapSource.isCompare())
  {
    switch (selectedCompareSlider)
    {
      case null:
      if (keyString != "down" && keyString != "up")
      {
        return
      }
      sliderDiv = null
      break

      case 0:
      sliderDiv = $("#firstCompareDataMapDateSlider")[0]
      break

      case 1:
      sliderDiv = $("#secondCompareDataMapDateSlider")[0]
      break
    }
  }

  if ($(sliderDiv).is(":hidden")) { return }

  switch (keyString)
  {
    case "left":
    if (sliderDiv.value == 0) { return }
    sliderDiv.value -= 1
    break

    case "right":
    if (sliderDiv.value == sliderDiv.max) { return }
    sliderDiv.value -= -1 //WHY DO I HAVE TO DO THIS BS
    break

    case "down":
    if (showingCompareMap && currentMapSource.isCompare())
    {
      switch (selectedCompareSlider)
      {
        case null:
        $("#firstCompareDataMapDateSlider")[0].style.opacity = 1
        $("#secondCompareDataMapDateSlider")[0].style.opacity = null
        selectedCompareSlider = 0
        break

        case 0:
        $("#firstCompareDataMapDateSlider")[0].style.opacity = null
        $("#secondCompareDataMapDateSlider")[0].style.opacity = 1
        selectedCompareSlider = 1
        break

        case 1:
        $("#firstCompareDataMapDateSlider")[0].style.opacity = null
        $("#secondCompareDataMapDateSlider")[0].style.opacity = null
        selectedCompareSlider = null
        break
      }
      return
    }

    if (sliderDiv.value == 0) { return }
    if (sliderDiv.value < currentMapType.getSecondarySliderIncrement())
    {
      sliderDiv.value = 0
    }
    else
    {
      sliderDiv.value -= currentMapType.getSecondarySliderIncrement()
    }
    break

    case "up":
    if (showingCompareMap && currentMapSource.isCustom())
    {
      switch (selectedCompareSlider)
      {
        case null:
        $("#firstCompareDataMapDateSlider")[0].style.opacity = null
        $("#secondCompareDataMapDateSlider")[0].style.opacity = 1
        selectedCompareSlider = 1
        break

        case 0:
        $("#firstCompareDataMapDateSlider")[0].style.opacity = null
        $("#secondCompareDataMapDateSlider")[0].style.opacity = null
        selectedCompareSlider = null
        break

        case 1:
        $("#firstCompareDataMapDateSlider")[0].style.opacity = 1
        $("#secondCompareDataMapDateSlider")[0].style.opacity = null
        selectedCompareSlider = 0
        break
      }
      return
    }

    if (sliderDiv.value == sliderDiv.max) { return }
    if (parseInt(sliderDiv.max)-sliderDiv.value < currentMapType.getSecondarySliderIncrement())
    {
      sliderDiv.value = sliderDiv.max
    }
    else
    {
      sliderDiv.value -= -currentMapType.getSecondarySliderIncrement() //WHY DO I HAVE TO DO THIS BS
    }
    break
  }

  if (showingCompareMap && currentMapSource.isCompare())
  {
    switch (selectedCompareSlider)
    {
      case 0:
      setCompareSourceDate(0, $("#firstCompareDataMapDateSlider")[0].value)
      break

      case 1:
      setCompareSourceDate(1, $("#secondCompareDataMapDateSlider")[0].value)
      break
    }
  }
  else
  {
    addToDisplayMapQueue(sliderDiv.value)
  }
}

document.addEventListener('keyup', function(e) {
  switch (e.key)
  {
    case "ArrowLeft":
    arrowKeysDown.left = 0
    clearTimeout(arrowKeyTimeouts.left)
    break

    case "ArrowRight":
    arrowKeysDown.right = 0
    clearTimeout(arrowKeyTimeouts.right)
    break

    case "ArrowDown":
    arrowKeysDown.down = 0
    clearTimeout(arrowKeyTimeouts.down)
    break

    case "ArrowUp":
    arrowKeysDown.up = 0
    clearTimeout(arrowKeyTimeouts.up)
    break

    case "Shift":
    shiftKeyDown = false
    updateRegionBox()
    break
    
    case "Alt":
    altKeyDown = false
    updateRegionBox()
    break
  }
})

function deselectDropdownButton()
{
  $('.dropdown-content').css('display', '')
  removeActiveClassFromDropdownButton()
  selectedDropdownDivID = null

  $('.dropdown-content').each((_, div) => {
    if ($(div).css("display") == "none" && $(div).find(".jscolor-active").length > 0)
    {
      jscolor.hide()
    }
  })
}

function removeActiveClassFromDropdownButton()
{
  switch (selectedDropdownDivID)
  {
    case "compareDropdownContent":
    if (!showingCompareMap)
    {
      $("#compareButton").removeClass('active')
    }
    break

    case "marginsDropdownContent":
    if (!editMarginID)
    {
      $("#marginEditButton").removeClass('active')
    }
    break

    case "mapSourcesDropdownContent":
    $("#sourceToggleButton").removeClass('active')
    break
  }
}

document.addEventListener('keypress', async function(e) {
  if (currentEditingState == EditingState.viewing && !isEditingTextbox() && !selectedDropdownDivID && !isNaN(parseInt(e.key)) && parseInt(e.key) > 0 && parseInt(e.key) < mapSourceIDs.length)
  {
    await setMapSource(mapSources[mapSourceIDs[parseInt(e.key)-1]])
    if (currentRegionID)
    {
      updateRegionBox()
    }
  }
  else if (currentEditingState == EditingState.viewing && !isEditingTextbox() && e.key == "0")
  {
    clearMap()
  }
  else if (selectedDropdownDivID && !isNaN(parseInt(e.key)) && parseInt(e.key) > 0)
  {
    switch (selectedDropdownDivID)
    {
      case "compareDropdownContent":
      if (parseInt(e.key)-1 >= currentMapType.getDefaultCompareSourceIDs().length) { return }

      $(".comparesourcecheckbox").prop('checked', false)
      compareMapSourceIDArray = [null, null]

      loadComparePreset(parseInt(e.key))
      break

      case "marginsDropdownContent":
      if (parseInt(e.key) > 2) { return }

      switch (parseInt(e.key))
      {
        case 1:
        marginValues = cloneObject(defaultMarginValues)
        break

        case 2:
        marginValues = cloneObject(alternateMarginValues)
        break
      }

      createMarginEditDropdownItems(currentMapSource.getCustomDefaultMargins() == null)
      if (showingDataMap)
      {
        displayDataMap()
      }
      break

      case "mapSourcesDropdownContent":
      if (parseInt(e.key)-1 >= mapSourceIDs.length) { return }

      await setMapSource(mapSources[mapSourceIDs[parseInt(e.key)-1]], true, true)
      if (currentRegionID)
      {
        updateRegionBox()
      }
      break
    }
  }
  else if (currentEditingState == EditingState.editing && !isEditingTextbox() && !isNaN(parseInt(e.key)) && parseInt(e.key) <= dropdownPoliticalPartyIDs.length)
  {
    var partyToSelect = parseInt(e.key)
    if (partyToSelect == 0)
    {
      deselectAllParties()
    }
    else
    {
      selectParty($("#" + dropdownPoliticalPartyIDs[partyToSelect-1]))
    }
  }
  else if (e.key == "Enter")
  {
    if (editMarginID)
    {
      toggleMarginEditing()
    }
    else if (isEnteringShiftAmount)
    {
      toggleEnteringShiftAmount()
    }
    else if (editCandidateNamePartyID)
    {
      toggleCandidateNameEditing()
    }
    else if (editPartyMarginColor)
    {
      toggleMarginHexColorEditing()
    }
    else if (editPartyPopularVote)
    {
      togglePartyPopularVoteEditing(editPartyPopularVote)
    }
    else if (editingRegionEVs)
    {
      editingRegionEVs = false
      updateRegionBox()
    }
    else if (editingRegionMarginValue)
    {
      toggleRegionMarginEditing()
    }
    else if (editingRegionVotesharePercentages)
    {
      toggleRegionVoteshareEditing(voteshareEditRegion)
    }
    else if (currentMapType.getCustomMapEnabled())
    {
      toggleEditing()
    }
  }
  else if (shiftNumberKeycodes.includes(e.key) && shiftNumberKeycodes.indexOf(e.key) < mapSourceIDs.length-1 && !isEditingTextbox())
  {
    var mapSourceIDToCompare = mapSourceIDs[shiftNumberKeycodes.indexOf(e.key)]
    addCompareMapSource(mapSourceIDToCompare)
  }
  else if ((e.key == "c" || e.key == "m" || e.key == "s") && !isEditingTextbox())
  {
    removeActiveClassFromDropdownButton()

    var contentDivIDToToggle = ""
    var dropdownButtonDivID = ""
    switch (e.key)
    {
      case "c":
      contentDivIDToToggle = "compareDropdownContent"
      dropdownButtonDivID = "compareButton"
      break

      case "m":
      contentDivIDToToggle = "marginsDropdownContent"
      dropdownButtonDivID = "marginEditButton"
      break

      case "s":
      contentDivIDToToggle = "mapSourcesDropdownContent"
      dropdownButtonDivID = "sourceToggleButton"
      break
    }

    var shouldShowContentDiv = $("#" + contentDivIDToToggle).css('display') != "block"

    $(".dropdown-content").css('display', "")

    if (shouldShowContentDiv)
    {
      $("#" + contentDivIDToToggle).css('display', "block")
      $("#" + dropdownButtonDivID).addClass('active')
      selectedDropdownDivID = contentDivIDToToggle
    }
    else
    {
      removeActiveClassFromDropdownButton()
      selectedDropdownDivID = null
    }
    
    updateDropdownFlip($("#" + contentDivIDToToggle))
  }
  else if (e.key == "t" && !isEditingTextbox())
  {
    cycleMapType($("#cycleMapTypeButton")[0])
  }
  else if (e.key == "Escape" && currentViewingState == ViewingState.zooming)
  {
    zoomOutMap()
  }
  else if (e.key == "r" && currentRound)
  {
    currentRound += 1
    displayDataMap()
  }
})

var mouseIsDown = false
var regionIDsChanged = []
var startRegionID
var mouseMovedDuringClick = false
var currentRegionID
var ignoreNextClick = false
var clickUsedToZoom = false

var isDraggingInsideRoundControls = false

var currentMouseX
var currentMouseY

document.addEventListener('mousedown', async function(e) {
  mouseIsDown = true
  
  if (!editingRegionVotesharePercentages)
  {
    updateRegionBox()
  }
  
  mouseMovedDuringClick = false
  pannedDuringClick = false

  if (currentEditingState == EditingState.editing)
  {
    startRegionID = currentRegionID

    var currentMapDataForDate = currentMapSource.getMapData()[currentSliderDate.getTime()]
    if (await currentMapSource.canZoom(currentMapDataForDate, startRegionID) && currentViewingState == ViewingState.viewing)
    {
      clickUsedToZoom = true
    }
  }
  
  if (isPointInDiv($("#mapRoundControls")[0], e))
  {
    isDraggingInsideRoundControls = true
  }
})

document.oncontextmenu = function() {
  if (currentEditingState == EditingState.editing)
  {
    regionIDsChanged = []
    startRegionID = null
  }

  mouseIsDown = false
  updateRegionBox()
  mouseMovedDuringClick = false
}

function mouseEnteredRegion(div)
{
  var regionID = getBaseRegionID($(div).attr('id')).baseID
  currentRegionID = regionID

  if (currentEditingState == EditingState.editing && shouldDragSelect && mouseIsDown && !regionIDsChanged.includes(regionID) && !editingRegionVotesharePercentages)
  {
    leftClickRegion(div)
    regionIDsChanged.push(regionID)
  }

  if (showingDataMap && !editingRegionVotesharePercentages)
  {
    updateRegionBox(regionID)
  }

  if ($(div).attr(noInteractSVGRegionAttribute) === undefined && !((currentMapType.getMapSettingValue("flipStates") || currentViewingState == ViewingState.splitVote) && browserName == "Safari")) // Major lag which is linked to the svg flip pattern + stroke editing on Safari
  {
    $(div).css('stroke', regionSelectColor)
    for (var linkedRegionSetNum in linkedRegions)
    {
      for (var linkedRegionIDNum in linkedRegions[linkedRegionSetNum])
      {
        if (linkedRegions[linkedRegionSetNum][linkedRegionIDNum] == regionID)
        {
          for (var linkedRegionIDNum2 in linkedRegions[linkedRegionSetNum])
          {
            $("#" + linkedRegions[linkedRegionSetNum][linkedRegionIDNum2]).css('stroke', regionSelectColor)
          }
        }
      }
    }
  }

  var svgPathData = currentMapType.getSVGPath()
  var usedFallbackMap = (svgPathData instanceof Array) && (svgPathData[2] ?? false)

  if ((currentViewingState == ViewingState.zooming || currentMapType.getMapSettingValue("showAllDistricts") || currentMapType.getShouldAlwaysReorderOutlines()) && !usedFallbackMap)
  {
    var regionPath = document.getElementById(regionID)
    var parent = regionPath.parentNode
    parent.insertBefore(regionPath, parent.lastChild.nextSibling)
  }
}

function mouseLeftRegion(div)
{
  var regionID = getBaseRegionID($(div).attr('id')).baseID
  if (currentRegionID == regionID)
  {
    currentRegionID = null
  }

  if (!editingRegionVotesharePercentages)
  {
    updateRegionBox()
  }

  if ($(div).css('stroke') != regionDeselectColor)
  {
    $(div).css('stroke', regionDeselectColor)
    for (var linkedRegionSetNum in linkedRegions)
    {
      for (var linkedRegionIDNum in linkedRegions[linkedRegionSetNum])
      {
        if (linkedRegions[linkedRegionSetNum][linkedRegionIDNum] == regionID)
        {
          for (var linkedRegionIDNum2 in linkedRegions[linkedRegionSetNum])
          {
            $("#" + linkedRegions[linkedRegionSetNum][linkedRegionIDNum2]).css('stroke', regionDeselectColor)
          }
        }
      }
    }
  }
}

document.addEventListener('mousemove', function(e) {
  if (mouseIsDown)
  {
    mouseMovedDuringClick = true
  }

  if (currentEditingState == EditingState.editing && !editingRegionVotesharePercentages)
  {
    if (shouldDragSelect && mouseIsDown && currentRegionID && !regionIDsChanged.includes(currentRegionID))
    {
      leftClickRegion($("#" + currentRegionID))
      regionIDsChanged.push(currentRegionID)
    }
  }

  if (!editingRegionVotesharePercentages)
  {
    updateRegionBoxPosition(e.pageX, e.pageY)
  }
  
  if (isDraggingInsideRoundControls)
  {
    $("#mapRoundControls a").each(function () {
      const round = $(this).data('round')
      if (isPointInDivVertically($(this)[0], e) && round != currentRound)
      {
        selectRound(round)
      }
    })
  }

  currentMouseX = e.pageX
  currentMouseY = e.pageY
})

document.addEventListener('mouseup', function() {
  if (currentEditingState == EditingState.editing && !editingRegionVotesharePercentages)
  {
    regionIDsChanged = []
    if (currentRegionID != null && !clickUsedToZoom && startRegionID == currentRegionID && mouseMovedDuringClick && shouldDragSelect)
    {
      ignoreNextClick = true
    }
    startRegionID = null
  }

  mouseIsDown = false
  isDraggingInsideRoundControls = false
  
  if (!editingRegionVotesharePercentages)
  {
    updateRegionBox()
  }

  if (clickUsedToZoom)
  {
    clickUsedToZoom = false
  }
})

function viewingDiscreteRegions()
{
  return currentMapType.getID() != USAHouseMapType.getID() || currentMapType.getMapSettingValue("showAllDistricts") === true || currentViewingState == ViewingState.zooming
}

async function leftClickRegion(div)
{
  var regionID = $(div).attr('id')
  
  let currentMapDataForDate = currentSliderDate.getTime() ? currentMapSource.getMapData()[currentSliderDate.getTime()] : null
  let canZoomCurrently = await currentMapSource.canZoom(currentMapDataForDate, regionID)

  let isDiscreteRegion = viewingDiscreteRegions()

  var regionDataCallback = getRegionData(regionID)
  var regionData = regionDataCallback.regionData
  var regionIDsToFill = regionDataCallback.linkedRegionIDs

  if (isDiscreteRegion && currentEditingState == EditingState.editing && (currentMapSource.getEditingMode() == EditingMode.voteshare || editingRegionVotesharePercentages))
  {
    toggleRegionVoteshareEditing(regionID, regionData)
  }
  else if (isDiscreteRegion && currentEditingState == EditingState.editing && editingRegionMarginValue)
  {
    toggleRegionMarginEditing()
  }
  else if (isDiscreteRegion && currentEditingState == EditingState.editing)
  {
    if (ignoreNextClick)
    {
      ignoreNextClick = false
      return
    }

    if (regionIDsChanged.includes(regionID)) { return }
    
    if (regionData.partyID != (selectedParty ?? TossupParty).getID())
    {
      regionData.flip = false
    }

    if (regionData.disabled)
    {
      regionData.partyID = (selectedParty || TossupParty).getID()
      regionData.candidateName = regionData.candidateMap ? regionData.candidateMap[regionData.partyID] : null
    }
    else if (selectedParty != null && regionData.partyID != selectedParty.getID())
    {
      regionData.partyID = selectedParty.getID()
      regionData.candidateName = regionData.candidateMap ? regionData.candidateMap[regionData.partyID] : null
      regionData.margin = marginValues.safe
    }
    else if (selectedParty != null)
    {
      var marginValueArray = Object.values(marginValues)
      var marginValueIndex = marginValueArray.indexOf(regionData.margin)
      if (marginValueIndex == -1)
      {
        for (var marginValueNum in marginValueArray)
        {
          if (regionData.margin >= marginValueArray[marginValueNum])
          {
            regionData.margin = marginValueArray[marginValueNum]
            break
          }
        }
        marginValueIndex = marginValueArray.indexOf(regionData.margin)
      }

      marginValueIndex += 1
      if (marginValueIndex > marginValueArray.length-1)
      {
        marginValueIndex = 0
      }

      // Hardcoding tilt = 0.1
      regionData.margin = marginValueIndex == marginValueArray.length-1 ? 0.1 : marginValueArray[marginValueIndex]
    }
    else
    {
      regionData.partyID = TossupParty.getID()
      regionData.margin = 0
    }

    updateRegionFillColors(regionIDsToFill, regionData)
    displayPartyTotals()
  }
  else if (canZoomCurrently && currentViewingState == ViewingState.viewing && showingDataMap)
  {
    var baseRegionID = getBaseRegionID($(div).attr('id')).baseID
    currentViewingState = ViewingState.zooming
    currentMapZoomRegion = regionID.includes(subregionSeparator) ? baseRegionID.split(subregionSeparator)[0] : baseRegionID
    
    if (currentMapType.getID() == USAPresidentMapType.getID())
    {
      $("#editDoneButton").addClass('topnavdisable')
      $("#copyDropdownContent").addClass('topnavdisable')
      $("#copyDropdownContent").css("opacity", "0%")
      
      if (currentMapZoomRegion.includes("-"))
      {
        let stateID = currentMapZoomRegion.split("-")[0]
        if (stateID == "NE" || stateID == "ME")
        {
          currentMapZoomRegion = stateID
        }
      }
    }

    displayDataMap(null, null, true)

    currentRegionID = null
    updateRegionBox()
  }
  else if (openLinksWithLeftClick && showingDataMap)
  {
    currentMapSource.openRegionLink(currentRegionID ?? currentMapZoomRegion, currentSliderDate)
    
    shiftKeyDown = false
    altKeyDown = false
    updateRegionBox()
  }
}

function rightClickRegion(div)
{
  let isDiscreteRegion = viewingDiscreteRegions()

  var regionID = $(div).attr('id')
  var regionDataCallback = getRegionData(regionID)
  var regionData = regionDataCallback.regionData
  var regionIDsToFill = regionDataCallback.linkedRegionIDs

  if (isDiscreteRegion && currentEditingState == EditingState.editing && (currentMapSource.getEditingMode() == EditingMode.voteshare || editingRegionVotesharePercentages))
  {
    toggleRegionVoteshareEditing(regionID, regionData)
  }
  else if (isDiscreteRegion && currentEditingState == EditingState.editing && editingRegionMarginValue)
  {
    toggleRegionMarginEditing()
  }
  else if (isDiscreteRegion && currentEditingState == EditingState.editing)
  {
    if (regionData.disabled)
    {
      regionData.partyID = (selectedParty || TossupParty).getID()
      regionData.candidateName = regionData.candidateMap ? regionData.candidateMap[regionData.partyID] : null
    }
    else if (selectedParty != null && regionData.partyID != selectedParty.getID())
    {
      regionData.partyID = selectedParty.getID()
      regionData.candidateName = regionData.candidateMap ? regionData.candidateMap[regionData.partyID] : null
      regionData.margin = 0.1 // Hardcoding tilt == 0.1
    }
    else if (selectedParty != null)
    {
      var marginValueArray = Object.values(marginValues)
      var marginValueIndex = marginValueArray.indexOf(regionData.margin)
      if (marginValueIndex == -1)
      {
        for (var marginValueNum in marginValueArray)
        {
          if (regionData.margin >= marginValueArray[marginValueNum])
          {
            regionData.margin = marginValueArray[marginValueNum]
            break
          }
        }
        marginValueIndex = marginValueArray.indexOf(regionData.margin)
      }

      marginValueIndex -= 1
      if (marginValueIndex < 0)
      {
        marginValueIndex = marginValueArray.length-1
      }

      // Hardcoding tilt == 0.1
      regionData.margin = marginValueIndex == marginValueArray.length-1 ? 0.1 : marginValueArray[marginValueIndex]
    }
    else
    {
      regionData.partyID = TossupParty.getID()
      regionData.margin = 0
    }

    updateRegionFillColors(regionIDsToFill, regionData)
    displayPartyTotals()
  }
  else if (showingDataMap)
  {
    currentMapSource.openRegionLink(currentRegionID ?? currentMapZoomRegion, currentSliderDate)
    
    shiftKeyDown = false
    altKeyDown = false
    updateRegionBox()
  }
}

function shiftClickRegion(_div)
{
  let isDiscreteRegion = viewingDiscreteRegions()

  if (isDiscreteRegion && currentEditingState == EditingState.editing && currentMapSource.getEditingMode() == EditingMode.margin)
  {
    toggleRegionMarginEditing()
    return true
  }
  else if (isDiscreteRegion && currentMapType.getID() == USAPresidentMapType.getID() && currentViewingState == ViewingState.viewing && currentMapSource.isCustom())
  {
    editingRegionEVs = !editingRegionEVs
    updateRegionBox()
    return true
  }
  
  return false
}

function altClickRegion(div)
{
  let isDiscreteRegion = viewingDiscreteRegions()
  
  if (isDiscreteRegion && currentEditingState == EditingState.editing)
  {
    const {regionData, linkedRegionIDs: regionIDsToFill} = getRegionData($(div).attr('id'))
    
    regionData.flip = !regionData.flip
  
    updateRegionFillColors(regionIDsToFill, regionData)
    updateMapElectoralVoteText()
    displayPartyTotals()
    
    updateRegionBox()
    
    return true
  }
  
  return false
}

function altShiftClickRegion(div)
{
  let isDiscreteRegion = viewingDiscreteRegions()

  if (isDiscreteRegion && currentEditingState == EditingState.editing)
  {
    var regionDataCallback = getRegionData($(div).attr('id'))
    var regionData = regionDataCallback.regionData
    var regionIDsToFill = regionDataCallback.linkedRegionIDs

    if (currentEditingMode == EditingMode.margin)
    {
      regionData.partyID = (selectedParty || TossupParty).getID()
    }
    else if (currentEditingMode == EditingMode.voteshare)
    {
      regionData.partyID = TossupParty.getID()
      regionData.partyVotesharePercentages = []
    }

    if (regionData.disabled)
    {
      regionData.disabled = false
      regionData.isHold = false
    }
    else
    {
      regionData.disabled = true
      regionData.isHold = true
    }

    updateRegionFillColors(regionIDsToFill, regionData)
    updateMapElectoralVoteText()
    displayPartyTotals()
    
    updateRegionBox()
    
    return true
  }
  
  return false
}

function isEditingTextbox()
{
  return editMarginID || editingRegionEVs || editingRegionMarginValue || editingRegionVotesharePercentages || editCandidateNamePartyID || editPartyMarginColor || isEnteringShiftAmount || editPartyPopularVote
}
