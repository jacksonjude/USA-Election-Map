var dropdownPoliticalPartyIDs = defaultDropdownPoliticalPartyIDs
const maxPartiesToDisplay = 4
const partyDropdownHeight = 146
const partyDropdownWidth = 212
const partyButtonWidth = 150
const shouldReversePartyDropdownsIfNeeded = true
const shouldAlignPartyDropdownsToLeadingTrailing = true

var editCandidateNamePartyID = null

function createPartyDropdowns()
{
  $("#partyDropdownsContainer").html("")
  for (var partyIDNum in dropdownPoliticalPartyIDs)
  {
    var currentPoliticalParty = politicalParties[dropdownPoliticalPartyIDs[partyIDNum]]
    var marginColors = currentPoliticalParty.getMarginColors()

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

    dropdownDiv += '<div class="dropdown" onmouseenter="deselectDropdownButton()">'
    dropdownDiv += '<a id="' + currentPoliticalParty.getID() + '" class="partyDropdownButton active" onclick="selectParty(this)" style="width: ' + partyButtonWidth + 'px; margin: 0px; background-color: ' + marginColors.safe + '">' + currentPoliticalParty.getID() + '</a>'
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
    var colorPreset = getKeyByValue(PoliticalPartyColors, currentPoliticalParty.getMarginColors()) || 'custom'
    dropdownDiv += '<div class="dropdown-separator"></div>'
    dropdownDiv += '<a onclick="cyclePartyColorPreset(\'' + currentPoliticalParty.getID() + '\', this, 1)" oncontextmenu="cyclePartyColorPreset(\'' + currentPoliticalParty.getID() + '\', this, -1); return false" style="display:flex; justify-content:center;" data-color-preset="' + colorPreset + '">Preset: ' + colorPreset + '</a>'

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

  displayDataMap()
}

function cyclePartyColorPreset(partyID, div, incrementAmount)
{
  var currentPresetID = $(div).data("color-preset")

  var presetIDArray = Object.keys(PoliticalPartyColors)
  var nextPresetID = presetIDArray[(presetIDArray.indexOf(currentPresetID) || 0)+incrementAmount] || presetIDArray[incrementAmount > 0 ? 0 : presetIDArray.length-1]

  $(div).data("color-preset", nextPresetID)
  $(div).html("Preset: " + nextPresetID)

  for (var marginName in PoliticalPartyColors[nextPresetID])
  {
    $("#" + partyID + "-" + marginName + "-color-picker")[0].jscolor.fromString(PoliticalPartyColors[nextPresetID][marginName])
  }

  $("#" + partyID).css("background-color", PoliticalPartyColors[nextPresetID].safe)

  politicalParties[partyID].setMarginColors(PoliticalPartyColors[nextPresetID])

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
  if (currentMapState == MapState.editing)
  {
    var partyID = $(div).attr('id')

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
}

function displayPartyTotals(partyTotals)
{
  if (currentMapSource.getID() != NullMapSource.getID() && currentMapSource.getID() != currentCustomMapSource.getID())
  {
    var partyIDs = Object.keys(partyTotals).filter((partyID) => !(partyTotals[partyID] == 0 || partyID == TossupParty.getID()))

    var topPartyIDs = partyIDs.sort((party1, party2) => partyTotals[party2]-partyTotals[party1]).slice(0, maxPartiesToDisplay)

    // Enforce Dems on left, Reps on right
    // if (topPartyIDs.length >= 2 && topPartyIDs[1] == DemocraticParty.getID())
    // {
    //   var tempPartyID = topPartyIDs[0]
    //   topPartyIDs[0] = DemocraticParty.getID()
    //   topPartyIDs[1] = tempPartyID
    // }
    // if (topPartyIDs.length >= 2 && topPartyIDs[0] == RepublicanParty.getID())
    // {
    //   var tempPartyID = topPartyIDs[1]
    //   topPartyIDs[1] = RepublicanParty.getID()
    //   topPartyIDs[0] = tempPartyID
    // }

    // topPartyIDs.sort((party1, party2) => partyOrdering.findIndex((partyOrderInfo) => party1 == partyOrderInfo.partyID)-partyOrdering.findIndex((partyOrderInfo) => party2 == partyOrderInfo.partyID))

    if (topPartyIDs.length == 0)
    {
      topPartyIDs = defaultDropdownPoliticalPartyIDs
    }

    if (JSON.stringify(topPartyIDs) != JSON.stringify(dropdownPoliticalPartyIDs))
    {
      dropdownPoliticalPartyIDs = topPartyIDs
      createPartyDropdowns()
    }
  }

  for (var partyIDNum in dropdownPoliticalPartyIDs)
  {
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
