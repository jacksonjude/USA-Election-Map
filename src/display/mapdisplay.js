var currentMapType = mapTypes[mapTypeIDs[0]]

var mapSources = currentMapType.getMapSources()
var mapSourceIDs = currentMapType.getMapSourceIDs()
var currentCustomMapSource = currentMapType.getCustomMapSource()

var mapRegionNameToID = currentMapType.getRegionNameToID()

var currentMapSource = NullMapSource

var selectedParty

var defaultMarginValues = {safe: 15, likely: 5, lean: 1, tilt: Number.MIN_VALUE}
var marginValues = cloneObject(defaultMarginValues)
var marginNames = {safe: "Safe", likely: "Likely", lean: "Lean", tilt: "Tilt"}
var editMarginID = null

const defaultRegionFillColor = TossupParty.getMarginColors().safe
const regionFillAnimationDuration = 0.1
const regionStrokeAnimationDuration = 0.06

const regionSelectColor = "#ffffff"
const regionDeselectColor = "#181922" //#555

const regionDisabledColor = "#28292F"
const disabledBrightnessFactor = 1.0/2.0

const linkedRegions = [["MD", "MD-button"], ["DE", "DE-button"], ["NJ", "NJ-button"], ["CT", "CT-button"], ["RI", "RI-button"], ["MA", "MA-button"], ["VT", "VT-button"], ["NH", "NH-button"], ["HI", "HI-button"], ["ME-AL", "ME-AL-land"], ["ME-D1", "ME-D1-land"], ["ME-D2", "ME-D2-land"], ["NE-AL", "NE-AL-land"], ["NE-D1", "NE-D1-land"], ["NE-D2", "NE-D2-land"], ["NE-D3", "NE-D3-land"]]

var displayRegionDataArray = {}
var regionIDsToIgnore = [/.+-button/, /.+-land/]

var showingDataMap = false

var ignoreMapUpdateClickArray = []

var currentSliderDate
const initialKeyPressDelay = 500
const zoomKeyPressDelayForHalf = 3000
const maxDateSliderTicks = 50

const kEditing = 0
const kViewing = 1

var currentMapState = kViewing

var showingHelpBox = false

const electionDayTime2020 = 1604361600000 //1604390400000 PST
const electorsCastVotesTime = 1607965200000
const congressCountsVotesTime = 1609952400000
const inaugurationDayTime2021 = 1611162000000

const electionDayTime2022 = 1667926800000
const electionDayTime2024 = 1730826000000

const countdownTimes = {"2020 Presidential Election": {time: electionDayTime2020, url: "https://en.wikipedia.org/wiki/2020_United_States_presidential_election"}, "2021 Inauguration Day": {time: inaugurationDayTime2021, url: "https://en.wikipedia.org/wiki/Inauguration_of_Joe_Biden"}, "2022 Midterm Election": {time: electionDayTime2022, url: "https://en.wikipedia.org/wiki/2022_United_States_elections"}, "2024 Presidential Election": {time: electionDayTime2024, url: "https://en.wikipedia.org/wiki/2024_United_States_presidential_election"}}
var currentCountdownTimeName

const kCSVFileType = "text/csv"
const kJSONFileType = "application/json"
const kPNGFileType = "image/png"
const kJPEGFileType = "image/jpeg"

var showingCompareMap = false
var compareMapSourceIDArray = [null, null]
var compareMapDataArray = [null, null]
var selectedCompareSlider = null

const shiftNumberKeycodes = [33, 64, 35, 36, 37, 94, 38, 42, 40]

var selectedDropdownDivID = null

$(async function() {
  currentMapType = mapTypes[getCookie("currentMapType") || mapTypeIDs[0]]
  $("#cycleMapTypeButton").find("img").attr('src', currentMapType.getIconURL())

  reloadForNewMapType(true)

  preloadAssets([
    "assets/icon-download-none.png",
    "assets/icon-download.png",
    "assets/icon-loading.png",
    "assets/icon-download-complete.png",

    "assets/fivethirtyeight-large.png",
    "assets/jhk-large.png",
    "assets/cookpolitical-large.png",
    "assets/wikipedia-large.png",
    "assets/nyt-large.png"
  ])

  createMarginEditDropdownItems()
  createCountdownDropdownItems()

  addDivEventListeners()

  addTextBoxSpacingCSS()

  updateCountdownTimer()
  setTimeout(function() {
    setInterval(function() {
      updateCountdownTimer()
    }, 1000)
  }, 1000-((new Date()).getTime()%1000))

  $.ajaxSetup({cache: false})
})

function cycleMapType(buttonDiv)
{
  var newMapTypeIndex = mapTypeIDs.indexOf(currentMapType.getID())+1
  if (newMapTypeIndex >= mapTypeIDs.length || newMapTypeIndex < 0)
  {
    newMapTypeIndex = 0
  }

  currentMapType = mapTypes[mapTypeIDs[newMapTypeIndex]]
  setCookie("currentMapType", currentMapType.getID())

  $(buttonDiv).find("img").attr('src', currentMapType.getIconURL())

  reloadForNewMapType()
}

async function reloadForNewMapType(initialLoad)
{
  var previousDateOverride
  if (initialLoad != true)
  {
    previousDateOverride = currentSliderDate ? currentSliderDate.getTime() : null
    clearMap(true, false)
  }

  mapSources = currentMapType.getMapSources()
  mapSourceIDs = currentMapType.getMapSourceIDs()
  currentCustomMapSource = currentMapType.getCustomMapSource()
  mapRegionNameToID = currentMapType.getRegionNameToID()

  if (currentMapType.getCustomMapEnabled())
  {
    $("#editDoneButton").removeClass('topnavdisable2')
    $("#compareButton").removeClass('topnavdisable2')
    $("#compareDropdownContent").removeClass('topnavdisable2')
    $("#compareDropdownContent").css("opacity", "100%")
  }
  else
  {
    $("#editDoneButton").addClass('topnavdisable2')
    $("#compareButton").addClass('topnavdisable2')
    $("#compareDropdownContent").addClass('topnavdisable2')
    $("#compareDropdownContent").css("opacity", "0%")
  }

  selectedParty = null
  displayRegionDataArray = {}
  regionIDsToIgnore = [/.+-button/, /.+-land/]
  showingDataMap = false
  ignoreMapUpdateClickArray = []
  currentSliderDate = null
  currentMapState = kViewing
  showingCompareMap = false
  compareMapSourceIDArray = [null, null]
  compareMapDataArray = [null, null]
  selectedCompareSlider = null

  currentMapSource = currentMapType.getCurrentMapSourceID() ? mapSources[currentMapType.getCurrentMapSourceID()] : NullMapSource

  await loadMapSVGFile()
  setOutlineDivProperties()
  updateMapElectoralVoteText()

  $("#evPieChartContainer").html("<canvas id='evPieChart'></canvas>")
  $("#helpbox").html(currentMapType.getControlsHelpHTML())

  $("#loader").hide()
  resizeElements(false)

  createMapSourceDropdownItems()
  createSettingsDropdownItems()
  createComparePresetDropdownItems()

  populateRegionsArray()
  for (partyNum in selectablePoliticalPartyIDs)
  {
    if (selectablePoliticalPartyIDs[partyNum] == TossupParty.getID()) { continue }
    politicalParties[selectablePoliticalPartyIDs[partyNum]].setCandidateName(politicalParties[selectablePoliticalPartyIDs[partyNum]].getNames()[0])
  }
  displayPartyTotals(getPartyTotals())

  setupEVPieChart()
  updateEVPieChart()

  updateIconsBasedOnLocalCSVData()

  if (currentMapSource.getID() != NullMapSource.getID())
  {
    updateMapSourceButton()
    loadDataMap(false, false, previousDateOverride)
  }
  else
  {
    updateMapSourceButton(true)
  }
}

function loadMapSVGFile()
{
  var loadSVGFilePromise = new Promise((resolve, reject) => {
    $('#mapzoom').load(currentMapType.getSVGPath(), function() {
      resolve()
    })
  })

  return loadSVGFilePromise
}

function setOutlineDivProperties()
{
  $('#outlines').children().each(function() {
    var outlineDiv = $(this)

    outlineDiv.css('transition', "fill " + regionFillAnimationDuration + "s linear, stroke " + regionStrokeAnimationDuration + "s linear")
    outlineDiv.css('fill', defaultRegionFillColor)
    outlineDiv.css('cursor', "pointer")

    outlineDiv.attr('oncontextmenu', "rightClickRegion(this); return false;")
    outlineDiv.attr('onclick', "leftClickRegion(this)")
    outlineDiv.attr('onmouseenter', "mouseEnteredRegion(this)")
    outlineDiv.attr('onmouseleave', "mouseLeftRegion(this)")

    // outlineDiv.css('stroke', regionDeselectColor)
    // outlineDiv.css('stroke-width', 0.5)
  })
}

function resizeElements(initilizedPieChart)
{
  var windowWidth = $(window).width()

  //1.0*svgdatawidth*zoom/windowwidth == 0.6
  var mapZoom = 0.62*windowWidth/$("#svgdata").width()
  var topnavZoom = 0.85*mapZoom
  if (navigator.userAgent.indexOf("Firefox") != -1)
  {
    $("#mapzoom").css("transform", "scale(" + mapZoom + ")")
    $("#mapzoom").css("transform-origin", "0 0")
  }
  else
  {
    $("#mapzoom").css("zoom", (mapZoom*100) + "%")

    $(".topnav").css("zoom", (topnavZoom*100) + "%")
  }

  var mapWidth = $("#svgdata").width()*mapZoom
  var originalMapHeight = $("#svgdata").height()

  $(".slider").width(mapWidth-190)

  setSliderTickMarginShift("dataMapDateSliderContainer", "dataMapDateSlider", "dataMapSliderStepList")
  setSliderDateDisplayMarginShift("dateDisplay", "sliderDateDisplayContainer", "dataMapDateSlider", originalMapHeight, mapZoom)

  setSliderTickMarginShift("firstCompareSliderDateDisplayContainer", "firstCompareDataMapDateSlider", "firstCompareDataMapSliderStepList")
  setSliderDateDisplayMarginShift("firstCompareDateDisplay", "firstCompareSliderDateDisplayContainer", "firstCompareDataMapDateSlider", originalMapHeight, mapZoom)
  setSliderTickMarginShift("secondCompareSliderDateDisplayContainer", "secondCompareDataMapDateSlider", "secondCompareDataMapSliderStepList")
  setSliderDateDisplayMarginShift("secondCompareDateDisplay", "secondCompareSliderDateDisplayContainer", "secondCompareDataMapDateSlider", originalMapHeight, mapZoom)

  $("#evPieChart").width(windowWidth-windowWidth*0.12-mapWidth)
  $("#evPieChart").height(windowWidth-windowWidth*0.09-mapWidth)
  $("#evPieChart").css("background-size", $("#evPieChart").width()*evPieChartCutoutPercent/100.0*0.5)
  $("#evPieChart").css("background-position", "center")
  $("#evPieChart").css("background-repeat", "no-repeat")

  const creditboxh3DefaultSize = 23
  const creditboxh5DefaultSize = 17
  const creditboxImageDefaultSize = 20

  const helpboxh3DefaultSize = 23
  const helpboxh5DefaultSize = 15

  const defaultMapZoom = 120.634/100

  $("#creditbox h3").css('font-size', (creditboxh3DefaultSize*mapZoom/defaultMapZoom) + "px")
  $("#creditbox h5").css('font-size', (creditboxh5DefaultSize*mapZoom/defaultMapZoom) + "px")
  $("#creditbox img").css('width', (creditboxImageDefaultSize*mapZoom/defaultMapZoom) + "px")
  $("#creditbox img").css('height', (creditboxImageDefaultSize*mapZoom/defaultMapZoom) + "px")

  $("#helpbox h3").css('font-size', (helpboxh3DefaultSize*mapZoom/defaultMapZoom) + "px")
  $("#helpbox h5").css('font-size', (helpboxh5DefaultSize*mapZoom/defaultMapZoom) + "px")

  if (initilizedPieChart == true || initilizedPieChart == null)
  {
    updateEVPieChart()
  }
}

function setSliderTickMarginShift(sliderContainerDivID, sliderDivID, sliderTicksDivID)
{
  var shouldHideSlider = $("#" + sliderContainerDivID).is(":hidden")
  if (shouldHideSlider)
  {
    $("#" + sliderContainerDivID).show()
  }
  var marginShift = $("#" + sliderTicksDivID)[0].getBoundingClientRect().y-$("#" + sliderDivID)[0].getBoundingClientRect().y
  if (marginShift != 0)
  {
    $("#" + sliderTicksDivID).css("margin-top", "-" + marginShift + "px")
  }
  if (shouldHideSlider)
  {
    $("#" + sliderContainerDivID).hide()
  }
}

function setSliderDateDisplayMarginShift(dateDisplayDivID, sliderContainerDivID, sliderDivID, originalMapHeight, mapZoom)
{
  if (navigator.userAgent.indexOf("Firefox") != -1)
  {
    $("#" + dateDisplayDivID).css("transform", "scale(" + ($(window).width()*0.10/$("#" + dateDisplayDivID).width()) + ")")
    $("#" + dateDisplayDivID).css("transform-origin", "0 50%")
    $("#" + sliderContainerDivID).css("top", originalMapHeight*(mapZoom-1))
  }
  else
  {
    $("#" + dateDisplayDivID).css("zoom", (100*$(window).width()/1800) + "%")
  }

  $("#" + dateDisplayDivID).css("margin-top", ($("#" + sliderDivID).height()/4-1))
}

function preloadAssets(assetURLs)
{
  for (urlNum in assetURLs)
  {
    (new Image()).src = assetURLs[urlNum]
  }
}

function createMapSourceDropdownItems()
{
  $("#mapSourcesDropdownContainer").html("")
  for (sourceNum in mapSourceIDs)
  {
    $("#mapSourcesDropdownContainer").append("<div class='dropdown-separator'></div>")

    var mapSourceID = mapSourceIDs[sourceNum]
    var mapSourceIDNoSpace = mapSourceID.replace(/\s/g, '')
    var mapSourceName = mapSources[mapSourceID].getName()

    var divStringToAppend = ""

    if (mapSourceID != currentCustomMapSource.getID())
    {
      divStringToAppend += "<a id='" + mapSourceIDNoSpace + "' onclick='updateMapSource(\"" + mapSourceID + "\", \"#sourceToggleButton\")'>" + "(" + (parseInt(sourceNum)+1) + ")" + "&nbsp;&nbsp;" + mapSourceName
      divStringToAppend += "<span id='" + mapSourceIDNoSpace + "-icon' style='float: right;' onclick='downloadDataForMapSource(\"" + mapSourceID + "\", {\"" + mapSourceIDNoSpace + "-icon\":{loading: \"./assets/icon-loading.png\", error: \"./assets/icon-download-none.png\", success: \"./assets/icon-download-complete.png\", top: -1, width: 24, height: 24}}, \"" + mapSourceIDNoSpace + "\", true, true)'>"
      divStringToAppend += "<img class='status' src='./assets/icon-download-none.png' style='position: relative; top: -1px; width: 24px; height: 24px;' />"
      divStringToAppend += "</span>"
      divStringToAppend += "<input class='comparesourcecheckbox' type='checkbox' id='" + mapSourceIDNoSpace + "-compare' onclick='addCompareMapSource(\"" + mapSourceID + "\", \"" + mapSourceIDNoSpace + "\")' style='position: relative; top: -2px; right: -4px; float: right; width: 20px; height: 20px;' />"
      divStringToAppend += "</a>"
    }
    else
    {
      divStringToAppend += "<a id='" + mapSourceIDNoSpace + "' onclick='updateMapSource(\"" + mapSourceID + "\", \"#sourceToggleButton\")'>" + "(" + (parseInt(sourceNum)+1) + ")" + "&nbsp;&nbsp;" + mapSourceName

      divStringToAppend += "<span id='" + mapSourceIDNoSpace + "-download-icon' style='float:right;')'>"
      divStringToAppend += "<img class='status' src='./assets/icon-download.png' style='position: relative; top: -1px; width: 24px; height: 24px;' />"
      divStringToAppend += "</span>"

      divStringToAppend += "<span id='" + mapSourceIDNoSpace + "-upload-icon' style='float:right;' onclick='ignoreMapUpdateClickArray.push(\"" + mapSourceID + "\"); $(\"#uploadFileInput\").click()'>"
      divStringToAppend += "<img class='status' src='./assets/icon-upload.png' style='position: relative; top: -1px; width: 24px; height: 24px; margin-right: 6px' />"
      divStringToAppend += "</span>"

      divStringToAppend += "</a>"
    }

    $("#mapSourcesDropdownContainer").append(divStringToAppend)

    if (mapSourceID == currentCustomMapSource.getID())
    {
      var customMapSourceID = mapSourceID
      $("#" + mapSourceIDNoSpace + "-download-icon")[0].addEventListener('click', function(e) {
        ignoreMapUpdateClickArray.push(customMapSourceID)
        downloadMapFile(currentMapSource, e.altKey ? kCSVFileType : kJSONFileType)
      })
    }
  }
}

function createMarginEditDropdownItems()
{
  $("#marginsDropdownContainer").html("")
  for (marginID in marginNames)
  {
    if (marginID == "tilt") { continue } // Hardcoding tilt to be excluded
    $("#marginsDropdownContainer").append("<div class='dropdown-separator'></div>")
    $("#marginsDropdownContainer").append("<a id='" + marginID + "-edit' style='padding-top: 14px; min-height: 25px;' onclick='toggleMarginEditing(\"" + marginID + "\", this)'>" + marginNames[marginID] + "<span style='float: right; font-family: \"Bree5erif-Mono\"'>" + marginValues[marginID] + "</span></a>")
  }
}

function createSettingsDropdownItems()
{
  $("#settingsDropdownContainer").html("")
  for (settingNum in currentMapType.getMapSettingsLayout())
  {
    var settingLayout = currentMapType.getMapSettingsLayout()[settingNum]
    $("#settingsDropdownContainer").append("<div class='dropdown-separator'></div>")
    switch (settingLayout.type)
    {
      case MapSettingType.optionCycle:
      $("#settingsDropdownContainer").append("<a id=" + settingLayout.id + " style='padding-top: 14px; min-height: 25px;' onclick='cycleMapSetting(\"" + settingLayout.id + "\", this, true)'></a>")
      cycleMapSetting(settingLayout.id, $("#" + settingLayout.id), false)
      break
    }
  }
}

function cycleMapSetting(settingID, settingDiv, shouldIncrement)
{
  var shouldIncrement = shouldIncrement == null ? false : shouldIncrement

  var currentMapSettings = currentMapType.getMapSettings()

  var settingOptions = currentMapType.getMapSettingOptions(settingID)
  var currentValueID = currentMapSettings[settingID]

  var optionIndex = 0
  for (optionNum in settingOptions)
  {
    if (settingOptions[optionNum].id == currentValueID)
    {
      optionIndex = parseInt(optionNum)
      break
    }
  }

  optionIndex += shouldIncrement ? 1 : 0
  if (optionIndex >= settingOptions.length)
  {
    optionIndex = 0
  }

  var newValueID = settingOptions[optionIndex].id
  var newValueTitle = settingOptions[optionIndex].title
  $(settingDiv).html(currentMapType.getMapSettingLayout(settingID).title + "<span style='float: right'>" + newValueTitle + "</span>")

  currentMapSettings[settingID] = newValueID
  currentMapType.setMapSettings(currentMapSettings)

  switch (currentMapType.getMapSettingLayout(settingID).reloadType)
  {
    case MapSettingReloadType.display:
    if (showingDataMap)
    {
      displayDataMap()
    }
    break

    case MapSettingReloadType.data:
    if (showingDataMap)
    {
      loadDataMap()
    }
    break
  }
}

function toggleMapSettingDisable(settingID, disableOverride)
{
  if (($("#" + settingID).hasClass("topnavdisable2") && disableOverride == null) || (disableOverride != null && disableOverride == false))
  {
    $("#" + settingID).removeClass("topnavdisable2")
  }
  else
  {
    $("#" + settingID).addClass("topnavdisable2")
  }
}

function createCountdownDropdownItems()
{
  $("#countdownsDropdownContainer").html("")
  for (timeName in countdownTimes)
  {
    $("#countdownsDropdownContainer").append("<div class='dropdown-separator'></div>")
    $("#countdownsDropdownContainer").append("<a id='" + timeName + "-countdown' style='padding-top: 14px; min-height: 25px;' onclick='selectCountdownTime(\"" + timeName + "\", this)'>" + timeName + "</a>")
  }

  updateCountdownTimer()
  $("[id='" + currentCountdownTimeName + "-countdown']").addClass("active")
  $("#countdownDisplay").attr('href', countdownTimes[currentCountdownTimeName].url)
}

function createComparePresetDropdownItems()
{
  $("#comparePresetsDropdownContainer").html("")
  for (comparePresetNum in currentMapType.getDefaultCompareSourceIDs())
  {
    var compareIDPair = currentMapType.getDefaultCompareSourceIDs()[comparePresetNum]

    $("#comparePresetsDropdownContainer").append("<div class='dropdown-separator'></div>")
    $("#comparePresetsDropdownContainer").append("<a style='' onclick='loadComparePreset(\"" + comparePresetNum + "\")'>(" + comparePresetNum + ")&nbsp;&nbsp;" + mapSources[compareIDPair[0]].getName() + " vs " + mapSources[compareIDPair[1]].getName() + "</a>")
  }
}

function addDivEventListeners()
{
  document.getElementById("clearMapButton").addEventListener('click', function(e) {
    clearMap()

    if (e.altKey)
    {
      for (mapSourceID in mapSources)
      {
        mapSources[mapSourceID].resetMapData()
        removeStatusImage(mapSourceID.replace(/\s/g, '') + "-icon")
        insertStatusImage(mapSourceID.replace(/\s/g, '') + "-icon", "./assets/icon-download-none.png", 24, 24, -1)
      }
    }
  })

  document.getElementById("sourceToggleButton").addEventListener('click', function(e) {
    if (currentMapState == kEditing || editMarginID) { return }
    if (!e.altKey)
    {
      toggleMapSource(this)
    }
    else
    {
      downloadAllMapData()
    }
  })

  $("#uploadFileInput").change(function() {
    if (!this.files || this.files.length == 0) { return }
    loadUploadedFile(this.files[0])
  })

  document.getElementById("marginEditButton").addEventListener('click', function(e) {
    toggleMarginEditing()

    if (e.altKey)
    {
      marginValues = cloneObject(defaultMarginValues)
      createMarginEditDropdownItems()

      if (showingDataMap)
      {
        displayDataMap()
      }
    }
  })

  $("#stateboxcontainer").on('show', function() {
    $(this).show()
    $(this).css('opacity', "1")
  })

  $("#stateboxcontainer").on('hide', function() {
    $(this).css('opacity', "0")

    setTimeout(function() {
      if ($("#stateboxcontainer").css('opacity') == "0" && !currentRegionID) { $("#stateboxcontainer").hide() }
    }, 200)
  })
}

function addTextBoxSpacingCSS()
{
  var browserName = bowser.getParser(navigator.userAgent).getResult().browser.name

  switch (browserName)
  {
    case "Chrome":
    $(".textbox").css('letter-spacing', "1px")
    break

    case "Firefox":
    $(".textbox").css('letter-spacing', "0.8px")
    break
  }
}

function getIconDivsToUpdateArrayForSourceID(mapSourceID)
{
  var iconDivID = mapSourceID.replace(/\s/g, '') + "-icon"
  //{"sourceToggleButton":{loading: "./assets/icon-loading.png", error: "./assets/icon-error.png", success: "./assets/icon-success.png"}}
  var iconDivDictionary = {}
  iconDivDictionary[iconDivID] = {loading: "./assets/icon-loading.png", error: "./assets/icon-download-none.png", success: "./assets/icon-download-complete.png", top: -1, width: 24, height: 24}

  return iconDivDictionary
}

function loadDataMap(shouldSetToMax, forceDownload, previousDateOverride)
{
  var loadDataMapPromise = new Promise(async (resolve, reject) => {
    $("#dataMapDateSliderContainer").hide()
    $("#dateDisplay").hide()

    currentMapType.setCurrentMapSourceID(currentMapSource.getID())

    var iconDivDictionary = getIconDivsToUpdateArrayForSourceID(currentMapSource.getID())
    var loadedSuccessfully = await downloadDataForMapSource(currentMapSource.getID(), iconDivDictionary, null, forceDownload)

    if (!loadedSuccessfully) { resolve(); return }

    shouldSetToMax = currentMapType.getMapSettingValue("startAtLatest") ? true : shouldSetToMax

    setDataMapDateSliderRange(shouldSetToMax, null, null, null, previousDateOverride)
    displayDataMap()
    $("#dataMapDateSliderContainer").show()
    $("#dateDisplay").show()

    $("#evPieChart").attr('onclick', "currentMapSource.openHomepageLink(currentSliderDate)")

    if (currentMapSource.getIconURL())
    {
      $("#evPieChart").css("background-image", "url(" + currentMapSource.getIconURL() + ")")
    }
    else
    {
      $("#evPieChart").css("background-image", "")
    }

    resolve()
  })

  return loadDataMapPromise
}

function downloadDataForMapSource(mapSourceID, divsToUpdateStatus, mapIDToIgnore, forceDownload, refreshMap, onlyAttemptLocalFetch)
{
  if (mapIDToIgnore != null)
  {
    ignoreMapUpdateClickArray.push(mapIDToIgnore)
  }
  var downloadDataPromise = new Promise(async (resolve, reject) => {
    for (divID in divsToUpdateStatus)
    {
      removeStatusImage(divID)
    }

    for (divID in divsToUpdateStatus)
    {
      insertStatusImage(divID, divsToUpdateStatus[divID].loading, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
    }

    var loadedSuccessfully = await mapSources[mapSourceID].loadMap(forceDownload, onlyAttemptLocalFetch)
    for (divID in divsToUpdateStatus)
    {
      removeStatusImage(divID)
    }

    if (!loadedSuccessfully)
    {
      for (divID in divsToUpdateStatus)
      {
        insertStatusImage(divID, divsToUpdateStatus[divID].error, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
      }
      resolve(false)
    }
    else
    {
      for (divID in divsToUpdateStatus)
      {
        insertStatusImage(divID, divsToUpdateStatus[divID].success, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
      }

      if (refreshMap && currentMapSource.getID() == mapSourceID)
      {
        setDataMapDateSliderRange()
        displayDataMap()
        $("#dataMapDateSliderContainer").show()
        $("#dateDisplay").show()
      }
      resolve(true)
    }
  })

  return downloadDataPromise
}

async function downloadAllMapData()
{
  var sourcesLoaded = 0
  for (sourceIDNum in mapSourceIDs)
  {
    var iconDivDictionary = getIconDivsToUpdateArrayForSourceID(mapSourceIDs[sourceIDNum])
    downloadDataForMapSource(mapSourceIDs[sourceIDNum], iconDivDictionary, null, true).then(function(loadedSuccessfully) {
      if (showingDataMap && mapSourceIDs[sourceIDNum] == currentMapSource.getID() && loadedSuccessfully)
      {
        loadDataMap(true)
      }

      sourcesLoaded += 1
      if (sourcesLoaded < mapSourceIDs.length)
      {
        $("#loader").show()
      }
    })
  }
}

async function fetchLocalCSVData()
{
  for (sourceIDNum in mapSourceIDs)
  {
    var iconDivDictionary = getIconDivsToUpdateArrayForSourceID(mapSourceIDs[sourceIDNum])
    await downloadDataForMapSource(mapSourceIDs[sourceIDNum], iconDivDictionary, null, false, false, true)
  }
}

async function updateIconsBasedOnLocalCSVData()
{
  for (sourceIDNum in mapSourceIDs)
  {
    var divsToUpdateStatus = getIconDivsToUpdateArrayForSourceID(mapSourceIDs[sourceIDNum])
    var csvIsStored = await CSVDatabase.hasCSV(mapSourceIDs[sourceIDNum])
    if (csvIsStored)
    {
      for (divID in divsToUpdateStatus)
      {
        removeStatusImage(divID)
        insertStatusImage(divID, divsToUpdateStatus[divID].success, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
      }
    }
    else
    {
      for (divID in divsToUpdateStatus)
      {
        removeStatusImage(divID)
        insertStatusImage(divID, divsToUpdateStatus[divID].error, divsToUpdateStatus[divID].width, divsToUpdateStatus[divID].height, divsToUpdateStatus[divID].top)
      }
    }
  }
}

function insertStatusImage(divID, icon, width, height, top)
{
  $("#" + divID).html($("#" + divID).html() + ('<span class="status">&nbsp;&nbsp;&nbsp;<img src="' + icon + '" style="position: relative; top: ' + (top || 2) + 'px; width: ' + (width || 16) + 'px; height: ' + (height || 16) + 'px;" /></span>'))
}

function removeStatusImage(divID)
{
  $("#" + divID + " .status").remove()
}

function setDataMapDateSliderRange(shouldSetToMax, sliderDivID, sliderTickDivID, mapDates, previousDate)
{
  shouldSetToMax = shouldSetToMax == null ? false : shouldSetToMax
  sliderDivID = sliderDivID || "dataMapDateSlider"
  sliderTickDivID = sliderTickDivID || "dataMapSliderStepList"
  mapDates = mapDates || currentMapSource.getMapDates()
  previousDate = previousDate || (currentSliderDate ? currentSliderDate.getTime() : null)

  var startDate = new Date(mapDates[0])
  var endDate = new Date(mapDates[mapDates.length-1])

  var latestSliderTickEnabled = currentMapType.getMapSettingValue("latestTick")
  var previousValueWasLatest = $("#" + sliderDivID).val() != null && $("#" + sliderDivID).val() == $("#" + sliderDivID).attr('max') && latestSliderTickEnabled

  $("#" + sliderDivID).attr('max', mapDates.length+(latestSliderTickEnabled ? 1 : 0))

  if ((currentSliderDate == null && previousDate == null) || shouldSetToMax || previousValueWasLatest)
  {
    $("#" + sliderDivID).val(mapDates.length+(latestSliderTickEnabled ? 1 : 0))
    currentSliderDate = endDate
  }
  else
  {
    var closestDate = mapDates[0]
    var closestDateIndex = 0
    for (dateNum in mapDates)
    {
      if (Math.abs(previousDate-mapDates[dateNum]) < Math.abs(closestDate-previousDate))
      {
        closestDate = mapDates[dateNum]
        closestDateIndex = dateNum
      }
    }

    $("#" + sliderDivID).val(parseInt(closestDateIndex)+1)
    currentSliderDate = new Date(closestDate)
  }

  $("#" + sliderTickDivID).empty()
  if (mapDates.length <= maxDateSliderTicks)
  {
    for (dateNum in mapDates)
    {
      $("#" + sliderTickDivID).append("<span class='tick'></span>")
    }
    if (latestSliderTickEnabled)
    {
      $("#" + sliderTickDivID).append("<span class='tick'></span>")
    }
  }
}

function updateSliderDateDisplay(dateToDisplay, overrideDateString, sliderDateDisplayDivID)
{
  sliderDateDisplayDivID = sliderDateDisplayDivID || "dateDisplay"

  var dateString
  if (overrideDateString != null)
  {
    dateString = overrideDateString
  }
  else
  {
    dateString = (zeroPadding(dateToDisplay.getMonth()+1)) + "/" + zeroPadding(dateToDisplay.getDate()) + "/" + dateToDisplay.getFullYear()
  }

  $("#" + sliderDateDisplayDivID).html(dateString)
  currentSliderDate = dateToDisplay
}

function displayDataMap(dateIndex)
{
  dateIndex = dateIndex || $("#dataMapDateSlider").val()

  displayRegionDataArray = {}
  populateRegionsArray()

  $('#outlines').children().each(function() {
    var regionDataCallback = getRegionData($(this).attr('id'))
    var regionIDsToFill = regionDataCallback.linkedRegionIDs
    var regionData = regionDataCallback.regionData

    updateRegionFillColors(regionIDsToFill, regionData, false)
  })
  displayPartyTotals(getPartyTotals())

  var mapDates = currentMapSource.getMapDates()
  var dateToDisplay
  var overrideDateString
  if (dateIndex-1 > mapDates.length-1)
  {
    dateToDisplay = new Date(mapDates[dateIndex-1-1])
    overrideDateString = "Latest (" + (zeroPadding(dateToDisplay.getMonth()+1)) + "/" + zeroPadding(dateToDisplay.getDate()) + "/" + dateToDisplay.getFullYear() + ")"
  }
  else
  {
    dateToDisplay = new Date(mapDates[dateIndex-1])
  }

  updateSliderDateDisplay(dateToDisplay, overrideDateString)

  updatePoliticalPartyCandidateNames(dateToDisplay.getTime())
  updateMapElectoralVoteText()

  var currentMapDataForDate = currentMapSource.getMapData()[dateToDisplay.getTime()]

  for (regionNum in currentMapDataForDate)
  {
    var regionDataCallback = getRegionData(currentMapDataForDate[regionNum].region)
    var regionData = regionDataCallback.regionData
    var regionsToFill = regionDataCallback.linkedRegionIDs

    if (regionData == null)
    {
      console.log(currentMapDataForDate[regionNum].region)
      continue
    }

    regionData.region = currentMapDataForDate[regionNum].region
    regionData.margin = currentMapDataForDate[regionNum].margin
    regionData.partyID = currentMapDataForDate[regionNum].partyID
    regionData.disabled = currentMapDataForDate[regionNum].disabled
    regionData.candidateName = currentMapDataForDate[regionNum].candidateName
    regionData.candidateMap = currentMapDataForDate[regionNum].candidateMap
    regionData.chanceIncumbent = currentMapDataForDate[regionNum].chanceIncumbent
    regionData.chanceChallenger = currentMapDataForDate[regionNum].chanceChallenger
    regionData.partyVotesharePercentages = currentMapDataForDate[regionNum].partyVotesharePercentages
    regionData.seatClass = currentMapDataForDate[regionNum].seatClass

    updateRegionFillColors(regionsToFill, currentMapDataForDate[regionNum], false)
  }
  displayPartyTotals(getPartyTotals())

  updateEVPieChart()

  if (currentRegionID && currentMapState == kViewing)
  {
    updateStateBox(currentRegionID)
  }

  showingDataMap = true
}

function updatePoliticalPartyCandidateNames(mapDate)
{
  var candidateNames = currentMapSource.getCandidateNames(mapDate)

  if (!candidateNames)
  {
    console.log("No candidate names found!")
    return
  }

  for (partyID in politicalParties)
  {
    if (partyID in candidateNames)
    {
      politicalParties[partyID].setCandidateName(candidateNames[partyID])
    }
  }
}

function updateMapElectoralVoteText()
{
  if (!currentMapType.getShouldDisplayEVOnMap()) { return }

  var regionIDs = Object.values(mapRegionNameToID)
  for (regionNum in regionIDs)
  {
    var regionChildren = $("#" + regionIDs[regionNum] + "-text").children()

    var regionEV = currentMapType.getEV(getCurrentDecade(), regionIDs[regionNum])
    if (regionEV == undefined) { continue }

    if (regionChildren.length == 1)
    {
      regionChildren[0].innerHTML = regionIDs[regionNum] + " " + regionEV
    }
    else if (regionChildren.length == 2)
    {
      regionChildren[1].innerHTML = regionEV
    }
  }
}

function toggleMapSource(buttonDiv)
{
  var mapSourceArrayIndex = mapSourceIDs.indexOf(currentMapSource.getID())
  mapSourceArrayIndex++
  if (mapSourceArrayIndex > mapSourceIDs.length-1)
  {
    mapSourceArrayIndex = 0
  }

  updateMapSource(mapSourceIDs[mapSourceArrayIndex], buttonDiv)
}

function updateMapSource(sourceID, buttonDiv, forceDownload)
{
  if (ignoreMapUpdateClickArray.includes(sourceID.replace(/\s/g, '')))
  {
    ignoreMapUpdateClickArray.splice(ignoreMapUpdateClickArray.indexOf(sourceID), 1)
    return
  }

  currentMapSource = mapSources[sourceID]

  updateMapSourceButton()
  loadDataMap(false, forceDownload)
}

function updateMapSourceButton(revertToDefault)
{
  revertToDefault = revertToDefault == null ? false : revertToDefault
  $("#mapSourcesDropdownContainer .active").removeClass("active")
  if (revertToDefault)
  {
    $("#sourceToggleButton").html("Select Source")
  }
  else
  {
    $("#sourceToggleButton").html("Source: " + currentMapSource.getName())
    $("#" + currentMapSource.getID().replace(/\s/g, '')).addClass("active")
  }

  if (currentMapState == kEditing && currentMapSource.getID() == currentCustomMapSource.getID())
  {
    $("#editDoneButton").html("Done")
  }
  else if (currentMapState == kEditing && currentMapSource.getID() != currentCustomMapSource.getID())
  {
    toggleEditing(kViewing)
  }
  else if (currentMapState != kEditing && currentMapSource.getID() == currentCustomMapSource.getID())
  {
    $("#editDoneButton").html("Edit")
  }
  else
  {
    $("#editDoneButton").html("Copy")
  }

  if (showingCompareMap && currentMapSource.getID() != currentCustomMapSource.getID())
  {
    updateCompareMapSlidersVisibility(false)
  }
  else if (showingCompareMap && currentMapSource.getID() == currentCustomMapSource.getID())
  {
    updateCompareMapSlidersVisibility(true)
  }
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
    $(div).html(marginNames[marginID] + "<input class='marginTextInput' type='text' id='" + marginID + "-text' value='" + marginValues[marginID] + "'>")
    $("#" + marginID + "-text").focus()

    $("#marginEditButton").addClass('active')
    if (currentMapType.getCustomMapEnabled())
    {
      $("#editDoneButton").addClass('topnavdisable')
    }
    $("#sourceToggleButton").addClass('topnavdisable')
    $("#mapSourcesDropdownContainer").hide()
  }
  else
  {
    $("#marginEditButton").removeClass('active')
    if (currentMapType.getCustomMapEnabled())
    {
      $("#editDoneButton").removeClass('topnavdisable')
    }
    $("#sourceToggleButton").removeClass('topnavdisable')
    $("#mapSourcesDropdownContainer").show()
  }
}

function selectCountdownTime(countdownTimeName, countdownButtonDiv)
{
  $("#countdownsDropdownContainer .active").removeClass("active")
  $(countdownButtonDiv).addClass("active")

  currentCountdownTimeName = countdownTimeName
  $("#countdownDisplay").attr('href', countdownTimes[currentCountdownTimeName].url)
  updateCountdownTimer()
}

function clearMap(fullClear, shouldResetCurrentMapSource)
{
  fullClear = fullClear == null ? false : fullClear
  shouldResetCurrentMapSource = shouldResetCurrentMapSource != null ? shouldResetCurrentMapSource : true

  if (currentMapSource != currentCustomMapSource || currentCustomMapSource.getTextMapData().startsWith("date\n") || fullClear)
  {
    updateMapSourceButton(true)
    currentMapSource = NullMapSource
    if (shouldResetCurrentMapSource)
    {
      currentMapType.setCurrentMapSourceID(null)
    }

    toggleEditing(kViewing)

    currentSliderDate = null

    if (fullClear)
    {
      currentCustomMapSource.clearMapData(true)
    }
  }
  else
  {
    currentCustomMapSource.clearMapData()
    loadDataMap(false, true)
  }

  if (showingCompareMap)
  {
    showingCompareMap = false

    $(".comparesourcecheckbox").prop('checked', false)

    compareMapSourceIDArray = [null, null]
    updateCompareMapSlidersVisibility()

    $(".compareitemtext").html("&lt;Empty&gt;")
    $(".compareitemimage").css('display', "none")
    $(".compareitemimage").attr('src', "")

    toggleMapSettingDisable("seatArrangement", false)
  }

  marginValues = cloneObject(defaultMarginValues)
  createMarginEditDropdownItems()

  updatePoliticalPartyCandidateNames()
  updateMapElectoralVoteText()

  displayRegionDataArray = {}
  populateRegionsArray()

  for (partyNum in selectablePoliticalPartyIDs)
  {
    if (selectablePoliticalPartyIDs[partyNum] == TossupParty.getID()) { continue }
    politicalParties[selectablePoliticalPartyIDs[partyNum]].setCandidateName(politicalParties[selectablePoliticalPartyIDs[partyNum]].getNames()[0])
  }

  $('#outlines').children().each(function() {
    var regionDataCallback = getRegionData($(this).attr('id'))
    var regionIDsToFill = regionDataCallback.linkedRegionIDs
    var regionData = regionDataCallback.regionData

    updateRegionFillColors(regionIDsToFill, regionData, false)
  })
  displayPartyTotals(getPartyTotals())

  updateEVPieChart()
  if (currentRegionID != null)
  {
    updateStateBox(currentRegionID)
  }

  $("#dataMapDateSliderContainer").hide()
  $("#dateDisplay").hide()

  $("#evPieChart").css("background-image", "")

  showingDataMap = false
}

function toggleHelpBox(helpButtonDiv)
{
  showingHelpBox = !showingHelpBox
  if (showingHelpBox)
  {
    $("#helpboxcontainer").show()
    $("#toggleHelpBoxButton").addClass('active')
    $("#evPieChartContainer").hide()
    $("#creditboxcontainer").hide()
  }
  else
  {
    $("#helpboxcontainer").hide()
    $("#toggleHelpBoxButton").removeClass('active')
    $("#evPieChartContainer").show()
    $("#creditboxcontainer").show()
  }
}

function populateRegionsArray()
{
  $('#outlines').children().each(function() {
    var regionID = $(this).attr('id')
    for (regexNum in regionIDsToIgnore)
    {
      if (regionIDsToIgnore[regexNum].test(regionID))
      {
        return
      }
    }

    displayRegionDataArray[regionID] = {partyID: TossupParty.getID(), margin: 0}
  })
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
  }
}

function selectAllParties()
{
  $("#partyButtonDiv").children().each(function() {
    $(this).addClass('active')
  })
}

function deselectAllParties()
{
  $("#partyButtonDiv").children().each(function() {
    $(this).removeClass('active')
  })
  selectedParty = null
}

function toggleEditing(stateToSet)
{
  if (editMarginID) { return }

  if (stateToSet == null)
  {
    switch (currentMapState)
    {
      case kEditing:
      currentMapState = kViewing
      break

      case kViewing:
      currentMapState = kEditing
      break
    }
  }
  else
  {
    currentMapState = stateToSet
  }

  switch (currentMapState)
  {
    case kEditing:
    deselectAllParties()

    $("#editDoneButton").html("Done")
    $("#editDoneButton").addClass('active')

    $("#stateboxcontainer").trigger('hide')

    $("#marginEditButton").addClass('topnavdisable')
    $("#marginsDropdownContainer").hide()

    $("#fillDropdownContainer").css('display', "block")

    var currentMapIsCustom = (currentMapSource.getID() == currentCustomMapSource.getID())
    currentCustomMapSource.updateMapData(displayRegionDataArray, getCurrentDateOrToday(), !currentMapIsCustom)

    if (!currentMapIsCustom)
    {
      currentCustomMapSource.setCandidateNames(currentMapSource.getCandidateNames((currentSliderDate || new Date(getCurrentDateOrToday())).getTime()))

      currentMapSource = currentCustomMapSource
      updatePoliticalPartyCandidateNames()
      updateMapSourceButton()
      loadDataMap()
    }
    break

    case kViewing:
    selectAllParties()

    if (currentMapSource.getID() == currentCustomMapSource.getID())
    {
      $("#editDoneButton").html("Edit")
    }
    else
    {
      $("#editDoneButton").html("Copy")
    }
    $("#editDoneButton").removeClass('active')

    $("#marginEditButton").removeClass('topnavdisable')
    $("#marginsDropdownContainer").show()

    $("#fillDropdownContainer").css('display', "none")

    if (currentMapSource.getID() == currentCustomMapSource.getID())
    {
      currentCustomMapSource.updateMapData(displayRegionDataArray, getCurrentDateOrToday(), false)
    }

    if (showingDataMap && currentRegionID)
    {
      updateStateBox(currentRegionID)
    }
    break
  }
}

function leftClickRegion(div)
{
  if (currentMapState == kEditing)
  {
    if (ignoreNextClick)
    {
      ignoreNextClick = false
      return
    }

    var regionID = $(div).attr('id')
    if (regionIDsChanged.includes(regionID)) { return }

    var regionDataCallback = getRegionData(regionID)
    var regionData = regionDataCallback.regionData
    var regionIDsToFill = regionDataCallback.linkedRegionIDs

    if (selectedParty != null && regionData.partyID != selectedParty.getID())
    {
      regionData.partyID = selectedParty.getID()
      regionData.candidateName = regionData.candidateMap[regionData.partyID]
      regionData.margin = marginValues.safe
    }
    else if (selectedParty != null)
    {
      var marginValueArray = Object.values(marginValues)
      var marginValueIndex = marginValueArray.indexOf(regionData.margin)
      if (marginValueIndex == -1)
      {
        for (marginValueNum in marginValueArray)
        {
          if (regionData.margin >= marginValueArray[marginValueNum])
          {
            regionData.margin = marginValueArray[marginValueNum]
            break
          }
        }
        marginValueIndex = marginValueArray.indexOf(regionData.margin)
      }

      marginValueIndex += 1
      if (marginValueIndex > marginValueArray.length-1)
      {
        marginValueIndex = 0
      }

      // Hardcoding tilt = 0.1
      regionData.margin = marginValueIndex == marginValueArray.length-1 ? 0.1 : marginValueArray[marginValueIndex]
    }
    else
    {
      regionData.partyID = TossupParty.getID()
      regionData.margin = 0
    }

    updateRegionFillColors(regionIDsToFill, regionData)
    displayPartyTotals(getPartyTotals())
  }
  else if (currentMapState == kViewing && showingDataMap && currentRegionID)
  {
    currentMapSource.openRegionLink(currentRegionID, currentSliderDate)
  }
}

function rightClickRegion(div)
{
  if (currentMapState == kEditing)
  {
    var regionDataCallback = getRegionData($(div).attr('id'))
    var regionData = regionDataCallback.regionData
    var regionIDsToFill = regionDataCallback.linkedRegionIDs

    if (selectedParty != null && regionData.partyID != selectedParty.getID())
    {
      regionData.partyID = selectedParty.getID()
      regionData.candidateName = regionData.candidateMap[regionData.partyID]
      regionData.margin = 0.1 // Hardcoding tilt == 0.1
    }
    else if (selectedParty != null)
    {
      var marginValueArray = Object.values(marginValues)
      var marginValueIndex = marginValueArray.indexOf(regionData.margin)
      if (marginValueIndex == -1)
      {
        for (marginValueNum in marginValueArray)
        {
          if (regionData.margin >= marginValueArray[marginValueNum])
          {
            regionData.margin = marginValueArray[marginValueNum]
            break
          }
        }
        marginValueIndex = marginValueArray.indexOf(regionData.margin)
      }

      marginValueIndex -= 1
      if (marginValueIndex < 0)
      {
        marginValueIndex = marginValueArray.length-1
      }

      // Hardcoding tilt == 0.1
      regionData.margin = marginValueIndex == marginValueArray.length-1 ? 0.1 : marginValueArray[marginValueIndex]
    }
    else
    {
      regionData.partyID = TossupParty.getID()
      regionData.margin = 0
    }

    updateRegionFillColors(regionIDsToFill, regionData)
    displayPartyTotals(getPartyTotals())
  }
}

function getRegionData(regionID)
{
  var baseRegionIDCallback = getBaseRegionID(regionID)
  regionID = baseRegionIDCallback.baseID
  var linkedRegionIDs = baseRegionIDCallback.linkedIDs

  var regionData = displayRegionDataArray[regionID]

  return {regionData: regionData, linkedRegionIDs: linkedRegionIDs}
}

function getBaseRegionID(regionID)
{
  var linkedRegionIDs = [regionID]
  var foundRegion = regionID in displayRegionDataArray

  for (linkedRegionSetNum in linkedRegions)
  {
    for (linkedRegionIDNum in linkedRegions[linkedRegionSetNum])
    {
      if (linkedRegions[linkedRegionSetNum][linkedRegionIDNum] == regionID)
      {
        for (linkedRegionIDNum in linkedRegions[linkedRegionSetNum])
        {
          var linkedRegionToTest = linkedRegions[linkedRegionSetNum][linkedRegionIDNum]
          if (regionID != linkedRegionToTest)
          {
            linkedRegionIDs.push(linkedRegionToTest)
          }
          if (!foundRegion && linkedRegionToTest in displayRegionDataArray)
          {
            regionID = linkedRegionToTest
          }
        }
        return {baseID: regionID, linkedIDs: linkedRegionIDs}
      }
    }
  }

  return {baseID: regionID, linkedIDs: linkedRegionIDs}
}

function updateRegionFillColors(regionIDsToUpdate, regionData, shouldUpdatePieChart)
{
  var fillColor
  var shouldHide = false
  if (regionData.partyID == null || regionData.partyID == TossupParty.getID() || (regionData.disabled == true && currentMapType.getMapSettingValue("mapCurrentSeats") == false))
  {
    if (regionData.disabled == true)
    {
      fillColor = regionDisabledColor

      var regionsToHide = currentMapType.getRegionsToHideOnDisable()
      for (regexNum in regionsToHide)
      {
        if (regionsToHide[regexNum].test(regionData.region))
        {
          shouldHide = true
          break
        }
      }
    }
    else
    {
      fillColor = TossupParty.getMarginColors().safe
    }
  }
  else
  {
    fillColor = politicalParties[regionData.partyID].getMarginColors()[getMarginIndexForValue(regionData.margin, regionData.partyID)]
  }

  for (regionIDNum in regionIDsToUpdate)
  {
    var regionDiv = $("#" + regionIDsToUpdate[regionIDNum])
    regionDiv.css('animation-fill-mode', 'forwards')
    regionDiv.css('fill', fillColor)

    regionDiv.css('opacity', shouldHide ? 0 : 1)

    if (regionData.disabled == true)
    {
      regionDiv.css('pointer-events', 'none')
    }
    else
    {
      regionDiv.css('pointer-events', 'inherit')
    }
  }

  if (shouldUpdatePieChart == null || shouldUpdatePieChart == true)
  {
    updateEVPieChart()
  }
}

function getMarginIndexForValue(margin, partyID)
{
  if (margin == 101)
  {
    return "current"
  }
  for (marginName in marginValues)
  {
    if (Math.abs(margin) >= marginValues[marginName])
    {
      return marginName
    }
  }
}

function getPartyTotals()
{
  var partyTotals = {}

  for (partyIDNum in mainPoliticalPartyIDs)
  {
    partyTotals[mainPoliticalPartyIDs[partyIDNum]] = 0
  }

  for (regionID in displayRegionDataArray)
  {
    var partyIDToSet = displayRegionDataArray[regionID].partyID
    if (displayRegionDataArray[regionID].partyID == null)
    {
      partyIDToSet = TossupParty.getID()
    }
    partyTotals[partyIDToSet] += currentMapType.getEV(getCurrentDecade(), regionID)
  }

  return partyTotals
}

function displayPartyTotals(partyTotals)
{
  for (partyID in partyTotals)
  {
    $("#" + partyID).html(politicalParties[partyID].getCandidateName() + " (" + partyTotals[partyID] + ")")
  }
}

function getCurrentDecade()
{
  var dateForDecade
  if (currentMapSource.getID() == currentCustomMapSource.getID() && showingCompareMap)
  {
    var compareDate = mapSources[compareMapSourceIDArray[0]].getMapDates()[$("#firstCompareDataMapDateSlider")[0].value-1]
    if (compareDate != null)
    {
      dateForDecade = new Date(compareDate)
    }
  }
  else if (currentSliderDate != null)
  {
    dateForDecade = currentSliderDate
  }
  return Math.floor(((dateForDecade || new Date()).getFullYear()-1)/10)*10
}

function getCurrentDateOrToday()
{
  var dateToUse = new Date(getTodayString()).getTime()
  if (currentSliderDate)
  {
    dateToUse = currentSliderDate.getTime()
  }

  return dateToUse
}

function getTodayString(delimiter, includeTime)
{
  var currentTimeDate = new Date()
  return getMDYDateString(currentTimeDate, delimiter, includeTime)
}

function getMDYDateString(date, delimiter, includeTime)
{
  delimiter = delimiter || "/"

  var dateString = (date.getMonth()+1) + delimiter + date.getDate() + delimiter + date.getFullYear()

  if (includeTime)
  {
    dateString += delimiter + zeroPadding(date.getHours()) + delimiter + zeroPadding(date.getMinutes())
  }

  return dateString
}

function updateStateBox(regionID)
{
  var regionData = getRegionData(regionID).regionData
  if (regionID == null || regionData.partyID == null || regionData.partyID == TossupParty.getID() || regionData.disabled == true)
  {
    $("#stateboxcontainer").trigger('hide')
    return
  }
  $("#stateboxcontainer").trigger('show')

  var decimalPlaceToRound = Math.floor(-Math.log(regionData.margin)/Math.log(10)+2)
  if (decimalPlaceToRound <= 0)
  {
    decimalPlaceToRound = 1
  }

  var roundedMarginValue = decimalPadding(Math.round(regionData.margin*Math.pow(10, decimalPlaceToRound))/Math.pow(10, decimalPlaceToRound), currentMapSource.getAddDecimalPadding())
  var regionMarginString = ((currentMapSource.getID() == currentCustomMapSource.getID() && showingCompareMap) ? currentMapSource.getCandidateNames()[regionData.partyID] : regionData.candidateName) + " +" + roundedMarginValue

  if (regionData.chanceChallenger && regionData.chanceIncumbent)
  {
    regionMarginString += "<br></span><span style='font-size: 17px; padding-top: 5px; padding-bottom: 5px; display: block; line-height: 100%;'>Chances<br>"
    regionMarginString += "<span style='color: " + politicalParties[incumbentChallengerPartyIDs.challenger].getMarginColors().lean + ";'>" // Hardcoding challenger first
    regionMarginString += decimalPadding(Math.round(regionData.chanceChallenger*1000)/10)
    regionMarginString += "%</span>&nbsp;&nbsp;&nbsp;<span style='color: " + politicalParties[incumbentChallengerPartyIDs.incumbent].getMarginColors().lean + ";'>"
    regionMarginString += decimalPadding(Math.round(regionData.chanceIncumbent*1000)/10)
    regionMarginString += "%</span></span>"
  }

  if (regionData.partyVotesharePercentages && currentMapSource.getShouldShowVoteshare() == true)
  {
    var sortedPercentages = regionData.partyVotesharePercentages.sort((voteData1, voteData2) => {
      return voteData2.voteshare - voteData1.voteshare
    })

    regionMarginString += "<br></span><span style='font-size: 17px; padding-top: 5px; padding-bottom: 5px; display: block; line-height: 100%;'>"
    regionMarginString += "Voteshare<br>"

    sortedPercentages.forEach(voteData => {
      regionMarginString += "<span style='color: " + politicalParties[voteData.partyID].getMarginColors().lean + ";'>" + voteData.candidate + ": "
      regionMarginString += decimalPadding(Math.round(voteData.voteshare*100)/100)
      regionMarginString += "%</span><br>"
    })

    regionMarginString += "</span>"
  }

  //Couldn't get safe colors to look good
  // + "<span style='color: " + politicalParties[regionData.partyID].getMarginColors()[getMarginIndexForValue(roundedMarginValue, regionData.partyID)] + "; -webkit-text-stroke-width: 0.5px; -webkit-text-stroke-color: white;'>"
  $("#statebox").html(getKeyByValue(mapRegionNameToID, currentRegionID) + "<br>" + "<span style='color: " + politicalParties[regionData.partyID].getMarginColors().lean + ";'>" + regionMarginString + "</span>")
}

function updateCountdownTimer()
{
  var currentDate = new Date()

  var countdownTime
  if (currentCountdownTimeName != null)
  {
    countdownTime = countdownTimes[currentCountdownTimeName].time
  }
  else
  {
    countdownTime = Object.values(countdownTimes).map((timeData) => {return timeData.time}).sort().slice(-1)[0]
    for (timeName in countdownTimes)
    {
      if (currentDate.getTime() < countdownTimes[timeName].time)
      {
        countdownTime = countdownTimes[timeName].time
        break
      }
    }

    for (timeName in countdownTimes)
    {
      if (countdownTime == countdownTimes[timeName].time)
      {
        currentCountdownTimeName = timeName
        break
      }
    }
  }

  var timeUntilDay = Math.abs(countdownTime-currentDate.getTime())
  var timeHasPassed = Math.sign(countdownTime-currentDate.getTime()) == -1

  var daysUntilDay = Math.floor(timeUntilDay/(1000*60*60*24))
  var hoursUntilDay = Math.floor(timeUntilDay/(1000*60*60)%24)
  var minutesUntilDay = Math.floor(timeUntilDay/(1000*60)%60)
  var secondsUntilDay = Math.floor(timeUntilDay/1000%60)

  $("#countdownDisplay").html((timeHasPassed ? "+" : "–") + " " + daysUntilDay + "<span style='font-size: 16px;'> day" + (daysUntilDay == 1 ? "" : "s") + "</span>&nbsp;&nbsp;" + zeroPadding(hoursUntilDay) + "<span style='font-size: 16px;'> hr" + (hoursUntilDay == 1 ? "" : "s") + "</span>&nbsp;&nbsp;" + zeroPadding(minutesUntilDay) + "<span style='font-size: 16px;'> min" + (minutesUntilDay == 1 ? "" : "s") + "</span>&nbsp;&nbsp;" + zeroPadding(secondsUntilDay) + "<span style='font-size: 16px;'> s" + "</span>")
}

async function toggleCompareMapSourceCheckbox(mapSourceID, overrideAdd)
{
  var checkboxID = mapSourceID.replace(/\s/g, '') + '-compare'
  if (!$('#' + checkboxID).prop('disabled') || overrideAdd)
  {
    $('#' + checkboxID).prop('checked', !$('#' + checkboxID).prop('checked') || overrideAdd)
    await addCompareMapSource(mapSourceID)
  }
}

async function addCompareMapSource(mapSourceID, clickDivIDToIgnore)
{
  if (clickDivIDToIgnore != null)
  {
    ignoreMapUpdateClickArray.push(clickDivIDToIgnore)
  }

  var checkboxID = mapSourceID.replace(/\s/g, '') + "-compare"
  var checkboxChecked = $("#" + checkboxID).prop('checked')

  var compareSourcesUpdated
  var mapSourceToUncheck
  if (checkboxChecked && compareMapSourceIDArray[0] == null && compareMapSourceIDArray[1] == null)
  {
    compareSourcesUpdated = [true, true]
    compareMapSourceIDArray[0] = mapSourceID
    compareMapSourceIDArray[1] = mapSourceID
  }
  else if (checkboxChecked && compareMapSourceIDArray[0] == compareMapSourceIDArray[1])
  {
    compareSourcesUpdated = [false, true]
    compareMapSourceIDArray[1] = mapSourceID
  }
  else if (checkboxChecked)
  {
    compareSourcesUpdated = [true, true]
    mapSourceToUncheck = shouldSwapCompareMapSources(compareMapSourceIDArray[0], compareMapSourceIDArray[1]) ? compareMapSourceIDArray[0] : compareMapSourceIDArray[1]
    compareMapSourceIDArray[0] = compareMapSourceIDArray[0] == mapSourceToUncheck ? mapSourceID : compareMapSourceIDArray[0]
    compareMapSourceIDArray[1] = compareMapSourceIDArray[1] == mapSourceToUncheck ? mapSourceID : compareMapSourceIDArray[1]
  }
  else if (!checkboxChecked && compareMapSourceIDArray[0] != compareMapSourceIDArray[1])
  {
    if (compareMapSourceIDArray[0] == mapSourceID)
    {
      compareSourcesUpdated = [true, false]
      compareMapSourceIDArray[0] = compareMapSourceIDArray[1]
    }
    else if (compareMapSourceIDArray[1] == mapSourceID)
    {
      compareSourcesUpdated = [false, true]
      compareMapSourceIDArray[1] = compareMapSourceIDArray[0]
    }
  }
  else if (!checkboxChecked && compareMapSourceIDArray[0] == compareMapSourceIDArray[1])
  {
    clearMap()
    return
  }

  if (mapSourceToUncheck)
  {
    $("#" + mapSourceToUncheck.replace(/\s/g, '') + "-compare").prop('checked', false)
  }

  await updateCompareMapSources(compareSourcesUpdated, false)

  showingCompareMap = true
  toggleMapSettingDisable("seatArrangement", true)
  updateCompareMapSlidersVisibility()
}

function updateCompareMapSources(compareSourcesToUpdate, overrideSwapSources, swapSliderValues)
{
  var updateCompareMapSourcesPromise = new Promise(async (resolve, reject) => {
    if (compareSourcesToUpdate[0])
    {
      var iconDivDictionary = getIconDivsToUpdateArrayForSourceID(compareMapSourceIDArray[0])
      $('.comparesourcecheckbox').prop('disabled', true)
      await downloadDataForMapSource(compareMapSourceIDArray[0], iconDivDictionary, null, false)
      $('.comparesourcecheckbox').prop('disabled', false)
    }
    if (compareSourcesToUpdate[1])
    {
      var iconDivDictionary = getIconDivsToUpdateArrayForSourceID(compareMapSourceIDArray[1])
      $('.comparesourcecheckbox').prop('disabled', true)
      await downloadDataForMapSource(compareMapSourceIDArray[1], iconDivDictionary, null, false)
      $('.comparesourcecheckbox').prop('disabled', false)
    }

    if (shouldSwapCompareMapSources(compareMapSourceIDArray[0], compareMapSourceIDArray[1]) && !overrideSwapSources)
    {
      swapCompareMapSources()
      compareSourcesToUpdate = [true, true]
    }

    var overrideDateValues = [null, null]
    if (swapSliderValues)
    {
      overrideDateValues[0] = $("#secondCompareDataMapDateSlider").val()
      overrideDateValues[1] = $("#firstCompareDataMapDateSlider").val()
    }

    var latestSliderTickEnabled = currentMapType.getMapSettingValue("latestTick")

    if (compareSourcesToUpdate[0])
    {
      setDataMapDateSliderRange(true, "firstCompareDataMapDateSlider", "firstCompareDataMapSliderStepList", mapSources[compareMapSourceIDArray[0]].getMapDates())
      $("#firstCompareDataMapDateSlider").val(overrideDateValues[0] || mapSources[compareMapSourceIDArray[0]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0))
      setCompareSourceDate(0, overrideDateValues[0] || mapSources[compareMapSourceIDArray[0]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0))
      $("#compareItemImage-0").css('display', "block")
      $("#compareItemImage-0").prop('src', mapSources[compareMapSourceIDArray[0]].getIconURL())
    }
    if (compareSourcesToUpdate[1])
    {
      setDataMapDateSliderRange(true, "secondCompareDataMapDateSlider", "secondCompareDataMapSliderStepList", mapSources[compareMapSourceIDArray[1]].getMapDates())
      $("#secondCompareDataMapDateSlider").val(overrideDateValues[1] || mapSources[compareMapSourceIDArray[1]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0))
      setCompareSourceDate(1, overrideDateValues[1] || mapSources[compareMapSourceIDArray[1]].getMapDates().length+(latestSliderTickEnabled ? 1 : 0))
      $("#compareItemImage-1").css('display', "block")
      $("#compareItemImage-1").prop('src', mapSources[compareMapSourceIDArray[1]].getIconURL())
    }

    resolve()
  })

  return updateCompareMapSourcesPromise
}

function shouldSwapCompareMapSources(firstMapSourceID, secondMapSourceID)
{
  return mapSources[firstMapSourceID].getMapDates().slice(-1)[0] < mapSources[secondMapSourceID].getMapDates().slice(-1)[0]
}

function swapCompareMapSources()
{
  var tempSourceID = compareMapSourceIDArray[0]
  compareMapSourceIDArray[0] = compareMapSourceIDArray[1]
  compareMapSourceIDArray[1] = tempSourceID
}

function updateCompareMapSlidersVisibility(overrideShowHide)
{
  var showCompareSliders = overrideShowHide
  if (showCompareSliders == null)
  {
    showCompareSliders = showingCompareMap
  }

  if (showCompareSliders)
  {
    $("#firstCompareSliderDateDisplayContainer").show()
    $("#secondCompareSliderDateDisplayContainer").show()

    $("#sliderDateDisplayContainer").hide()
  }
  else
  {
    $("#firstCompareSliderDateDisplayContainer").hide()
    $("#secondCompareSliderDateDisplayContainer").hide()

    $("#sliderDateDisplayContainer").show()
  }

  if (showingCompareMap)
  {
    $("#compareButton").addClass('active')
    $("#compareArrayDropdownContainer").show()
    $("#comparePresetsDropdownContainer").hide()
  }
  else
  {
    $("#compareButton").removeClass('active')
    $("#comparePresetsDropdownContainer").show()
    $("#compareArrayDropdownContainer").hide()
  }
}

function setMapCompareItem(compareArrayIndex)
{
  if (!showingDataMap) { return }
  compareMapDataArray[compareArrayIndex] = cloneObject(displayRegionDataArray)
  $("#compareItem-" + compareArrayIndex).html(currentMapSource.getName() + " : " + getMDYDateString(currentSliderDate))
}

function setCompareSourceDate(compareArrayIndex, dateIndex)
{
  var mapDates = mapSources[compareMapSourceIDArray[compareArrayIndex]].getMapDates()

  var dateToDisplay
  var overrideDateString
  if (dateIndex-1 > mapDates.length-1)
  {
    dateToDisplay = new Date(mapDates[dateIndex-1-1])
    overrideDateString = "Latest (" + (zeroPadding(dateToDisplay.getMonth()+1)) + "/" + zeroPadding(dateToDisplay.getDate()) + "/" + dateToDisplay.getFullYear() + ")"
  }
  else
  {
    dateToDisplay = new Date(mapDates[dateIndex-1])
  }
  updateSliderDateDisplay(dateToDisplay, overrideDateString, compareArrayIndex == 0 ? "firstCompareDateDisplay" : "secondCompareDateDisplay")

  $("#compareItem-" + compareArrayIndex).html(mapSources[compareMapSourceIDArray[compareArrayIndex]].getName() + " (" + getMDYDateString(dateToDisplay) + ")")

  compareMapDataArray[compareArrayIndex] = mapSources[compareMapSourceIDArray[compareArrayIndex]].getMapData()[dateToDisplay.getTime()]

  if (compareArrayIndex == 0)
  {
    currentCustomMapSource.setCandidateNames(mapSources[compareMapSourceIDArray[compareArrayIndex]].getCandidateNames(dateToDisplay.getTime()))
  }

  applyCompareToCustomMap()
}

function applyCompareToCustomMap()
{
  if (compareMapDataArray.length < 2 || compareMapDataArray[0] == null || compareMapDataArray[1] == null) { return }

  var resultMapArray = {}
  for (regionID in compareMapDataArray[0])
  {
    var compareRegionData0 = compareMapDataArray[0][regionID]
    var compareRegionData1 = compareMapDataArray[1][regionID]

    if (currentMapType.getMapSettings()["seatArrangement"] == "election-type" && compareRegionData0.seatClass != compareRegionData1.seatClass)
    {
      if (regionID.endsWith("-S"))
      {
        compareRegionData1 = compareMapDataArray[1][regionID.replace("-S", "")]
      }
      else
      {
        compareRegionData1 = compareMapDataArray[1][regionID + "-S"]
      }
    }

    if (compareRegionData0.partyID == TossupParty.getID())
    {
      resultMapArray[regionID] = cloneObject(compareRegionData0)
    }
    else if (compareRegionData0.disabled == true || compareRegionData1.disabled == true)
    {
      resultMapArray[regionID] = cloneObject(compareRegionData0)
      resultMapArray[regionID].disabled = true
      resultMapArray[regionID].margin = 101
    }
    else
    {
      resultMapArray[regionID] = {}

      if (compareRegionData0.partyID == compareRegionData1.partyID)
      {
        resultMapArray[regionID].margin = compareRegionData0.margin-compareRegionData1.margin
      }
      else
      {
        resultMapArray[regionID].margin = compareRegionData0.margin+compareRegionData1.margin
      }

      if (resultMapArray[regionID].margin < 0)
      {
        var sortedVoteshareArray = compareRegionData0.partyVotesharePercentages.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
        resultMapArray[regionID].partyID = sortedVoteshareArray[1].partyID
        resultMapArray[regionID].margin = Math.abs(resultMapArray[regionID].margin)
      }
      else
      {
        resultMapArray[regionID].partyID = compareRegionData0.partyID
      }

      if (compareRegionData0.seatClass)
      {
        resultMapArray[regionID].seatClass = compareRegionData0.seatClass
      }
    }
  }

  currentCustomMapSource.updateMapData(resultMapArray, (new Date(getTodayString())).getTime(), true)
  currentMapSource = currentCustomMapSource
  updateMapSourceButton()
  loadDataMap()
}

async function loadCompareItemMapSource(compareItemNum)
{
  currentMapSource = mapSources[compareMapSourceIDArray[compareItemNum]]
  updateMapSourceButton()
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
  displayDataMap(dateIndexToSet)
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

function addConstantMarginToMap(marginToAdd)
{
  if (currentMapState != kEditing || selectedParty == null || selectedParty.getID() == TossupParty.getID()) { return }

  for (regionID in displayRegionDataArray)
  {
    if (displayRegionDataArray[regionID].partyID != selectedParty.getID())
    {
      displayRegionDataArray[regionID].margin -= marginToAdd

      if (displayRegionDataArray[regionID].margin < 0)
      {
        displayRegionDataArray[regionID].margin *= -1
        displayRegionDataArray[regionID].partyID = selectedParty.getID()
      }
    }
    else
    {
      displayRegionDataArray[regionID].margin += marginToAdd
    }

    if (displayRegionDataArray[regionID].margin > 100)
    {
      displayRegionDataArray[regionID].margin = 100
    }
  }

  currentCustomMapSource.updateMapData(displayRegionDataArray, getCurrentDateOrToday(), false)
  loadDataMap()
}
