function createMapCountryDropdownItems()
{
  $("#mapCountryDropdownContainer").html("")

  let dropdownMapCountryIDs = cloneObject(mapCountryIDs)

  for (let country of dropdownMapCountryIDs)
  {
	if (currentMapCountry.getID() == country) { continue }

	$("#mapCountryDropdownContainer").append("<div class='dropdown-separator'></div>")

	let mapCountry = mapCountries[country]

	let divStringToAppend = "<a onclick='setMapCountry(\"" + country + "\")' style='display: flex; padding: 0; margin-top: 0;'>"
	divStringToAppend += "<img src='" + mapCountry.getIconURL() + "' style='width: 43px; height: 43px; padding: 3px;'/>"
	divStringToAppend += "</a>"

	$("#mapCountryDropdownContainer").append(divStringToAppend)
  }
}

function cycleMapCountry(buttonDiv)
{
  var newMapCountryIndex = mapCountryIDs.indexOf(currentMapCountry.getID())+1
  if (newMapCountryIndex >= mapCountryIDs.length || newMapCountryIndex < 0)
  {
	newMapCountryIndex = 0
  }

  setMapCountry(mapCountryIDs[newMapCountryIndex], buttonDiv)
}

function setMapCountry(newMapCountryID, buttonDiv)
{
  currentMapCountry = mapCountries[newMapCountryID]
  setCookie("currentMapCountry", currentMapCountry.getID())

  $(buttonDiv || "#cycleMapCountryButton").find("img").attr('src', currentMapCountry.getIconURL())

  reloadForNewMapCountry()
}
