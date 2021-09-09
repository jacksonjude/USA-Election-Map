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

    var divStringToAppend = "<a onclick='setMapType(\"" + typeID + "\")' style='padding: 0; padding-left: 3px; padding-right: 3px; margin-top: 0px;'>"
    divStringToAppend += "<img src='" + mapType.getIconURL() + "' style='position: relative; top: 2px; padding-top: 1px; width: 45px; height: 45px;'/>"
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
  setCookie("currentMapType", currentMapType.getID())

  $(buttonDiv || "#cycleMapTypeButton").find("img").attr('src', currentMapType.getIconURL())

  reloadForNewMapType()
}
