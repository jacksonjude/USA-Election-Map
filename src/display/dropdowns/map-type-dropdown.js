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

    var divStringToAppend = "<a onclick='setMapType(\"" + typeID + "\")' style='padding: 0; padding-left: 3rem; padding-right: 3rem; margin-top: 0rem;'>"
    divStringToAppend += "<img src='" + mapType.getIconURL() + "' style='position: relative; top: 2rem; padding-top: 1rem; width: 45rem; height: 45rem;'/>"
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
