function createMapTypeDropdownItems()
{
  $("#mapTypesDropdownContainer").html("")

  var dropdownMapTypeIDs = cloneObject(mapTypeIDs)
  //moveLastToFirst(dropdownMapTypeIDs, mapTypeIDs.length-mapTypeIDs.indexOf(currentMapType.getID()))

  for (var typeIndex in dropdownMapTypeIDs)
  {
    var typeID = dropdownMapTypeIDs[typeIndex]
    if (currentMapType.getID() == typeID) { continue }

    $("#mapTypesDropdownContainer").append("<div class='dropdown-separator'></div>")

    var mapType = mapTypes[typeID]

    var divStringToAppend = "<a onclick='setMapType(\"" + typeID + "\")' style='display: flex; padding: 0; margin-top: 0;'>"
    divStringToAppend += "<img src='" + mapType.getIconURL() + "' style='width: 43px; height: 43px; padding: 3px;'/>"
    divStringToAppend += "</a>"

    $("#mapTypesDropdownContainer").append(divStringToAppend)
  }
}

function cycleMapType(buttonDiv)
{
  var newMapTypeIndex = mapTypeIDs.indexOf(currentMapType.getID())+1
  if (newMapTypeIndex >= mapTypeIDs.length || newMapTypeIndex < 0)
  {
    newMapTypeIndex = 0
  }

  setMapType(mapTypeIDs[newMapTypeIndex], buttonDiv)
}

function setMapType(newMapTypeID, buttonDiv)
{
  currentMapType = mapTypes[newMapTypeID]
  setCookie(`${currentMapCountry.getID()}-currentMapType`, currentMapType.getID())

  $(buttonDiv || "#cycleMapTypeButton").find("img").attr('src', currentMapType.getIconURL())

  reloadForNewMapType()
}
