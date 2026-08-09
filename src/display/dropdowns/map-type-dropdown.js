function createMapTypeDropdownItems()
{
  $("#mapTypesDropdownContainer").html("")

  let dropdownMapTypeIDs = cloneObject(mapTypeIDs)
  //moveLastToFirst(dropdownMapTypeIDs, mapTypeIDs.length-mapTypeIDs.indexOf(currentMapType.getID()))

  for (let typeIndex in dropdownMapTypeIDs)
  {
    let typeID = dropdownMapTypeIDs[typeIndex]
    if (currentMapType.getID() == typeID) { continue }

    $("#mapTypesDropdownContainer").append("<div class='dropdown-separator'></div>")

    let mapType = mapTypes[typeID]

    let divStringToAppend = "<a onclick='setMapType(\"" + typeID + "\")' style='display: flex; padding: 0; margin-top: 0;'>"
    divStringToAppend += "<img src='" + mapType.getIconURL() + "' style='width: 43px; height: 43px; padding: 3px;'/>"
    divStringToAppend += "</a>"

    $("#mapTypesDropdownContainer").append(divStringToAppend)
  }
}

function cycleMapType(buttonDiv)
{
  let newMapTypeIndex = mapTypeIDs.indexOf(currentMapType.getID())+1
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
