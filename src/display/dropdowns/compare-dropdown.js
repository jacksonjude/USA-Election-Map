function createComparePresetDropdownItems()
{
  $("#comparePresetsDropdownContainer").html("")
  for (var comparePresetNum in currentMapType.getDefaultCompareSourceIDs())
  {
    var compareIDPair = currentMapType.getDefaultCompareSourceIDs()[comparePresetNum]

    $("#comparePresetsDropdownContainer").append("<div class='dropdown-separator'></div>")
    $("#comparePresetsDropdownContainer").append("<a style='' onclick='loadComparePreset(\"" + comparePresetNum + "\")'>(" + comparePresetNum + ")&nbsp;&nbsp;" + mapSources[compareIDPair[0]].getName() + " vs " + mapSources[compareIDPair[1]].getName() + "</a>")
  }
}

function swapCompareMapSources()
{
  var tempSourceID = compareMapSourceIDArray[0]
  compareMapSourceIDArray[0] = compareMapSourceIDArray[1]
  compareMapSourceIDArray[1] = tempSourceID
}

async function loadCompareItemMapSource(compareItemNum)
{
  currentMapSource = mapSources[compareMapSourceIDArray[compareItemNum]]
  updateNavBarForNewSource()
  await loadDataMap()

  var dateIndexToSet
  switch (compareItemNum)
  {
    case 0:
    dateIndexToSet = $("#firstCompareDataMapDateSlider")[0].value
    break

    case 1:
    dateIndexToSet = $("#secondCompareDataMapDateSlider")[0].value
    break
  }

  $("#dataMapDateSlider").val(dateIndexToSet)
  await displayDataMap(dateIndexToSet)
  updateCompareMapSlidersVisibility(false)
}

async function loadComparePreset(comparePresetNum)
{
  var defaultCompareSourceIDs = currentMapType.getDefaultCompareSourceIDs()

  await toggleCompareMapSourceCheckbox(defaultCompareSourceIDs[comparePresetNum][0], true)
  await toggleCompareMapSourceCheckbox(defaultCompareSourceIDs[comparePresetNum][1], true)

  var latestSliderTickEnabled = currentMapType.getMapSettingValue("latestTick")

  if (defaultCompareSourceIDs[comparePresetNum][0] == defaultCompareSourceIDs[comparePresetNum][1])
  {
    $("#secondCompareDataMapDateSlider").val(mapSources[compareMapSourceIDArray[1]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0)-1-(latestSliderTickEnabled ? 1 : 0))
    setCompareSourceDate(1, mapSources[compareMapSourceIDArray[1]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0)-1-(latestSliderTickEnabled ? 1 : 0))
  }
}

const CompareSortMode = {
  voteshare: 0,
  shiftMargin: 1
}

var compareSortMode = CompareSortMode.voteshare

function toggleCompareSortMode(div)
{
  switch (compareSortMode)
  {
    case CompareSortMode.voteshare:
    compareSortMode = CompareSortMode.shiftMargin
    div.innerHTML = "Sort by shift"
    break

    case CompareSortMode.shiftMargin:
    compareSortMode = CompareSortMode.voteshare
    div.innerHTML = "Sort by voteshare"
    break
  }
}
