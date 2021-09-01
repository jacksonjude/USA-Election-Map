function createPartyDropdowns()
{
  $("#partyDropdownsContainer").html("")
  for (var partyIDNum in dropdownPoliticalPartyIDs)
  {
    var currentPoliticalParty = politicalParties[dropdownPoliticalPartyIDs[partyIDNum]]
    var marginColors = currentPoliticalParty.getMarginColors()

    var dropdownDiv = '<div class="dropdown" onmouseenter="deselectDropdownButton()">'
    dropdownDiv += '<a id="' + currentPoliticalParty.getID() + '" class="partyDropdownButton active" onclick="selectParty(this)" style="width: 135px">' + currentPoliticalParty.getID() + '</a>'
    dropdownDiv += '<div class="partyDropdownContainer">'
    dropdownDiv += '<div id="' + currentPoliticalParty.getID() + 'DropdownContent" class="dropdown-content" style="min-width: 200px">'
    dropdownDiv += '<div id="' + currentPoliticalParty.getID() + 'DropdownContainer" style="border-radius: 4px; margin-left: 4px; overflow: hidden;">'
    dropdownDiv += '<div class="dropdown-separator"></div>'
    dropdownDiv += '<a class="" onclick="" style="display:flex; justify-content:center;">' + currentPoliticalParty.getNames()[0] + '</a>'
    dropdownDiv += '<div class="dropdown-separator"></div>'
    dropdownDiv += '<a class="' + currentPoliticalParty.getID() + 'ColorPicker" onclick="" style="display:flex; justify-content:center;">'
    for (var marginName in marginColors)
    {
      dropdownDiv += '<button id="' + currentPoliticalParty.getID() + '-' + marginName + '-color-picker" class="partyColorPickerButton" data-jscolor="{preset:\'small dark\', position:\'top\', value:\'' + marginColors[marginName] + '\', onChange:\'updatePartyColor(\\\'' + currentPoliticalParty.getID() + '\\\', \\\'' + marginName + '\\\')\'}" onclick="$(\'#' + currentPoliticalParty.getID() + 'DropdownContent\').css(\'display\', \'block\')"></button>'
    }
    dropdownDiv += '</a>'
    dropdownDiv += '</div>'
    dropdownDiv += '</div>'
    dropdownDiv += '</div>'
    dropdownDiv += '</div>'

    $("#partyDropdownsContainer").append(dropdownDiv)
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

function updatePartyDropdownVisibility()
{
  if (currentMapState != kEditing && currentMapSource.getID() == currentCustomMapSource.getID())
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
  if (currentMapState == kEditing)
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
  for (var partyID in partyTotals)
  {
    $("#" + partyID).html(politicalParties[partyID].getCandidateName() + " (" + partyTotals[partyID] + ")")
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
