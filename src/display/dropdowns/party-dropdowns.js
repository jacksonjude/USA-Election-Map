var dropdownPoliticalPartyIDs = cloneObject(defaultDropdownPoliticalPartyIDs)
const addButtonPartyID = "ADDPARTY"
const customPartyIDPrefix = "CUSTOM"

const maxPartiesToDisplay = 4
const partyDropdownHeightExtended = 158
const partyDropdownHeight = 119
const partyDropdownWidth = 195
const partyButtonWidth = browserName != "Firefox" ? 195 : 170
const shouldReversePartyDropdownsIfNeeded = true
const shouldAlignPartyDropdownsToLeadingTrailing = true

var editCandidateNamePartyID = null
var editPartyMarginColor = null

function createPartyDropdowns()
{
  if (editCandidateNamePartyID)
  {
    toggleCandidateNameEditing(editCandidateNamePartyID, null, true)
  }
  if (editPartyMarginColor)
  {
    toggleMarginHexColorEditing()
  }

  $("#partyDropdownsContainer").html("")
  for (var partyIDNum in dropdownPoliticalPartyIDs)
  {
    var dropdownDiv = ""

    if (partyIDNum != 0 && partyIDNum%2 == 0)
    {
      dropdownDiv += "<br><br>"
    }
    else if (partyIDNum%2 == 1)
    {
      dropdownDiv += '<div class="dropdown" style="width: 15px;" onmouseenter="deselectDropdownButton()">'
      dropdownDiv += '<a style="visibility: hidden"></a>'
      dropdownDiv += '</div>'
    }

    if (dropdownPoliticalPartyIDs[partyIDNum] == addButtonPartyID)
    {
      dropdownDiv += '<a id="' + addButtonPartyID + '" class="partyDropdownButton active" onclick="createNewCustomParty()" style="width: ' + (0.98*partyButtonWidth) + 'px; padding: 12px 0px; margin: 0px; background-color: transparent; border: 2px dashed gray; color: gray; transition: all .1s linear">' + "+" + '</a>'
      $("#partyDropdownsContainer").append(dropdownDiv)
      continue
    }

    var currentPoliticalParty = politicalParties[dropdownPoliticalPartyIDs[partyIDNum]]
    var marginColors = currentPoliticalParty.getMarginColors()

    dropdownDiv += '<div id="' + currentPoliticalParty.getID() + 'Dropdown" class="dropdown" onmouseenter="deselectDropdownButton()">'
    dropdownDiv += '<a id="' + currentPoliticalParty.getID() + '" class="partyDropdownButton active" onclick="selectParty(this)" style="width: ' + partyButtonWidth + 'px; height: 51px; display: flex; align-items: center; justify-content: center; padding: 0px 0px; margin: 0px; background-color: ' + marginColors.safe + '; text-overflow: ellipsis">' + currentPoliticalParty.getID() + '</a>'
    dropdownDiv += '<div class="partyDropdownContainer">'

    var shouldReverseOrder = shouldReversePartyDropdownsIfNeeded && dropdownPoliticalPartyIDs.length > 2 && partyIDNum < 2
    var shouldAlignToTrailing = shouldAlignPartyDropdownsToLeadingTrailing && partyIDNum%2 == 1
    dropdownDiv += '<div id="' + currentPoliticalParty.getID() + 'DropdownContent" class="dropdown-content" style="width: ' + partyDropdownWidth + 'px; ' + (shouldReverseOrder ? 'margin-top: -' + ((currentMapSource.isCustom() && currentMapType.getCustomMapEnabled()) ? partyDropdownHeightExtended : partyDropdownHeight) + 'px; ' : '') + (shouldAlignToTrailing ? 'margin-left: -' + ((partyDropdownWidth-(partyButtonWidth+32+1))) + 'px' : '') + '">'
    dropdownDiv += '<div id="' + currentPoliticalParty.getID() + 'DropdownContainer" style="border-radius: 4px; margin-left: 0px; overflow: hidden;">'

    if (!shouldReverseOrder)
    {
      dropdownDiv += '<div class="dropdown-separator"></div>'
    }
    dropdownDiv += '<a style="display:flex; justify-content:center; padding: 8px 0px;">' + currentPoliticalParty.getNames()[0] + '</a>'
    dropdownDiv += '<div class="dropdown-separator"></div>'

    dropdownDiv += createPartyMarginColorPickers(currentPoliticalParty.getID())
    dropdownDiv += '<div class="dropdown-separator"></div>'

    var colorPreset = getKeyByValue(PoliticalPartyColors, currentPoliticalParty.getMarginColors(), true) || 'custom'
    dropdownDiv += '<a id="' + currentPoliticalParty.getID() + '-color-preset" onclick="cyclePartyColorPreset(\'' + currentPoliticalParty.getID() + '\', this, 1)" oncontextmenu="cyclePartyColorPreset(\'' + currentPoliticalParty.getID() + '\', this, -1); return false" style="display:flex; justify-content:center; padding: 8px 0px;" data-color-preset="' + colorPreset + '">Preset: ' + colorPreset.toTitle() + '</a>'

    if (currentMapSource.isCustom() && currentMapType.getCustomMapEnabled())
    {
      dropdownDiv += '<div class="dropdown-separator"></div>'

      dropdownDiv += '<a onclick="deleteParty(\'' + currentPoliticalParty.getID() + '\')" class="deletebutton" style="display:flex; justify-content:center; padding: 8px 0px">Delete</a>'
    }

    if (shouldReverseOrder)
    {
      dropdownDiv += '<div class="dropdown-separator"></div>'
    }

    dropdownDiv += '</div>'
    dropdownDiv += '</div>'
    dropdownDiv += '</div>'
    dropdownDiv += '</div>'

    $("#partyDropdownsContainer").append(dropdownDiv)

    $("#" + currentPoliticalParty.getID() + "Dropdown").hover(function() {

    }, function() {
      if ($(this).find(".jscolor-active").length > 0)
      {
        $(this).find(".dropdown-content").css("display", "block")
      }
    })
  }
  $("#partyDropdownsContainer").append("</div>")

  for (var partyIDNum in dropdownPoliticalPartyIDs)
  {
    $("#" + dropdownPoliticalPartyIDs[partyIDNum]).hover(function() {
      if (this.id == addButtonPartyID)
      {
        $(this).css("border-color", "#bbb")
        $(this).css("color", "#bbb")
      }
      if (politicalParties[this.id] == null) { return }

      var marginColors = politicalParties[this.id].getMarginColors()
      var partyButton = $(this)

      if (!partyButton.hasClass("active"))
      {
        partyButton.css("background-color", multiplySaturation(marginColors.safe, 0.8))
      }
      else
      {
        partyButton.css("background-color", marginColors.safe)
      }

      partyButton.addClass("hover")
    }, function() {
      if (this.id == addButtonPartyID)
      {
        $(this).css("border-color", "gray")
        $(this).css("color", "gray")
      }
      if (politicalParties[this.id] == null) { return }

      var marginColors = politicalParties[this.id].getMarginColors()
      var partyButton = $(this)

      if (!partyButton.hasClass("active"))
      {
        partyButton.css("background-color", multiplySaturation(marginColors.safe, 0.5))
      }
      else
      {
        partyButton.css("background-color", marginColors.safe)
      }

      partyButton.removeClass("hover")
    })
  }

  jscolor.install()

  let previousSelectedPartyID = selectedParty ? selectedParty.getID() : null
  if (currentEditingState == EditingState.editing)
  {
    deselectAllParties()
    if (previousSelectedPartyID != null && dropdownPoliticalPartyIDs.includes(previousSelectedPartyID))
    {
      selectParty($("#" + previousSelectedPartyID))
    }
  }
}

function createPartyMarginColorPickers(partyID)
{
  var marginColors = politicalParties[partyID].getMarginColors()
  var pickersDiv = '<a id="' + partyID + '-color-pickers" style="display:flex; justify-content:center; align-items:center; padding: 0px 0px; height: 39px">'
  for (var marginName in marginColors)
  {
    pickersDiv += '<button id="' + partyID + '-' + marginName + '-color-picker" class="partyColorPickerButton" data-jscolor="{preset:\'small dark\', position:\'top\', value:\'' + marginColors[marginName] + '\', onChange:\'updatePartyColor(\\\'' + partyID + '\\\', \\\'' + marginName + '\\\')\'}" oncontextmenu="toggleMarginHexColorEditing(\'' + partyID + '\', \'' + marginName + '\'); jscolor.hide(); return false;"></button>'
  }
  pickersDiv += '</a>'
  return pickersDiv
}

async function updatePartyColor(partyID, margin, newColor)
{
  var party = politicalParties[partyID]
  var marginColors = party.getMarginColors()
  newColor = newColor || $("#" + partyID + "-" + margin + "-color-picker")[0].getAttribute('data-current-color')
  marginColors[margin] = newColor
  party.setMarginColors(marginColors)

  $("#" + partyID + "-color-preset").data("color-preset", "custom")
  $("#" + partyID + "-color-preset").html("Preset: " + "custom".toTitle())

  $("#" + partyID).css("background-color", marginColors.safe)

  await displayDataMap()
}

async function toggleMarginHexColorEditing(partyID, margin)
{
  if (editPartyMarginColor)
  {
    var currentMarginColor = politicalParties[editPartyMarginColor.partyID].getMarginColors()[editPartyMarginColor.margin]
    var marginColorToSet = $("#" + editPartyMarginColor.partyID + "-hex-color-text").val()
    if (!marginColorToSet.startsWith("#"))
    {
      marginColorToSet = "#" + marginColorToSet
    }
    if (!/#([0-9a-fA-F]{3})\1?/.test(marginColorToSet))
    {
      marginColorToSet = currentMarginColor
    }

    if (marginColorToSet != currentMarginColor)
    {
      await updatePartyColor(editPartyMarginColor.partyID, editPartyMarginColor.margin, marginColorToSet)
    }

    $("#" + editPartyMarginColor.partyID + "-color-pickers").replaceWith(createPartyMarginColorPickers(editPartyMarginColor.partyID))
    jscolor.install()
  }

  if (editPartyMarginColor != null && partyID == editPartyMarginColor.partyID)
  {
    partyID = null
  }
  editPartyMarginColor = partyID ? {partyID: partyID, margin: margin} : null

  if (partyID)
  {
    $("#" + partyID + "-color-pickers").html("<input class='textInput' style='float: none; position: inherit; max-width: 90%; text-align: center' type='text' id='" + partyID + "-hex-color-text' value='" + politicalParties[partyID].getMarginColors()[margin] + "'>")
    $("#" + partyID + "-hex-color-text").focus().select()
  }
}

function cyclePartyColorPreset(partyID, div, incrementAmount)
{
  var currentPresetID = $(div).data("color-preset")

  var presetIDArray = Object.keys(PoliticalPartyColors)
  var nextPresetID = presetIDArray[(presetIDArray.indexOf(currentPresetID) || 0)+incrementAmount] || presetIDArray[incrementAmount > 0 ? 0 : presetIDArray.length-1]

  $(div).data("color-preset", nextPresetID)
  $(div).html("Preset: " + nextPresetID.toTitle())

  for (var marginName in PoliticalPartyColors[nextPresetID])
  {
    $("#" + partyID + "-" + marginName + "-color-picker")[0].jscolor.fromString(PoliticalPartyColors[nextPresetID][marginName])
  }

  $("#" + partyID).css("background-color", PoliticalPartyColors[nextPresetID].safe)

  politicalParties[partyID].setMarginColors(cloneObject(PoliticalPartyColors[nextPresetID]))

  displayDataMap()
}

function updatePartyDropdownVisibility()
{
  if (currentEditingState != EditingState.editing)
  {
    $(".partyDropdownContainer").each(function() {
      $(this).css("display", "block")
    })
  }
  else
  {
    $(".partyDropdownContainer").each(function() {
      $(this).css("display", "none")
    })
  }
}

function selectAllParties()
{
  $(".partyDropdownButton").each(function() {
    $(this).addClass('active')

    if (politicalParties[this.id] == null) { return }

    var marginColors = politicalParties[this.id].getMarginColors()
    $(this).css("background-color", marginColors.safe)
  })
}

function deselectAllParties()
{
  $(".partyDropdownButton").each(function() {
    $(this).removeClass('active')

    if (politicalParties[this.id] == null) { return }

    var marginColors = politicalParties[this.id].getMarginColors()
    if (!$(this).hasClass("hover"))
    {
      $(this).css("background-color", multiplySaturation(marginColors.safe, 0.5))
    }
    else
    {
      $(this).css("background-color", multiplySaturation(marginColors.safe, 0.8))
    }
  })
  selectedParty = null

  $(".partyShiftConstantButton").css('color', "gray")
  $(".partyShiftText").css('color', "gray")
}

function selectParty(div)
{
  var partyID = $(div).attr('id')

  if (currentEditingState == EditingState.editing)
  {
    let previousSelectedPartyID = selectedParty ? selectedParty.getID() : null
    if (selectedParty != null)
    {
      deselectAllParties()
    }

    if (previousSelectedPartyID != partyID)
    {
      selectedParty = politicalParties[partyID]
      $(div).addClass('active')

      var marginColors = politicalParties[partyID].getMarginColors()
      $(div).css("background-color", marginColors.safe)
    }

    if (!selectedParty)
    {
      $(".partyShiftConstantButton").css('color', "gray")
      $(".partyShiftText").css('color', "gray")
    }
    else
    {
      $(".partyShiftConstantButton").css('color', "white")
      $(".partyShiftText").css('color', selectedParty.getMarginColors().likely)
    }
  }
  else if (currentEditingState == EditingState.viewing && currentMapSource.isCustom() && currentMapType.getCustomMapEnabled())
  {
    toggleCandidateNameEditing(partyID, div)
  }
}

async function toggleCandidateNameEditing(partyID, div, skipReload)
{
  var shouldRefreshMap = false

  if (editCandidateNamePartyID)
  {
    var currentCandidateNames = currentMapSource.getCandidateNames(getCurrentDateOrToday())
    var candidateNameToSet = $("#" + editCandidateNamePartyID + "-candidate-text").val()
    if (candidateNameToSet == "" || Object.values(currentCandidateNames).includes(candidateNameToSet))
    {
      candidateNameToSet = currentCandidateNames[editCandidateNamePartyID]
    }

    if (candidateNameToSet != currentCandidateNames[editCandidateNamePartyID])
    {
      currentCandidateNames[editCandidateNamePartyID] = candidateNameToSet
      currentMapSource.setCandidateNames(currentCandidateNames, currentSliderDate.getTime())
      shouldRefreshMap = true
    }
  }

  if (partyID == editCandidateNamePartyID)
  {
    partyID = null
  }
  editCandidateNamePartyID = partyID

  displayPartyTotals(getPartyTotals())
  if (shouldRefreshMap && showingDataMap && !skipReload)
  {
    if (currentMapSource.isCustom() && currentMapType.getCustomMapEnabled())
    {
      currentCustomMapSource.updateMapData(displayRegionDataArray, getCurrentDateOrToday(), false, currentMapSource.getCandidateNames(getCurrentDateOrToday()))
      await loadDataMap(null, null, null, false)
    }
    else
    {
      await displayDataMap()
    }
  }

  if (partyID)
  {
    $(div).html("<input class='textInput' style='float: none; position: inherit; max-width: 90%; text-align: center' type='text' id='" + partyID + "-candidate-text' value='" + currentMapSource.getCandidateNames(getCurrentDateOrToday())[partyID] + "'>")
    $("#" + partyID + "-candidate-text").focus().select()
  }
}

function createPartyDropdownsBoxHoverHandler()
{
  $("#partyDropdownsBox").hover(function() {
    if (!(currentMapSource.isCustom() && currentMapType.getCustomMapEnabled()) || currentEditingState == EditingState.editing || dropdownPoliticalPartyIDs.includes(addButtonPartyID) || dropdownPoliticalPartyIDs.length >= maxPartiesToDisplay) { return }

    dropdownPoliticalPartyIDs.push(addButtonPartyID)
    $("#partyDropdownsBox").addClass("showingAddPartyButton")
    displayPartyTotals(getPartyTotals(), true)
  }, function() {
    if (!dropdownPoliticalPartyIDs.includes(addButtonPartyID) || $("#partyDropdownsBox").find(".jscolor-active").length > 0) { return }

    dropdownPoliticalPartyIDs.splice(dropdownPoliticalPartyIDs.indexOf(addButtonPartyID), 1)
    $("#partyDropdownsBox").removeClass("showingAddPartyButton")
    displayPartyTotals(getPartyTotals(), true)
  })
}

function createNewCustomParty()
{
  // Find first color which is not already in use by another dropdown party; Default to "gray"
  var colorIDToUse = Object.keys(PoliticalPartyColors).find(colorID => !dropdownPoliticalPartyIDs.some(partyID => politicalParties[partyID] != null && JSON.stringify(politicalParties[partyID].getMarginColors()) == JSON.stringify(PoliticalPartyColors[colorID]))) || "gray"

  var customPartyNumber = 1
  while (Object.keys(politicalParties).includes(customPartyIDPrefix + customPartyNumber))
  {
    customPartyNumber++
  }

  var customPoliticalParty = new PoliticalParty(
    customPartyIDPrefix + customPartyNumber,
    ["Custom"],
    "Custom",
    "Custom" + (customPartyNumber == 1 ? "" : " " + customPartyNumber),
    cloneObject(PoliticalPartyColors[colorIDToUse]),
    defaultMarginNames
  )

  politicalParties[customPoliticalParty.getID()] = customPoliticalParty
  dropdownPoliticalPartyIDs.push(customPoliticalParty.getID())

  var currentCandidateNames = currentMapSource.getCandidateNames(getCurrentDateOrToday())
  currentCandidateNames[customPoliticalParty.getID()] = customPoliticalParty.getCandidateName()
  currentMapSource.setCandidateNames(currentCandidateNames, currentSliderDate.getTime())

  currentMapSource.setDropdownPartyIDs(cloneObject(dropdownPoliticalPartyIDs))

  displayPartyTotals(getPartyTotals(), true)
}

async function deleteParty(partyID)
{
  dropdownPoliticalPartyIDs.splice(dropdownPoliticalPartyIDs.indexOf(partyID), 1)

  var currentCandidateNames = currentMapSource.getCandidateNames(getCurrentDateOrToday())
  if (partyID.startsWith(customPartyIDPrefix))
  {
    delete politicalParties[partyID]
    delete currentCandidateNames[partyID]
  }

  for (var regionID in displayRegionDataArray)
  {
    if (displayRegionDataArray[regionID].partyID == partyID)
    {
      displayRegionDataArray[regionID].margin = 0
      displayRegionDataArray[regionID].partyID = TossupParty.getID()
    }
  }

  currentMapSource.setDropdownPartyIDs(cloneObject(dropdownPoliticalPartyIDs))

  currentCustomMapSource.updateMapData(displayRegionDataArray, getCurrentDateOrToday(), false, currentCandidateNames)
  await loadDataMap(null, null, null, false)
}

function displayPartyTotals(partyTotals, overrideCreateDropdowns)
{
  if (currentMapSource.getID() != NullMapSource.getID() && currentMapSource.getID() != currentCustomMapSource.getID())
  {
    var partyIDs = Object.keys(partyTotals).filter((partyID) => !(partyTotals[partyID] == 0 || partyID == TossupParty.getID()))

    var topPartyIDs = partyIDs.sort((party1, party2) => partyTotals[party2]-partyTotals[party1]).slice(0, maxPartiesToDisplay)

    if (topPartyIDs.length == 0)
    {
      topPartyIDs = defaultDropdownPoliticalPartyIDs
    }

    if (JSON.stringify(topPartyIDs) != JSON.stringify(dropdownPoliticalPartyIDs) || overrideCreateDropdowns)
    {
      dropdownPoliticalPartyIDs = cloneObject(topPartyIDs)
      createPartyDropdowns()
    }
  }
  else if ((currentMapSource.isCustom() && currentMapType.getCustomMapEnabled() && currentEditingState != EditingState.editing) || overrideCreateDropdowns)
  {
    if (currentMapSource.getDropdownPartyIDs() != null)
    {
      dropdownPoliticalPartyIDs = cloneObject(currentMapSource.getDropdownPartyIDs())
    }
    if (!dropdownPoliticalPartyIDs.includes(addButtonPartyID) && $("#partyDropdownsBox").hasClass("showingAddPartyButton") && currentEditingState != EditingState.editing)
    {
      dropdownPoliticalPartyIDs.push(addButtonPartyID)
    }
    dropdownPoliticalPartyIDs = dropdownPoliticalPartyIDs.slice(0, maxPartiesToDisplay)

    var sortedDropdownPartyIDs = cloneObject(dropdownPoliticalPartyIDs).sort((party1, party2) => {
      if (party1 == addButtonPartyID) { return 1 }
      if (party2 == addButtonPartyID) { return -1 }
      return partyTotals[party2]-partyTotals[party1]
    }).slice(0, maxPartiesToDisplay)
    if (JSON.stringify(sortedDropdownPartyIDs) != JSON.stringify(dropdownPoliticalPartyIDs) || overrideCreateDropdowns)
    {
      dropdownPoliticalPartyIDs = cloneObject(sortedDropdownPartyIDs)
      currentMapSource.setDropdownPartyIDs(cloneObject(dropdownPoliticalPartyIDs))
      createPartyDropdowns()
    }
  }

  for (var partyIDNum in dropdownPoliticalPartyIDs)
  {
    if (politicalParties[dropdownPoliticalPartyIDs[partyIDNum]] == null) { continue }
    $("#" + dropdownPoliticalPartyIDs[partyIDNum]).html(politicalParties[dropdownPoliticalPartyIDs[partyIDNum]].getCandidateName() + " (<span style='font-weight: bold'>" + (partyTotals[dropdownPoliticalPartyIDs[partyIDNum]] || 0) + "</span>)")
  }
}

function updatePoliticalPartyCandidateNames(mapDate)
{
  var candidateNames = currentMapSource.getCandidateNames(mapDate)

  if (!candidateNames)
  {
    console.log("No candidate names found!")
    return
  }

  for (var partyID in politicalParties)
  {
    if (partyID in candidateNames)
    {
      politicalParties[partyID].setCandidateName(candidateNames[partyID])
    }
  }
}
