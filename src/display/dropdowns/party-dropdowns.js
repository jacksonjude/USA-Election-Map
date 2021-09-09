var dropdownPoliticalPartyIDs = cloneObject(defaultDropdownPoliticalPartyIDs)
const addButtonPartyID = "ADDPARTY"

const maxPartiesToDisplay = 4
const partyDropdownHeight = 146
const partyDropdownWidth = 212
const partyButtonWidth = 150
const shouldReversePartyDropdownsIfNeeded = true
const shouldAlignPartyDropdownsToLeadingTrailing = true

var editCandidateNamePartyID = null

function createPartyDropdowns()
{
  if (editCandidateNamePartyID)
  {
    toggleCandidateNameEditing(editCandidateNamePartyID, null, true)
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
      dropdownDiv += '<div class="dropdown" style="width: 30px;" onmouseenter="deselectDropdownButton()">'
      dropdownDiv += '<a style="visibility: hidden"></a>'
      dropdownDiv += '</div>'
    }

    if (dropdownPoliticalPartyIDs[partyIDNum] == addButtonPartyID)
    {
      dropdownDiv += '<a id="' + addButtonPartyID + '" class="partyDropdownButton active" onclick="createNewCustomParty()" style="width: ' + partyButtonWidth + 'px; padding: 12px 14px; margin: 0px; background-color: transparent; border: 2px dashed gray; color: gray">' + "+" + '</a>'
      $("#partyDropdownsContainer").append(dropdownDiv)
      continue
    }

    var currentPoliticalParty = politicalParties[dropdownPoliticalPartyIDs[partyIDNum]]
    var marginColors = currentPoliticalParty.getMarginColors()

    dropdownDiv += '<div class="dropdown" onmouseenter="deselectDropdownButton()">'
    dropdownDiv += '<a id="' + currentPoliticalParty.getID() + '" class="partyDropdownButton active" onclick="selectParty(this)" style="width: ' + partyButtonWidth + 'px; height: 51px; display: flex; align-items: center; justify-content: center; padding: 0px 16px; margin: 0px; background-color: ' + marginColors.safe + '; text-overflow: ellipsis">' + currentPoliticalParty.getID() + '</a>'
    dropdownDiv += '<div class="partyDropdownContainer">'

    var shouldReverseOrder = shouldReversePartyDropdownsIfNeeded && dropdownPoliticalPartyIDs.length > 2 && partyIDNum < 2
    var shouldAlignToTrailing = shouldAlignPartyDropdownsToLeadingTrailing && partyIDNum%2 == 1
    dropdownDiv += '<div id="' + currentPoliticalParty.getID() + 'DropdownContent" class="dropdown-content" style="min-width: 200px; ' + (shouldReverseOrder ? 'margin-top: -' + partyDropdownHeight + 'px; ' : '') + (shouldAlignToTrailing ? 'margin-left: -' + ((partyDropdownWidth-(partyButtonWidth+32+1))) + 'px' : '') + '">'
    dropdownDiv += '<div id="' + currentPoliticalParty.getID() + 'DropdownContainer" style="border-radius: 4px; margin-left: 0px; overflow: hidden;">'

    if (!shouldReverseOrder)
    {
      dropdownDiv += '<div class="dropdown-separator"></div>'
    }
    dropdownDiv += '<a class="" onclick="" style="display:flex; justify-content:center;">' + currentPoliticalParty.getNames()[0] + '</a>'
    dropdownDiv += '<div class="dropdown-separator"></div>'
    dropdownDiv += '<a class="' + currentPoliticalParty.getID() + 'ColorPicker" onclick="" style="display:flex; justify-content:center;">'
    for (var marginName in marginColors)
    {
      dropdownDiv += '<button id="' + currentPoliticalParty.getID() + '-' + marginName + '-color-picker" class="partyColorPickerButton" data-jscolor="{preset:\'small dark\', position:\'top\', value:\'' + marginColors[marginName] + '\', onChange:\'updatePartyColor(\\\'' + currentPoliticalParty.getID() + '\\\', \\\'' + marginName + '\\\')\'}" onclick="$(\'#' + currentPoliticalParty.getID() + 'DropdownContent\').css(\'display\', \'block\')"></button>'
    }
    dropdownDiv += '</a>'
    var colorPreset = getKeyByValue(PoliticalPartyColors, currentPoliticalParty.getMarginColors(), true) || 'custom'
    dropdownDiv += '<div class="dropdown-separator"></div>'
    dropdownDiv += '<a id="' + currentPoliticalParty.getID() + '-color-preset" onclick="cyclePartyColorPreset(\'' + currentPoliticalParty.getID() + '\', this, 1)" oncontextmenu="cyclePartyColorPreset(\'' + currentPoliticalParty.getID() + '\', this, -1); return false" style="display:flex; justify-content:center;" data-color-preset="' + colorPreset + '">Preset: ' + colorPreset.toTitle() + '</a>'

    if (shouldReverseOrder)
    {
      dropdownDiv += '<div class="dropdown-separator"></div>'
    }

    dropdownDiv += '</div>'
    dropdownDiv += '</div>'
    dropdownDiv += '</div>'
    dropdownDiv += '</div>'

    $("#partyDropdownsContainer").append(dropdownDiv)
  }
  $("#partyDropdownsContainer").append("</div>")

  for (var partyIDNum in dropdownPoliticalPartyIDs)
  {
    $("#" + dropdownPoliticalPartyIDs[partyIDNum]).hover(function() {
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
}

function updatePartyColor(partyID, margin)
{
  var party = politicalParties[partyID]
  var marginColors = party.getMarginColors()
  marginColors[margin] = $("#" + partyID + "-" + margin + "-color-picker")[0].getAttribute('data-current-color')
  party.setMarginColors(marginColors)

  $("#" + partyID + "-color-preset").data("color-preset", "custom")
  $("#" + partyID + "-color-preset").html("Preset: " + "custom".toTitle())

  displayDataMap()
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
  if (currentMapState != MapState.editing)
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

    var marginColors = politicalParties[this.id].getMarginColors()
    $(this).css("background-color", marginColors.safe)
  })
}

function deselectAllParties()
{
  $(".partyDropdownButton").each(function() {
    $(this).removeClass('active')

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

  if (currentMapState == MapState.editing)
  {
    if (selectedParty != null)
    {
      var selectedPartyDiv = $("#" + selectedParty.getID())
      var marginColors = selectedParty.getMarginColors()
      $("#" + selectedParty.getID()).removeClass('active')

      if (!selectedPartyDiv.hasClass("hover"))
      {
        selectedPartyDiv.css("background-color", multiplySaturation(marginColors.safe, 0.5))
      }
      else
      {
        selectedPartyDiv.css("background-color", multiplySaturation(marginColors.safe, 0.8))
      }
    }

    if (selectedParty != null && selectedParty.getID() == partyID)
    {
      selectedParty = null
      $(div).removeClass('active')

      if (partyID == null || partyID == TossupParty.getID()) { return }

      var marginColors = politicalParties[partyID].getMarginColors()
      if (!$(div).hasClass("hover"))
      {
        $(div).css("background-color", multiplySaturation(marginColors.safe, 0.5))
      }
      else
      {
        $(div).css("background-color", multiplySaturation(marginColors.safe, 0.8))
      }
    }
    else
    {
      selectedParty = politicalParties[partyID]
      $(div).addClass('active')

      if (partyID == null || partyID == TossupParty.getID()) { return }

      var marginColors = politicalParties[partyID].getMarginColors()
      $(div).css("background-color", marginColors.safe)
    }

    if (selectedParty == null || selectedParty == TossupParty)
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
  else if (currentMapState == MapState.viewing && currentMapSource.getID() == currentCustomMapSource.getID())
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
    if (candidateNameToSet == "")
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
    if (currentMapSource.getID() == currentCustomMapSource.getID())
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
    if (currentMapSource.getID() != currentCustomMapSource.getID() || currentMapState == MapState.editing || dropdownPoliticalPartyIDs.includes(addButtonPartyID) || dropdownPoliticalPartyIDs.length >= maxPartiesToDisplay) { return }

    dropdownPoliticalPartyIDs.push(addButtonPartyID)
    displayPartyTotals(getPartyTotals(), true)
  }, function() {
    if (currentMapSource.getID() != currentCustomMapSource.getID() || currentMapState == MapState.editing || !dropdownPoliticalPartyIDs.includes(addButtonPartyID)) { return }

    dropdownPoliticalPartyIDs.splice(dropdownPoliticalPartyIDs.indexOf(addButtonPartyID), 1)
    displayPartyTotals(getPartyTotals(), true)
  })
}

function createNewCustomParty()
{
  // Find first color which is not already in use by another dropdown party; Default to "gray"
  var colorIDToUse = Object.keys(PoliticalPartyColors).find(colorID => !dropdownPoliticalPartyIDs.some(partyID => politicalParties[partyID] != null && JSON.stringify(politicalParties[partyID].getMarginColors()) == JSON.stringify(PoliticalPartyColors[colorID]))) || "gray"

  var customPoliticalParty = new PoliticalParty(
    "CUSTOM" + dropdownPoliticalPartyIDs.reduce((customCount, partyID) => customCount + (partyID.startsWith("CUSTOM") ? 1 : 0), 0),
    ["Custom"],
    "Custom",
    "Custom",
    cloneObject(PoliticalPartyColors[colorIDToUse]),
    defaultMarginNames
  )

  politicalParties[customPoliticalParty.getID()] = customPoliticalParty
  dropdownPoliticalPartyIDs.push(customPoliticalParty.getID())

  var currentCandidateNames = currentMapSource.getCandidateNames(getCurrentDateOrToday())
  currentCandidateNames[customPoliticalParty.getID()] = customPoliticalParty.getCandidateName()
  currentMapSource.setCandidateNames(currentCandidateNames, currentSliderDate.getTime())

  displayPartyTotals(getPartyTotals(), true)
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
    else if (topPartyIDs.length == 2 && topPartyIDs[1] == DemocraticParty.getID() && topPartyIDs[0] == RepublicanParty.getID() && partyTotals[RepublicanParty.getID()] == 0)
    {
      topPartyIDs = defaultDropdownPoliticalPartyIDs
    }

    if (JSON.stringify(topPartyIDs) != JSON.stringify(dropdownPoliticalPartyIDs) || overrideCreateDropdowns)
    {
      dropdownPoliticalPartyIDs = cloneObject(topPartyIDs)
      createPartyDropdowns()
    }
  }
  else if ((currentMapSource.getID() == currentCustomMapSource.getID() && currentMapState != MapState.editing) || overrideCreateDropdowns)
  {
    var sortedDropdownPartyIDs = cloneObject(dropdownPoliticalPartyIDs).sort((party1, party2) => {
      if (party1 == addButtonPartyID) { return 1 }
      if (party2 == addButtonPartyID) { return -1 }
      return partyTotals[party2]-partyTotals[party1]
    }).slice(0, maxPartiesToDisplay)
    if (JSON.stringify(sortedDropdownPartyIDs) != JSON.stringify(dropdownPoliticalPartyIDs) || overrideCreateDropdowns)
    {
      dropdownPoliticalPartyIDs = cloneObject(sortedDropdownPartyIDs)
      createPartyDropdowns()
    }
  }

  for (var partyIDNum in dropdownPoliticalPartyIDs)
  {
    if (politicalParties[dropdownPoliticalPartyIDs[partyIDNum]] == null) { continue }
    $("#" + dropdownPoliticalPartyIDs[partyIDNum]).html(politicalParties[dropdownPoliticalPartyIDs[partyIDNum]].getCandidateName() + " (" + (partyTotals[dropdownPoliticalPartyIDs[partyIDNum]] || 0) + ")")
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
