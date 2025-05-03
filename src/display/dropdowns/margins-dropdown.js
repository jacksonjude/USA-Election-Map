var editMarginID = null

const marginsCookieName = "global-margins"

function createMarginEditDropdownItems(shouldSetDefault)
{
  if (shouldSetDefault)
  {
    setCookie(marginsCookieName, JSON.stringify(marginValues))
  }

  $("#marginsDropdownContainer").html("")
  for (var marginID in marginNames)
  {
    if (marginID == "tilt") { continue } // Hardcoding tilt to be excluded
    $("#marginsDropdownContainer").append("<div class='dropdown-separator'></div>")
    $("#marginsDropdownContainer").append("<a id='" + marginID + "-edit' onclick='toggleMarginEditing(\"" + marginID + "\", this)'>" + marginNames[marginID] + "<span style='float: right; font-family: \"Bree5erif-Mono\"'>" + marginValues[marginID] + "</span></a>")
  }
  
  addResetMarginsRow()
}

function toggleMarginEditing(marginID, div)
{
  if (editMarginID)
  {
    var marginValueToSet = parseFloat($("#" + editMarginID + "-text").val()) || defaultMarginValues[editMarginID]
    marginValueToSet = Math.round(marginValueToSet*Math.pow(10, 1))/Math.pow(10, 1)
    if (marginValueToSet > 100)
    {
      marginValueToSet = 100
    }

    var marginIDArray = Object.keys(marginNames)
    if (marginValueToSet < marginValues[marginIDArray[marginIDArray.indexOf(editMarginID)+1]])
    {
      marginValueToSet = marginValues[marginIDArray[marginIDArray.indexOf(editMarginID)+1]]
    }
    if (marginIDArray.indexOf(editMarginID) > 0 && marginValueToSet > marginValues[marginIDArray[marginIDArray.indexOf(editMarginID)-1]])
    {
      marginValueToSet = marginValues[marginIDArray[marginIDArray.indexOf(editMarginID)-1]]
    }

    var shouldRefreshMap = false
    if (marginValueToSet != marginValues[editMarginID])
    {
      shouldRefreshMap = true
    }

    marginValues[editMarginID] = marginValueToSet
    if (shouldRefreshMap && currentMapSource.getCustomDefaultMargins() == null)
    {
      setCookie(marginsCookieName, JSON.stringify(marginValues))
      defaultMarginValues = cloneObject(marginValues)
    }

    if (shouldRefreshMap && showingDataMap)
    {
      displayDataMap()
    }

    $("#" + editMarginID + "-edit").html(marginNames[editMarginID] + "<span style='float: right; font-family: \"Bree5erif-Mono\"'>" + marginValues[editMarginID] + "</span>")
  }

  if (marginID == editMarginID)
  {
    marginID = null
  }
  editMarginID = marginID

  if (marginID)
  {
    $(div).html(marginNames[marginID] + "<input class='textInput' type='text' id='" + marginID + "-text' value='" + marginValues[marginID] + "'>")
    $("#" + marginID + "-text").focus()

    $("#marginEditButton").addClass('active')
  }
  else
  {
    $("#marginEditButton").removeClass('active')
    
    addResetMarginsRow()
  }
}

function addResetMarginsRow()
{
  let standardMargins = currentMapSource.getCustomDefaultMargins() ?? standardMarginValues
  
  let isEqualToStandard = true
  for (const marginID in marginValues)
  {
    if (standardMargins[marginID] != marginValues[marginID])
    {
      isEqualToStandard = false
      break
    }
  }
  if (isEqualToStandard)
  {
    if ($("#reset-margins").length)
    {
      createMarginEditDropdownItems(currentMapSource.getCustomDefaultMargins() == null)
    }
    return
  }
  else if ($("#reset-margins").length)
  {
    return
  }
  
  $("#marginsDropdownContainer").append("<div class='dropdown-separator'></div>")
  $("#marginsDropdownContainer").append("<a id='reset-margins' style='padding-top: 14rem; min-height: 25rem; text-align: center;' onclick='resetMargins()'>Reset</a>")
}

function resetMargins()
{
  marginValues = cloneObject(currentMapSource.getCustomDefaultMargins() ?? standardMarginValues)
  if (currentMapSource.getCustomDefaultMargins() == null)
  {
    setCookie(marginsCookieName, JSON.stringify(marginValues))
    defaultMarginValues = cloneObject(marginValues)
  }
  
  if (showingDataMap)
  {
    displayDataMap()
  }
  
  createMarginEditDropdownItems(currentMapSource.getCustomDefaultMargins() == null)
}