function createMapCountryDropdownItems()
{
  $("#mapCountryDropdownContainer").html("")

  let dropdownMapCountryIDs = cloneObject(mapCountryIDs)

  for (let country of dropdownMapCountryIDs)
  {
	if (currentMapCountry.getID() == country) { continue }

	$("#mapCountryDropdownContainer").append("<div class='dropdown-separator'></div>")

	let mapCountry = mapCountries[country]

	let divStringToAppend = "<a onclick='setMapCountry(\"" + country + "\")' style='padding: 0; padding-left: 3rem; padding-right: 3rem; margin-top: 0rem;'>"
	divStringToAppend += "<img src='" + mapCountry.getIconURL() + "' style='position: relative; top: 2rem; padding-top: 1rem; width: 45rem; height: 45rem;'/>"
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
