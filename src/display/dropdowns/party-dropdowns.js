var dropdownPoliticalPartyIDs = defaultDropdownPoliticalPartyIDs
const maxPartiesToDisplay = 4
const partyDropdownHeight = 98
const partyDropdownWidth = 212
const partyButtonWidth = 150
const shouldReversePartyDropdownsIfNeeded = true
const shouldAlignPartyDropdownsToLeadingTrailing = true

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
  })
}

function deselectAllParties()
{
  $(".partyDropdownButton").each(function() {
    $(this).removeClass('active')
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
      $("#" + selectedParty.getID()).removeClass('active')
    }

    if (selectedParty != null && selectedParty.getID() == partyID)
    {
      selectedParty = null
      $(div).removeClass('active')
    }
    else
    {
      selectedParty = politicalParties[partyID]
      $(div).addClass('active')
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

    if (topPartyIDs != dropdownPoliticalPartyIDs)
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
