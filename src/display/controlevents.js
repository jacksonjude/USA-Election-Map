var arrowKeysDown = {left: 0, right: 0, up: 0, down: 0}
var arrowKeyTimeouts = {}

document.addEventListener('keydown', function(e) {
  if (e.which >= 37 && e.which <= 40 && showingDataMap)
  {
    switch (e.which)
    {
      case 37:
      if (arrowKeysDown.left > 0) { return }
      arrowKeysDown.left = 1
      arrowKeyTimeouts.left = setTimeout(function() { arrowKeyCycle("left") }, initialKeyPressDelay)

      incrementSlider("left")
      break

      case 39:
      if (arrowKeysDown.right > 0) { return }
      arrowKeysDown.right = 1
      arrowKeyTimeouts.right = setTimeout(function() { arrowKeyCycle("right") }, initialKeyPressDelay)

      incrementSlider("right")
      break

      case 40:
      if (arrowKeysDown.down > 0) { return }
      arrowKeysDown.down = 1
      arrowKeyTimeouts.down = setTimeout(function() { arrowKeyCycle("down") }, initialKeyPressDelay)

      incrementSlider("down")
      break

      case 38:
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
    case 2:
    incrementSlider(keyString)
    var mapDatesLength = currentMapSource.getMapDates().length

    if (showingCompareMap && currentMapSource.getID() == currentCustomMapSource.getID())
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

  if (showingCompareMap && currentMapSource.getID() == currentCustomMapSource.getID())
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
    if (showingCompareMap && currentMapSource.getID() == currentCustomMapSource.getID())
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
    if (sliderDiv.value < 5)
    {
      sliderDiv.value = 0
    }
    else
    {
      sliderDiv.value -= 5
    }
    break

    case "up":
    if (showingCompareMap && currentMapSource.getID() == currentCustomMapSource.getID())
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
    if (parseInt(sliderDiv.max)-sliderDiv.value < 5)
    {
      sliderDiv.value = sliderDiv.max
    }
    else
    {
      sliderDiv.value -= -5 //WHY DO I HAVE TO DO THIS BS
    }
    break
  }

  if (showingCompareMap && currentMapSource.getID() == currentCustomMapSource.getID())
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
  if (e.which >= 37 && e.which <= 40)
  {
    switch (e.which)
    {
      case 37:
      arrowKeysDown.left = 0
      clearTimeout(arrowKeyTimeouts.left)
      break

      case 39:
      arrowKeysDown.right = 0
      clearTimeout(arrowKeyTimeouts.right)
      break

      case 40:
      arrowKeysDown.down = 0
      clearTimeout(arrowKeyTimeouts.down)
      break

      case 38:
      arrowKeysDown.up = 0
      clearTimeout(arrowKeyTimeouts.up)
      break
    }
  }
})

function deselectDropdownButton()
{
  $('.dropdown-content').css('display', '')
  removeActiveClassFromDropdownButton()
  selectedDropdownDivID = null
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
  if (currentMapState == kViewing && !editMarginID && !selectedDropdownDivID && e.which >= 49 && e.which <= 57 && e.which-49 < mapSourceIDs.length)
  {
    currentMapSource = mapSources[mapSourceIDs[e.which-49]]
    updateMapSourceButton()
    await loadDataMap()
    if (currentRegionID)
    {
      updateStateBox(currentRegionID)
    }
  }
  else if (currentMapState == kViewing && !editMarginID && e.which == 48)
  {
    clearMap()
  }
  else if (selectedDropdownDivID && e.which >= 49 && e.which <= 57)
  {
    switch (selectedDropdownDivID)
    {
      case "compareDropdownContent":
      if (e.which >= 3+49) { return }

      $(".comparesourcecheckbox").prop('checked', false)
      compareMapSourceIDArray = [null, null]

      loadComparePreset(e.which-(49-1))
      break

      case "marginsDropdownContent":
      if (e.which >= 2+49) { return }

      switch (e.which)
      {
        case 49:
        marginValues = cloneObject(defaultMarginValues)
        break

        case 50:
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
      if (e.which >= mapSourceIDs.length+49) { return }

      currentMapSource = mapSources[mapSourceIDs[e.which-49]]
      updateMapSourceButton()
      await loadDataMap(true, true)
      if (currentRegionID)
      {
        updateStateBox(currentRegionID)
      }
      break
    }
  }
  else if (currentMapState == kEditing && e.which >= 48 && e.which <= 57 && e.which-48 <= selectablePoliticalPartyIDs.length)
  {
    var partyToSelect = e.which-48
    if (partyToSelect == 0)
    {
      selectParty()
    }
    else
    {
      selectParty($("#" + selectablePoliticalPartyIDs[partyToSelect-1]))
    }
  }
  else if (e.which == 13)
  {
    if (editMarginID)
    {
      toggleMarginEditing()
    }
    else
    {
      toggleEditing()
    }
  }
  else if (e.which == 82 || e.which == 114)
  {
    resizeElements()
  }
  else if (shiftNumberKeycodes.includes(e.which) && shiftNumberKeycodes.indexOf(e.which) < mapSourceIDs.length-1)
  {
    var mapSourceIDToCompare = mapSourceIDs[shiftNumberKeycodes.indexOf(e.which)]
    toggleCompareMapSourceCheckbox(mapSourceIDToCompare, false)
  }
  else if (e.which == 99 || e.which == 109 || e.which == 115)
  {
    removeActiveClassFromDropdownButton()

    var contentDivIDToToggle = ""
    var dropdownButtonDivID = ""
    switch (e.which)
    {
      case 99:
      contentDivIDToToggle = "compareDropdownContent"
      dropdownButtonDivID = "compareButton"
      break

      case 109:
      contentDivIDToToggle = "marginsDropdownContent"
      dropdownButtonDivID = "marginEditButton"
      break

      case 115:
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
})

var mouseIsDown = false
var regionIDsChanged = []
var startRegionID
var mouseMovedDuringClick = false
var currentRegionID
var ignoreNextClick = false

document.addEventListener('mousedown', function(e) {
  if (currentMapState == kEditing)
  {
    startRegionID = currentRegionID
    mouseIsDown = true
  }
})

document.oncontextmenu = function() {
  if (currentMapState == kEditing)
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
  if (currentMapState == kEditing && mouseIsDown && !regionIDsChanged.includes(regionID))
  {
    leftClickRegion(div)
    regionIDsChanged.push(regionID)
  }
  else if (currentMapState == kViewing && showingDataMap)
  {
    updateStateBox(regionID)
  }

  $(div).css('stroke', regionSelectColor)
  for (linkedRegionSetNum in linkedRegions)
  {
    for (linkedRegionIDNum in linkedRegions[linkedRegionSetNum])
    {
      if (linkedRegions[linkedRegionSetNum][linkedRegionIDNum] == regionID)
      {
        for (linkedRegionIDNum in linkedRegions[linkedRegionSetNum])
        {
          $("#" + linkedRegions[linkedRegionSetNum][linkedRegionIDNum]).css('stroke', regionSelectColor)
        }
      }
    }
  }
}

function mouseLeftRegion(div)
{
  var regionID = getBaseRegionID($(div).attr('id')).baseID
  if (currentRegionID == regionID)
  {
    currentRegionID = null
  }

  if (currentMapState == kViewing)
  {
    $("#stateboxcontainer").trigger('hide')
  }

  $(div).css('stroke', regionDeselectColor)
  for (linkedRegionSetNum in linkedRegions)
  {
    for (linkedRegionIDNum in linkedRegions[linkedRegionSetNum])
    {
      if (linkedRegions[linkedRegionSetNum][linkedRegionIDNum] == regionID)
      {
        for (linkedRegionIDNum in linkedRegions[linkedRegionSetNum])
        {
          $("#" + linkedRegions[linkedRegionSetNum][linkedRegionIDNum]).css('stroke', regionDeselectColor)
        }
      }
    }
  }
}

document.addEventListener('mousemove', function(e) {
  if (currentMapState == kEditing)
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
  if (true)//($("#stateboxcontainer").css('display') != "none")
  {
    $("#stateboxcontainer").css("left", e.pageX+5)
    $("#stateboxcontainer").css("top", e.pageY+5)
  }
})

document.addEventListener('mouseup', function() {
  if (currentMapState == kEditing)
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
