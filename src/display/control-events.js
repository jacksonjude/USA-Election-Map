const shiftNumberKeycodes = ["!", "@", "#", "$", "%", "^", "&", "*", "("]

var arrowKeysDown = {left: 0, right: 0, up: 0, down: 0}
var arrowKeyTimeouts = {left: 0, right: 0, up: 0, down: 0}

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
    }
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

    if (showingCompareMap && currentMapSource.isCustom())
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

  if (showingCompareMap && currentMapSource.isCustom())
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
    if (showingCompareMap && currentMapSource.isCustom())
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

  if (showingCompareMap && currentMapSource.isCustom())
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
    displayDataMap(sliderDiv.value)
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
  if (currentEditingState == EditingState.viewing && !isEditingTextbox() && !selectedDropdownDivID && parseInt(e.key) != NaN && parseInt(e.key) > 0 && parseInt(e.key) < mapSourceIDs.length)
  {
    currentMapSource = mapSources[mapSourceIDs[parseInt(e.key)]]
    updateNavBarForNewSource()
    await loadDataMap()
    if (currentRegionID)
    {
      updateRegionBox(currentRegionID)
    }
  }
  else if (currentEditingState == EditingState.viewing && !isEditingTextbox() && e.key == "0")
  {
    clearMap()
  }
  else if (selectedDropdownDivID && parseInt(e.key) != NaN && parseInt(e.key) > 0)
  {
    switch (selectedDropdownDivID)
    {
      case "compareDropdownContent":
      if (parseInt(e.key)-1 >= getDefaultCompareSourceIDs().length) { return }

      $(".comparesourcecheckbox").prop('checked', false)
      compareMapSourceIDArray = [null, null]

      loadComparePreset(parseInt(e.key)-1)
      break

      case "marginsDropdownContent":
      if (parseInt(e.key) > 2) { return }

      switch (parseInt(e.key))
      {
        case 1:
        marginValues = cloneObject(defaultMarginValues)
        break

        case 2:
        marginValues = {safe: 5, likely: 3, lean: 1, tilt: Number.MIN_VALUE}
        break
      }

      createMarginEditDropdownItems()
      if (showingDataMap)
      {
        displayDataMap()
      }
      break

      case "mapSourcesDropdownContent":
      if (parseInt(e.key)-1 >= mapSourceIDs.length) { return }

      currentMapSource = mapSources[mapSourceIDs[parseInt(e.key)-1]]
      updateNavBarForNewSource()
      await loadDataMap(true, true)
      if (currentRegionID)
      {
        updateRegionBox(currentRegionID)
      }
      break
    }
  }
  else if (currentEditingState == EditingState.editing && !isEditingTextbox() && parseInt(e.key) != NaN && parseInt(e.key) <= dropdownPoliticalPartyIDs.length)
  {
    var partyToSelect = parseInt(e.key)
    if (partyToSelect == 0)
    {
      selectParty()
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
    else if (editCandidateNamePartyID)
    {
      toggleCandidateNameEditing()
    }
    else if (editPartyMarginColor)
    {
      toggleMarginHexColorEditing()
    }
    else if (editingRegionEVs)
    {
      editingRegionEVs = false
      updateRegionBox(currentRegionID)
    }
    else if (editingRegionMarginValue)
    {
      editingRegionMarginValue = false
      $("#regionboxcontainer").trigger('hide')
    }
    else if (currentMapType.getCustomMapEnabled())
    {
      toggleEditing()
    }
  }
  else if (e.key == "r" && !isEditingTextbox())
  {
    resizeElements()
  }
  else if (shiftNumberKeycodes.includes(e.key) && shiftNumberKeycodes.indexOf(e.key) < mapSourceIDs.length-1 && !isEditingTextbox())
  {
    var mapSourceIDToCompare = mapSourceIDs[shiftNumberKeycodes.indexOf(e.key)]
    toggleCompareMapSourceCheckbox(mapSourceIDToCompare, false)
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
  }
  else if (e.key == "t" && !isEditingTextbox())
  {
    cycleMapType($("#cycleMapTypeButton")[0])
  }
})

var mouseIsDown = false
var regionIDsChanged = []
var startRegionID
var mouseMovedDuringClick = false
var currentRegionID
var ignoreNextClick = false

var currentMouseY

document.addEventListener('mousedown', function() {
  if (currentEditingState == EditingState.editing)
  {
    startRegionID = currentRegionID
    mouseIsDown = true
  }
})

document.oncontextmenu = function() {
  if (currentEditingState == EditingState.editing)
  {
    regionIDsChanged = []
    mouseIsDown = false
    mouseMovedDuringClick = false
    startRegionID = null
  }
}

function mouseEnteredRegion(div)
{
  var regionID = getBaseRegionID($(div).attr('id')).baseID
  currentRegionID = regionID
  if (currentEditingState == EditingState.editing && mouseIsDown && !regionIDsChanged.includes(regionID))
  {
    leftClickRegion(div)
    regionIDsChanged.push(regionID)
  }
  else if (currentEditingState == EditingState.viewing && showingDataMap)
  {
    updateRegionBox(regionID)
  }

  if (editingRegionMarginValue)
  {
    updateRegionBox(regionID)
  }

  if ($(div).attr(noInteractSVGRegionAttribute) === undefined && !(currentMapType.getMapSettingValue("flipStates") && browserName == "Safari")) // Major lag which is linked to the svg flip pattern + stroke editing on Safari
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
  var usedFallbackMap = svgPathData[2] || false

  if ((currentViewingState == ViewingState.zooming || currentMapType.getMapSettingValue("showAllDistricts")) && !usedFallbackMap)
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

  $("#regionboxcontainer").trigger('hide')

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
  if (currentViewingState == ViewingState.editing)
  {
    if (mouseIsDown)
    {
      mouseMovedDuringClick = true
    }
    if (mouseIsDown && currentRegionID && !regionIDsChanged.includes(currentRegionID))
    {
      leftClickRegion($("#" + currentRegionID))
      regionIDsChanged.push(currentRegionID)
    }
  }

  $("#regionboxcontainer").css("left", e.pageX+5)
  updateRegionBoxYPosition(e.pageY)

  currentMouseY = e.pageY
})

document.addEventListener('mouseup', function() {
  if (currentEditingState == EditingState.editing)
  {
    regionIDsChanged = []
    mouseIsDown = false
    if (currentRegionID != null && startRegionID == currentRegionID && mouseMovedDuringClick)
    {
      ignoreNextClick = true
    }
    mouseMovedDuringClick = false
    startRegionID = null
  }
})

function isEditingTextbox()
{
  return editMarginID || editingRegionEVs || editingRegionMarginValue || editCandidateNamePartyID || editPartyMarginColor
}
