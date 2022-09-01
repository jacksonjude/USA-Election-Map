var currentMapType

var mapSources
var mapSourceIDs
var currentCustomMapSource

var mapRegionNameToID

var currentMapSource

var currentDisplayDate
var displayMapQueue = []
var isRunningDisplayMapQueue = false

var selectedParty

var defaultMarginValues = {safe: 15, likely: 5, lean: 1, tilt: Number.MIN_VALUE}
var marginValues = JSON.parse(getCookie(marginsCookieName)) || cloneObject(defaultMarginValues)
var marginNames = {safe: "Safe", likely: "Likely", lean: "Lean", tilt: "Tilt"}

const defaultRegionFillColor = TossupParty.getMarginColors().safe
const regionFillAnimationDuration = 0.1
const regionStrokeAnimationDuration = 0.06

const regionSelectColor = "#ffffff"
const regionDeselectColor = "#181922" //#555

const regionDisabledColor = "#28292F"

const flipPatternBrightnessFactor = 0.8
const flipPatternHeight = 5
const flipPatternWidth = 5

const linkedRegions = [["MD", "MD-button"], ["DE", "DE-button"], ["NJ", "NJ-button"], ["CT", "CT-button"], ["RI", "RI-button"], ["MA", "MA-button", "MA-N"], ["VT", "VT-button"], ["NH", "NH-button"], ["HI", "HI-button"], ["ME-AL", "ME-AL-land"], ["ME-D1", "ME-D1-land"], ["ME-D2", "ME-D2-land"], ["NE-AL", "NE-AL-land"], ["NE-D1", "NE-D1-land"], ["NE-D2", "NE-D2-land"], ["NE-D3", "NE-D3-land"]]

const noInteractSVGRegionAttribute = "data-nointeract"
const noCountSVGRegionAttribute = "data-nocount"
const isDistrictBoxRegionAttribute = "data-isdistrictbox"

const nationalPopularVoteID = "NPV"
const statePopularVoteDistrictID = "PV"

const subregionSeparator = "__"

var displayRegionDataArray
const regionIDsToIgnore = [/.+-button/, /.+-N/, /.+-land/]

var showingDataMap = false

var shouldDragSelect = false

var editingRegionEVs = false
var overrideRegionEVs = {}

var editingRegionMarginValue = false
var editingRegionVotesharePercentages = false
var voteshareEditRegion
var selectedVoteshareCandidate

var ignoreMapUpdateClickArray

var currentSliderDate
const initialKeyPressDelay = 500
const zoomKeyPressDelayForHalf = 3000
const maxDateSliderTicks = 55

const ViewingState = {
  viewing: 0,
  zooming: 1,
  splitVote: 2
}
var currentViewingState

const EditingState = {
  viewing: 2,
  editing: 3
}
var currentEditingState

var currentMapZoomRegion

var showingHelpBox = false

var showingCompareMap
var compareMapSourceIDArray
var compareMapDataArray
var selectedCompareSlider

var selectedDropdownDivID = null

$(async function() {
  currentMapType = mapTypes[getCookie("currentMapType") || mapTypeIDs[0]] || mapTypes[mapTypeIDs[0]]
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
    "assets/lte-large.png"
  ])

  createMarginEditDropdownItems()
  createCountdownDropdownItems()
  createPartyDropdowns()
  updateSelectedEditMode()

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

async function reloadForNewMapType(initialLoad)
{
  var previousDateOverride
  if (!initialLoad)
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
  }
  else
  {
    $("#editDoneButton").addClass('topnavdisable2')
  }

  if (currentMapType.getCompareMapEnabled())
  {
    $("#compareButton").removeClass('topnavdisable2')
    $("#compareDropdownContent").removeClass('topnavdisable2')
    $("#compareDropdownContent").css("opacity", "100%")
  }
  else
  {
    $("#compareButton").addClass('topnavdisable2')
    $("#compareDropdownContent").addClass('topnavdisable2')
    $("#compareDropdownContent").css("opacity", "0%")
  }

  selectedParty = null
  displayRegionDataArray = {}
  showingDataMap = false
  ignoreMapUpdateClickArray = []
  currentSliderDate = null
  currentEditingState = EditingState.viewing
  currentViewingState = currentMapType.getMapSettingValue("presViewingType") ? ViewingState.splitVote : ViewingState.viewing
  currentMapZoomRegion = null
  showingCompareMap = false
  compareMapSourceIDArray = [null, null]
  compareMapDataArray = [null, null]
  selectedCompareSlider = null

  createMapTypeDropdownItems()
  createMapSourceDropdownItems()
  createSettingsDropdownItems()
  createComparePresetDropdownItems()

  currentMapSource = (currentMapType.getCurrentMapSourceID() && currentMapType.getCurrentMapSourceID() in mapSources && !(!currentMapType.getCustomMapEnabled() && currentMapType.getCurrentMapSourceID() == currentMapType.getCustomMapSource().getID())) ? mapSources[currentMapType.getCurrentMapSourceID()] : NullMapSource
  if (currentMapSource.getID() == NullMapSource.getID())
  {
    $("#sourceToggleButton").addClass('active')
  }

  await loadMapSVGFile()

  $("#totalsPieChartContainer").html("<canvas id='totalsPieChart'></canvas>")
  $("#helpbox").html(currentMapType.getControlsHelpHTML())

  $("#loader").hide()
  resizeElements(false)

  populateRegionsArray()
  for (let partyID of dropdownPoliticalPartyIDs)
  {
    if (partyID == TossupParty.getID() || !politicalParties[partyID]) { continue }
    politicalParties[partyID].setCandidateName(politicalParties[partyID].getNames()[0])
  }
  displayPartyTotals(getPartyTotals())

  setupTotalsPieChart()
  updateTotalsPieChart()

  updateIconsBasedOnLocalCSVData()

  if (currentMapSource.getID() != NullMapSource.getID())
  {
    updateNavBarForNewSource(false, false)
    loadDataMap(false, false, previousDateOverride)
  }
  else
  {
    updateNavBarForNewSource(true, false)
  }
}

function loadMapSVGFile(handleNewSVG, fadeForNewSVG)
{
  let loadSVGFilePromise = new Promise(async (resolve) => {
    $("#loader").show()

    if (fadeForNewSVG)
    {
      $("#svgdata").css('opacity', "0")
    }

    handleNewSVG = handleNewSVG || async function(resolve, svgPath) {
      if (svgPath instanceof Array)
      {
        await handleSVGZooming(resolve, svgPath, handleNewSVGFields, fadeForNewSVG)
      }
      else
      {
        handleNewSVGFields(resolve, fadeForNewSVG)
      }
    }

    let svgPath = await currentMapType.loadSVG()
    handleNewSVG(resolve, svgPath)
  })

  return loadSVGFilePromise
}

function handleNewSVGFields(resolve, _, fadeForNewSVG)
{
  if (fadeForNewSVG)
  {
    $("#mapcontainertmp #svgdata").css('opacity', "0")
  }

  $("#mapcontainer").html($("#mapcontainertmp").html())
  $("#mapcontainertmp").empty()

  setOutlineDivProperties()
  updateMapElectoralVoteText()

  if (currentMapType.getMapSettingValue("flipStates"))
  {
    generateFlipPatternsFromPartyMap(politicalParties)
  }

  $("#loader").hide()

  if (fadeForNewSVG)
  {
    $("#svgdata").css('opacity', "1")
  }

  resolve()
}

async function handleSVGZooming(resolve, svgPath, handleNewSVG, fadeForNewSVG)
{
  var handleSVGZoomingPromise = new Promise((innerResolve) => {
    var stateToShow = svgPath[1]
    if (stateToShow != null)
    {
      for (let districtPath of $("#mapcontainertmp #outlines")[0].querySelectorAll("*"))
      {
        var splitArray = districtPath.id.split(subregionSeparator)
        if ((stateToShow != splitArray[0] && splitArray[0] != "use") || splitArray[1] == "button")
        {
          districtPath.remove()
        }
      }

      $("#mapcontainertmp #text").remove()
    }

    setTimeout(() => {
      var svgDataBoundingBox = $("#mapcontainertmp #svgdata")[0].getBBox()
      $("#mapcontainertmp #outlines").css("stroke-width", (Math.max(svgDataBoundingBox.width/$("#mapcontainertmp #svgdata").width(), svgDataBoundingBox.height/$("#mapcontainertmp #svgdata").height())*1) + "px")
      $("#mapcontainertmp #svgdata")[0].setAttribute('viewBox', (svgDataBoundingBox.x) + " " + (svgDataBoundingBox.y) + " " + (svgDataBoundingBox.width) + " " + (svgDataBoundingBox.height))

      handleNewSVG(() => {
        innerResolve()
        resolve()
      }, svgPath, fadeForNewSVG)
    }, 0)
  })

  return handleSVGZoomingPromise
}

function setOutlineDivProperties()
{
  $('#outlines').children().each(function() {
    var outlineDiv = $(this)

    outlineDiv.css('cursor', "pointer")

    outlineDiv.css('transition', "fill " + regionFillAnimationDuration + "s linear, stroke " + regionStrokeAnimationDuration + "s linear")
    outlineDiv.css('fill', defaultRegionFillColor)

    outlineDiv.attr('onmouseenter', "mouseEnteredRegion(this)")
    outlineDiv.attr('onmouseleave', "mouseLeftRegion(this)")

    outlineDiv.on('click', function(e) {
      if (e.altKey)
      {
        altClickRegion(e.target)
      }
      else if (e.shiftKey)
      {
        shiftClickRegion(e.target)
      }
      else if (e.which == 3 || e.ctrlKey)
      {
        return // handled in contextmenu
      }
      else
      {
        leftClickRegion(e.target)
      }
    })

    outlineDiv.on('contextmenu', function(e) {
      rightClickRegion(e.target)
    })
  })
}

function resizeElements(initilizedPieChart)
{
  var windowWidth = $(window).width()

  //1.0*svgdatawidth*zoom/windowwidth == 0.6
  const defaultMapZoom = 120.634/100
  var mapZoom = 0.62*windowWidth/$("#svgdata").width()
  var topnavZoom = 0.85*mapZoom
  if (navigator.userAgent.indexOf("Firefox") != -1)
  {
    $("#mapcontainer").css("transform", "scale(" + mapZoom + ")")
    $("#mapcontainer").css("transform-origin", "0 0")
  }
  else
  {
    $("#mapcontainer").css("zoom", (mapZoom*100) + "%")
    $("#helpbox").css("zoom", (mapZoom*100/defaultMapZoom) + "%")

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

  if (navigator.userAgent.indexOf("Firefox") != -1)
  {
    $("#totalsPieChart").width(windowWidth-windowWidth*0.15-mapWidth)
    $("#totalsPieChart").height(windowWidth-windowWidth*0.09-mapWidth)
  }
  else
  {
    $("#totalsPieChart").width(windowWidth-windowWidth*0.12-mapWidth)
    $("#totalsPieChart").height(windowWidth-windowWidth*0.09-mapWidth)
  }
  $("#totalsPieChart").css("background-size", $("#totalsPieChart").width()*totalsPieChartCutoutPercent/100.0*0.5)
  $("#totalsPieChart").css("background-position", "center")
  $("#totalsPieChart").css("background-repeat", "no-repeat")

  $("#helpboxcontainer").css('width', $("#totalsPieChart").width())
  $("#partyDropdownsBoxContainer").css('width', $("#totalsPieChart").width())
  $("#partyDropdownsFlexbox").css('min-height', (110*mapZoom/defaultMapZoom))

  $("#discordInvite").css("width", $("#totalsPieChart").width())
  $("#discordInvite").css("border-radius", "5px")
  $("#discordInvite").css("border", "1px solid gray")

  if (initilizedPieChart == true || initilizedPieChart == null)
  {
    updateTotalsPieChart()
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
    $("#" + dateDisplayDivID).css("zoom", (100*($(window).width()-1800)/6000+100) + "%")
  }

  $("#" + dateDisplayDivID).css("margin-top", ($("#" + sliderDivID).height()/4-1))
}

function preloadAssets(assetURLs)
{
  for (var urlNum in assetURLs)
  {
    (new Image()).src = assetURLs[urlNum]
  }
}

function addDivEventListeners()
{
  document.getElementById("clearMapButton").addEventListener('click', function(e) {
    clearMap()

    if (e.altKey)
    {
      for (var mapSourceID in mapSources)
      {
        mapSources[mapSourceID].resetMapData()
        removeStatusImage(mapSourceID.replace(/\s/g, '') + "-icon")
        insertStatusImage(mapSourceID.replace(/\s/g, '') + "-icon", "./assets/icon-download-none.png", 24, 24, -1)
      }
    }
  })

  document.getElementById("sourceToggleButton").addEventListener('click', function(e) {
    if (currentEditingState == EditingState.editing) { return }
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

  $("#regionboxcontainer").on('show', function() {
    $(this).show()
    $(this).css('opacity', "1")
  })

  $("#regionboxcontainer").on('hide', function() {
    $(this).css('opacity', "0")

    setTimeout(function() {
      if ($("#regionboxcontainer").css('opacity') == "0" && !currentRegionID) { $("#regionboxcontainer").hide() }
    }, 200)
  })

  $("#mapCloseButton").hover(function() {
    $("#mapCloseButtonImage").attr('src', "./assets/close-icon-hover.png")
  }, function() {
    $("#mapCloseButtonImage").attr('src', "./assets/close-icon.png")
  })

  createPartyDropdownsBoxHoverHandler()
}

function addTextBoxSpacingCSS()
{
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

function loadDataMap(shouldSetToMax, forceDownload, previousDateOverride, resetCandidateNames, reloadPartyDropdowns)
{
  var loadDataMapPromise = new Promise(async (resolve) => {
    $("#dataMapDateSliderContainer").hide()
    $("#dateDisplay").hide()

    if (selectedDropdownDivID != "mapSourcesDropdownContent")
    {
      $("#sourceToggleButton").removeClass('active')
    }

    if (editMarginID)
    {
      toggleMarginEditing(editMarginID)
    }
    if (isEnteringShiftAmount)
    {
      toggleEnteringShiftAmount()
    }
    if (editCandidateNamePartyID)
    {
      toggleCandidateNameEditing(editCandidateNamePartyID, null, true)
    }
    if (editPartyMarginColor)
    {
      toggleMarginHexColorEditing()
    }
    if (editPartyPopularVote)
    {
      togglePartyPopularVoteEditing(editPartyPopularVote)
    }
    editingRegionEVs = false
    editingRegionMarginValue = false
    editingRegionVotesharePercentages = false
    voteshareEditRegion = null
    selectedVoteshareCandidate = null

    currentMapType.setCurrentMapSourceID(currentMapSource.getID())

    var iconDivDictionary = getIconDivsToUpdateArrayForSourceID(currentMapSource.getID())
    var loadedSuccessfully = await downloadDataForMapSource(currentMapSource.getID(), iconDivDictionary, null, forceDownload, null, null, resetCandidateNames)

    if (!loadedSuccessfully) { resolve(); return }

    // shouldSetToMax = currentMapType.getMapSettingValue("startAtLatest") ? true : shouldSetToMax
    shouldSetToMax = true

    setDataMapDateSliderRange(shouldSetToMax, null, null, null, previousDateOverride)
    await displayDataMap(null, reloadPartyDropdowns ?? true)
    $("#dataMapDateSliderContainer").show()
    $("#dateDisplay").show()

    $("#totalsPieChart").attr('onclick', "!currentMapZoomRegion ? currentMapSource.openHomepageLink(currentSliderDate) : currentMapSource.openRegionLink(currentMapZoomRegion, currentSliderDate)")

    if (currentMapSource.getIconURL() != null && currentMapSource.getIconURL() != "none")
    {
      $("#totalsPieChart").css("background-image", "url(" + currentMapSource.getIconURL() + ")")
    }
    else
    {
      $("#totalsPieChart").css("background-image", "")
    }

    resolve()
  })

  return loadDataMapPromise
}

function setDataMapDateSliderRange(shouldSetToMax, sliderDivID, sliderTickDivID, mapDates, previousDate)
{
  shouldSetToMax = shouldSetToMax == null ? false : shouldSetToMax
  sliderDivID = sliderDivID || "dataMapDateSlider"
  sliderTickDivID = sliderTickDivID || "dataMapSliderStepList"
  mapDates = mapDates || currentMapSource.getMapDates()
  previousDate = previousDate || (currentSliderDate ? currentSliderDate.getTime() : null)

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
    for (let dateNum in mapDates)
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
    for (let _ in mapDates)
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
    dateString = getDateString(dateToDisplay, "/", false, true)
  }

  $("#" + sliderDateDisplayDivID).html(dateString)
  currentSliderDate = dateToDisplay
}

function addToDisplayMapQueue(index, reloadPartyDropdowns)
{
  displayMapQueue.unshift([index, reloadPartyDropdowns])
  executeDisplayMapQueue()
}

async function executeDisplayMapQueue()
{
  if (isRunningDisplayMapQueue) { return }

  isRunningDisplayMapQueue = true

  while (displayMapQueue.length > 0)
  {
    await displayDataMap(displayMapQueue[0][0], displayMapQueue[0][1])
    displayMapQueue.splice(-1, 1)
  }

  isRunningDisplayMapQueue = false
}

async function displayDataMap(dateIndex, reloadPartyDropdowns, fadeForNewSVG)
{
  dateIndex = dateIndex || $("#dataMapDateSlider").val()

  var mapDates = currentMapSource.getMapDates()
  var dateToDisplay = new Date(mapDates[dateIndex-1])

  currentDisplayDate = dateToDisplay

  updateSliderDateDisplay(dateToDisplay)

  var shouldReloadSVG = false
  var currentSVGPath = currentMapType.getSVGPath()
  var newOverrideSVGPath = await currentMapSource.getOverrideSVGPath(!showingCompareMap ? dateToDisplay : currentSliderDate)

  if (newOverrideSVGPath != null && JSON.stringify(currentSVGPath) != JSON.stringify(newOverrideSVGPath))
  {
    currentMapType.setOverrideSVGPath(newOverrideSVGPath)
    shouldReloadSVG = true
  }
  else if (newOverrideSVGPath == null && currentSVGPath != null)
  {
    shouldReloadSVG = currentMapType.resetOverrideSVGPath()
  }

  var cachedSVGPathData
  if (shouldReloadSVG)
  {
    await loadMapSVGFile((resolve, svgPath) => {
      cachedSVGPathData = svgPath
      resolve()
    }, fadeForNewSVG)
  }
  var svgPathData = currentMapType.getSVGPath()
  var usedFallbackMap = svgPathData[2] || false
  var populateSVGBoxesFunction = svgPathData[3]

  var currentMapDataForDate = currentMapSource.getMapData()[dateToDisplay.getTime()]

  switch (currentViewingState)
  {
    case ViewingState.viewing:
    currentMapDataForDate = await currentMapSource.getViewingData(currentMapDataForDate)
    break

    case ViewingState.zooming:
    currentMapDataForDate = await currentMapSource.getZoomingData(currentMapDataForDate, currentMapZoomRegion)
    break

    case ViewingState.splitVote:
    currentMapDataForDate = await currentMapSource.getSplitVoteData(currentMapDataForDate)
    break
  }

  if (currentDisplayDate.getTime() != dateToDisplay.getTime())
  {
    // console.log(currentDisplayDate.getFullYear(), dateToDisplay.getFullYear())
    return
  }
  else if (shouldReloadSVG)
  {
    if (cachedSVGPathData instanceof Array)
    {
      await handleSVGZooming(() => {}, cachedSVGPathData, handleNewSVGFields, fadeForNewSVG)
    }
    else
    {
      handleNewSVGFields(() => {}, null, fadeForNewSVG)
    }
  }

  if (currentViewingState == ViewingState.zooming && usedFallbackMap)
  {
    populateSVGBoxesFunction(currentMapDataForDate)
    setOutlineDivProperties()
  }

  displayRegionDataArray = {}
  populateRegionsArray()

  $('#outlines').children().each(function() {
    var regionDataCallback = getRegionData($(this).attr('id'))
    var regionIDsToFill = regionDataCallback.linkedRegionIDs
    var regionData = regionDataCallback.regionData

    updateRegionFillColors(regionIDsToFill, regionData, false)
  })

  for (let regionNum in currentMapDataForDate)
  {
    var regionDataCallback = getRegionData(currentMapDataForDate[regionNum].region)
    var regionData = regionDataCallback.regionData
    var regionsToFill = regionDataCallback.linkedRegionIDs

    if (regionData == null)
    {
      displayRegionDataArray[regionNum] = {}
      regionData = displayRegionDataArray[regionNum]
    }

    regionData.region = currentMapDataForDate[regionNum].region
    regionData.state = currentMapDataForDate[regionNum].state
    regionData.margin = currentMapDataForDate[regionNum].margin
    regionData.partyID = currentMapDataForDate[regionNum].partyID
    regionData.disabled = currentMapDataForDate[regionNum].disabled
    regionData.candidateName = currentMapDataForDate[regionNum].candidateName
    regionData.candidateMap = currentMapDataForDate[regionNum].candidateMap
    regionData.chanceIncumbent = currentMapDataForDate[regionNum].chanceIncumbent
    regionData.chanceChallenger = currentMapDataForDate[regionNum].chanceChallenger
    regionData.partyVotesharePercentages = currentMapDataForDate[regionNum].partyVotesharePercentages
    regionData.seatClass = currentMapDataForDate[regionNum].seatClass
    regionData.flip = currentMapDataForDate[regionNum].flip
    regionData.voteSplits = currentMapDataForDate[regionNum].voteSplits
    regionData.voteWorth = currentMapDataForDate[regionNum].voteWorth

    updateRegionFillColors(regionsToFill, regionData, false)
  }

  updatePoliticalPartyCandidateNames(dateToDisplay.getTime())
  displayPartyTotals(getPartyTotals(), reloadPartyDropdowns)

  updateTotalsPieChart()

  updateMapElectoralVoteText()

  if (currentRegionID && currentEditingState == EditingState.viewing)
  {
    updateRegionBox(currentRegionID)
  }

  if (currentViewingState == ViewingState.zooming)
  {
    svgPanZoom('#svgdata', {controlIconsEnabled: true, fit: true, contain: true, minZoom: 1, panEnabled: false})
  }

  if (shouldReloadSVG)
  {
    if (currentViewingState == ViewingState.zooming)
    {
      $("#mapCloseButton").show()
    }
    else
    {
      $("#mapCloseButton").hide()
    }
  }

  showingDataMap = true
}

function updateMapElectoralVoteText()
{
  if (!currentMapType.getShouldDisplayEVOnMap()) { return }

  var regionIDs = Object.values(mapRegionNameToID)
  for (var regionNum in regionIDs)
  {
    var regionChildren = $("#" + regionIDs[regionNum] + "-text").children()

    var regionEV = currentMapType.getEV(getCurrentDecade(), regionIDs[regionNum], (displayRegionDataArray[regionIDs[regionNum]] || {}))
    if (regionEV == undefined) { continue }
    if (currentViewingState == ViewingState.splitVote && displayRegionDataArray[regionIDs[regionNum]] && displayRegionDataArray[regionIDs[regionNum]].voteSplits && displayRegionDataArray[regionIDs[regionNum]].voteSplits.length > 0)
    {
      regionEV = displayRegionDataArray[regionIDs[regionNum]].voteSplits.reduce((agg, curr) => agg + curr.votes, 0)
    }

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

function updateNavBarForNewSource(revertToDefault, resetViewingState)
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

  if (currentEditingState == EditingState.editing && currentMapSource.isCustom())
  {
    $("#editDoneButton").html("Done")
  }
  else if (currentEditingState == EditingState.editing && currentMapSource.getID() != currentCustomMapSource.getID())
  {
    toggleEditing(EditingState.viewing)
  }
  else if (currentEditingState != EditingState.editing && currentMapSource.isCustom())
  {
    $("#editDoneButton").html("Edit")
    $("#copyDropdownContainer").hide()
  }
  else
  {
    $("#editDoneButton").html("Copy")
    $("#copyDropdownContainer").show()
  }

  updatePartyDropdownVisibility()

  if (showingCompareMap && currentMapSource.getID() != currentCustomMapSource.getID())
  {
    updateCompareMapSlidersVisibility(false)
  }
  else if (showingCompareMap && currentMapSource.isCustom())
  {
    updateCompareMapSlidersVisibility(true)
  }

  if (resetViewingState ?? true)
  {
    currentViewingState = ViewingState.viewing
  }
}

function clearMap(fullClear, shouldResetCurrentMapSource)
{
  fullClear = fullClear == null ? false : fullClear
  shouldResetCurrentMapSource = shouldResetCurrentMapSource != null ? shouldResetCurrentMapSource : true

  if (currentMapSource.getID() != currentCustomMapSource.getID() || currentCustomMapSource.getTextMapData().startsWith("date\n") || fullClear)
  {
    updateNavBarForNewSource(true)
    currentMapSource = NullMapSource
    if (shouldResetCurrentMapSource)
    {
      currentMapType.setCurrentMapSourceID(null)
    }

    toggleEditing(EditingState.viewing)
    if (currentViewingState != ViewingState.viewing)
    {
      currentViewingState = ViewingState.viewing
      currentMapZoomRegion = null
      currentMapType.resetOverrideSVGPath()
      loadMapSVGFile()
    }

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

  for (var partyNum in dropdownPoliticalPartyIDs)
  {
    if (dropdownPoliticalPartyIDs[partyNum] == TossupParty.getID()) { continue }
    politicalParties[dropdownPoliticalPartyIDs[partyNum]].setCandidateName(politicalParties[dropdownPoliticalPartyIDs[partyNum]].getNames()[0])
  }

  $('#outlines').children().each(function() {
    var regionDataCallback = getRegionData($(this).attr('id'))
    var regionIDsToFill = regionDataCallback.linkedRegionIDs
    var regionData = regionDataCallback.regionData

    updateRegionFillColors(regionIDsToFill, regionData, false)
  })
  displayPartyTotals(getPartyTotals())

  updateTotalsPieChart()
  if (currentRegionID != null)
  {
    updateRegionBox(currentRegionID)
  }

  $("#dataMapDateSliderContainer").hide()
  $("#dateDisplay").hide()

  $("#totalsPieChart").css("background-image", "")

  showingDataMap = false
}

function toggleHelpBox()
{
  showingHelpBox = !showingHelpBox
  if (showingHelpBox)
  {
    $("#helpboxcontainer").show()
    $("#toggleHelpBoxButton").addClass('active')
    $("#totalsPieChartContainer").hide()
    $("#partyDropdownsBoxContainer").hide()
    $("#discordInviteContainer").hide()
  }
  else
  {
    $("#helpboxcontainer").hide()
    $("#toggleHelpBoxButton").removeClass('active')
    $("#totalsPieChartContainer").show()
    $("#partyDropdownsBoxContainer").show()
    $("#discordInviteContainer").show()
  }
}

function selectCreditBoxTab(buttonDiv, contentDiv)
{
  $(buttonDiv).parent().children().removeClass('active')
  $(buttonDiv).addClass('active')
  $("#creditbox .tabcontent").hide()
  $(contentDiv).show()
}

function populateRegionsArray()
{
  $('#outlines').children().each(function() {
    var regionID = $(this).attr('id')
    for (var regexNum in regionIDsToIgnore)
    {
      if (regionIDsToIgnore[regexNum].test(regionID))
      {
        return
      }
    }
    if ($(this).attr(noCountSVGRegionAttribute) !== undefined || regionID === undefined)
    {
      return
    }

    displayRegionDataArray[regionID] = {partyID: TossupParty.getID(), margin: 0}
  })

  displayRegionDataArray[nationalPopularVoteID] = {partyID: TossupParty.getID(), margin: 0}
}

async function toggleEditing(stateToSet)
{
  if (editMarginID)
  {
    toggleMarginEditing(editMarginID)
  }
  if (isEnteringShiftAmount)
  {
    toggleEnteringShiftAmount()
  }
  if (editCandidateNamePartyID)
  {
    toggleCandidateNameEditing(editCandidateNamePartyID, null, true)
  }
  if (editPartyMarginColor)
  {
    toggleMarginHexColorEditing()
  }
  if (editPartyPopularVote)
  {
    togglePartyPopularVoteEditing(editPartyPopularVote)
  }
  editingRegionEVs = false
  editingRegionMarginValue = false
  editingRegionVotesharePercentages = false
  voteshareEditRegion = null
  selectedVoteshareCandidate = null

  updateRegionBox(currentRegionID)

  if (stateToSet == null)
  {
    switch (currentEditingState)
    {
      case EditingState.editing:
      currentEditingState = EditingState.viewing
      break

      case EditingState.viewing:
      currentEditingState = EditingState.editing
      break
    }
  }
  else
  {
    currentEditingState = stateToSet
  }

  switch (currentEditingState)
  {
    case EditingState.editing:
    $("#editDoneButton").html("Done")
    $("#editDoneButton").addClass('active')

    $("#copyDropdownContainer").hide()

    $("#marginEditButton").hide()
    $("#marginEditButton").addClass('topnavdisable')
    $("#marginsDropdownContainer").hide()

    $("#shiftButton").show()
    $("#shiftButton").removeClass('topnavdisable')
    $("#shiftDropdownContainer").show()

    $("#fillDropdownContainer").css('display', "block")

    var currentMapIsCustom = (currentMapSource.isCustom())
    var currentMapDataForDate = currentSliderDate ? currentMapSource.getMapData()[currentSliderDate.getTime()] : displayRegionDataArray
    currentCustomMapSource.updateMapData(currentMapDataForDate, getCurrentDateOrToday(), !currentMapIsCustom, currentMapSource.getCandidateNames(getCurrentDateOrToday()), !currentMapIsCustom ? currentEditingMode : null)

    if (!currentMapIsCustom)
    {
      currentCustomMapSource.setCandidateNames(currentMapSource.getCandidateNames(getCurrentDateOrToday()), getCurrentDateOrToday())

      currentCustomMapSource.setDropdownPartyIDs(cloneObject(dropdownPoliticalPartyIDs))

      currentMapSource = currentCustomMapSource
      updatePoliticalPartyCandidateNames()
      updateNavBarForNewSource()
      await loadDataMap()
    }
    else
    {
      displayPartyTotals(getPartyTotals(), true)
    }
    deselectAllParties()
    break

    case EditingState.viewing:
    if (currentMapSource.isCustom())
    {
      $("#editDoneButton").html("Edit")
      $("#copyDropdownContainer").hide()
    }
    else
    {
      $("#editDoneButton").html("Copy")
      $("#copyDropdownContainer").show()
    }
    $("#editDoneButton").removeClass('active')

    $("#marginEditButton").show()
    $("#marginEditButton").removeClass('topnavdisable')
    $("#marginsDropdownContainer").show()

    $("#shiftButton").hide()
    $("#shiftButton").addClass('topnavdisable')
    $("#shiftDropdownContainer").hide()

    $("#fillDropdownContainer").css('display', "none")

    if (currentMapSource.isCustom())
    {
      currentCustomMapSource.updateMapData(displayRegionDataArray, getCurrentDateOrToday(), false, currentMapSource.getCandidateNames(getCurrentDateOrToday()))
      await loadDataMap()
      displayPartyTotals(getPartyTotals(), true)
    }

    if (showingDataMap && currentRegionID)
    {
      updateRegionBox(currentRegionID)
    }

    selectAllParties()
    break
  }

  updatePartyDropdownVisibility()
}

function viewingDiscreteRegions()
{
  return currentMapType.getID() != USAHouseMapType.getID() || currentMapType.getMapSettingValue("showAllDistricts") === true || currentViewingState == ViewingState.zooming
}

async function leftClickRegion(div)
{
  let currentMapDataForDate = currentSliderDate.getTime() ? currentMapSource.getMapData()[currentSliderDate.getTime()] : null
  let canZoomCurrently = await currentMapSource.canZoom(currentMapDataForDate)

  let isDiscreteRegion = viewingDiscreteRegions()

  var regionID = $(div).attr('id')
  var regionDataCallback = getRegionData(regionID)
  var regionData = regionDataCallback.regionData
  var regionIDsToFill = regionDataCallback.linkedRegionIDs

  if (isDiscreteRegion && currentEditingState == EditingState.editing && (currentMapSource.getEditingMode() == EditingMode.voteshare || editingRegionVotesharePercentages))
  {
    toggleRegionVoteshareEditing(regionID, regionData)
  }
  else if (isDiscreteRegion && currentEditingState == EditingState.editing && editingRegionMarginValue)
  {
    toggleRegionMarginEditing()
  }
  else if (isDiscreteRegion && currentEditingState == EditingState.editing)
  {
    if (ignoreNextClick)
    {
      ignoreNextClick = false
      return
    }

    if (regionIDsChanged.includes(regionID)) { return }

    if (regionData.disabled)
    {
      regionData.partyID = (selectedParty || TossupParty).getID()
      regionData.candidateName = regionData.candidateMap ? regionData.candidateMap[regionData.partyID] : null
      regionData.margin = 101
    }
    else if (selectedParty != null && regionData.partyID != selectedParty.getID())
    {
      regionData.partyID = selectedParty.getID()
      regionData.candidateName = regionData.candidateMap ? regionData.candidateMap[regionData.partyID] : null
      regionData.margin = marginValues.safe
    }
    else if (selectedParty != null)
    {
      var marginValueArray = Object.values(marginValues)
      var marginValueIndex = marginValueArray.indexOf(regionData.margin)
      if (marginValueIndex == -1)
      {
        for (var marginValueNum in marginValueArray)
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
  else if (canZoomCurrently && currentViewingState == ViewingState.viewing && showingDataMap)
  {
    var baseRegionID = getBaseRegionID($(div).attr('id')).baseID
    currentViewingState = ViewingState.zooming
    currentMapZoomRegion = regionID.includes(subregionSeparator) ? baseRegionID.split(subregionSeparator)[0] : baseRegionID

    displayDataMap(null, null, true)

    currentRegionID = null
    updateRegionBox()
  }
  else if (showingDataMap)
  {
    currentMapSource.openRegionLink(currentRegionID ?? currentMapZoomRegion, currentSliderDate)
  }
}

function rightClickRegion(div)
{
  let isDiscreteRegion = viewingDiscreteRegions()

  var regionID = $(div).attr('id')
  var regionDataCallback = getRegionData(regionID)
  var regionData = regionDataCallback.regionData
  var regionIDsToFill = regionDataCallback.linkedRegionIDs

  if (isDiscreteRegion && currentEditingState == EditingState.editing && (currentMapSource.getEditingMode() == EditingMode.voteshare || editingRegionVotesharePercentages))
  {
    toggleRegionVoteshareEditing(regionID, regionData)
  }
  else if (isDiscreteRegion && currentEditingState == EditingState.editing && editingRegionMarginValue)
  {
    toggleRegionMarginEditing()
  }
  else if (isDiscreteRegion && currentEditingState == EditingState.editing)
  {
    if (regionData.disabled)
    {
      regionData.partyID = (selectedParty || TossupParty).getID()
      regionData.candidateName = regionData.candidateMap ? regionData.candidateMap[regionData.partyID] : null
      regionData.margin = 101
    }
    else if (selectedParty != null && regionData.partyID != selectedParty.getID())
    {
      regionData.partyID = selectedParty.getID()
      regionData.candidateName = regionData.candidateMap ? regionData.candidateMap[regionData.partyID] : null
      regionData.margin = 0.1 // Hardcoding tilt == 0.1
    }
    else if (selectedParty != null)
    {
      var marginValueArray = Object.values(marginValues)
      var marginValueIndex = marginValueArray.indexOf(regionData.margin)
      if (marginValueIndex == -1)
      {
        for (var marginValueNum in marginValueArray)
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

function shiftClickRegion()
{
  let isDiscreteRegion = viewingDiscreteRegions()

  if (isDiscreteRegion && currentEditingState == EditingState.editing && currentMapSource.getEditingMode() == EditingMode.margin)
  {
    toggleRegionMarginEditing()
  }
  else if (isDiscreteRegion && currentMapType.getID() == USAPresidentialMapType.getID() && currentViewingState == ViewingState.viewing && currentMapSource.isCustom())
  {
    editingRegionEVs = !editingRegionEVs
    updateRegionBox(currentRegionID)
  }
}

function altClickRegion(div)
{
  let isDiscreteRegion = viewingDiscreteRegions()

  if (isDiscreteRegion && currentEditingState == EditingState.editing)
  {
    var regionDataCallback = getRegionData($(div).attr('id'))
    var regionData = regionDataCallback.regionData
    var regionIDsToFill = regionDataCallback.linkedRegionIDs

    regionData.partyID = (selectedParty || TossupParty).getID()

    if (regionData.disabled)
    {
      regionData.disabled = false
      regionData.margin = regionData.partyID == TossupParty.getID() ? 0 : 100
    }
    else
    {
      regionData.disabled = true
      regionData.margin = regionData.partyID == TossupParty.getID() ? 0 : 101
    }

    updateRegionFillColors(regionIDsToFill, regionData)
    updateMapElectoralVoteText()
    displayPartyTotals(getPartyTotals())
  }
}

function zoomOutMap()
{
  currentViewingState = ViewingState.viewing
  currentMapZoomRegion = null

  if (currentMapSource.isCustom())
  {
    currentCustomMapSource.updateMapData(displayRegionDataArray, getCurrentDateOrToday(), false, currentMapSource.getCandidateNames(getCurrentDateOrToday()))
  }

  displayDataMap(null, null, true)
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

  for (var linkedRegionSetNum in linkedRegions)
  {
    for (var linkedRegionIDNum in linkedRegions[linkedRegionSetNum])
    {
      if (linkedRegions[linkedRegionSetNum][linkedRegionIDNum] == regionID)
      {
        for (var linkedRegionIDNum2 in linkedRegions[linkedRegionSetNum])
        {
          var linkedRegionToTest = linkedRegions[linkedRegionSetNum][linkedRegionIDNum2]
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

async function updateRegionFillColors(regionIDsToUpdate, regionData, shouldUpdatePieChart)
{
  if (regionData == null) { return }

  var fillColor
  var shouldHide = false

  var canUseVoteSplitsForColor = (regionData.margin == 0 || currentViewingState == ViewingState.splitVote) && regionData.voteSplits != null && regionData.voteSplits.length >= 2
  if (regionData.partyID == null || regionData.partyID == TossupParty.getID() || canUseVoteSplitsForColor || (regionData.disabled == true && currentMapType.getMapSettingValue("mapCurrentSeats") == false))
  {
    if (regionData.disabled == true)
    {
      fillColor = regionDisabledColor

      var regionsToHide = currentMapType.getRegionsToHideOnDisable()
      for (var regexNum in regionsToHide)
      {
        if (regionsToHide[regexNum].test(regionData.region))
        {
          shouldHide = true
          break
        }
      }
    }
    else if (canUseVoteSplitsForColor)
    {
      if (currentViewingState == ViewingState.splitVote)
      {
        let party1Color = politicalParties[regionData.voteSplits[0].partyID].getMarginColors().safe
        let party2Color = politicalParties[regionData.voteSplits[1].partyID].getMarginColors().safe
        let patternID = "split-" + party1Color + "-" + party2Color
        generateSVGPattern(patternID, party1Color, party2Color)
        fillColor = "url(#" + patternID + ")"
      }
      else if (regionData.voteSplits[0].votes == regionData.voteSplits[1].votes)
      {
        var voteSplitPartyIDs = regionData.voteSplits.map(partyVote => partyVote.partyID).slice(0, 2)
        voteSplitPartyIDs.sort()
        if (voteSplitPartyIDs[0] == DemocraticParty.getID() && voteSplitPartyIDs[1] == RepublicanParty.getID())
        {
          fillColor = PoliticalPartyColors.purple.likely
        }
        else if (voteSplitPartyIDs[0] == IndependentGenericParty.getID())
        {
          fillColor = politicalParties[voteSplitPartyIDs[1]].getMarginColors().lean
        }
      }
    }

    if (!fillColor)
    {
      fillColor = TossupParty.getMarginColors().safe
    }
  }
  else
  {
    var marginIndex = getMarginIndexForValue(regionData.margin, regionData.partyID)
    fillColor = politicalParties[regionData.partyID].getMarginColors()[marginIndex]

    if (currentMapType.getMapSettingValue("flipStates") && regionData.flip)
    {
      var patternID = generateFlipPattern(regionData.partyID, marginIndex)
      fillColor = "url(#" + patternID + ")"
    }
  }

  for (var regionIDNum in regionIDsToUpdate)
  {
    var regionDiv = $("#" + regionIDsToUpdate[regionIDNum])
    regionDiv.css('animation-fill-mode', 'forwards')
    regionDiv.css('fill', fillColor)

    regionDiv.css('display', shouldHide ? 'none' : 'inherit')

    if (regionData.disabled == true && (currentMapSource.getID() != currentCustomMapSource.getID() || currentMapType.getMapSettingValue("mapCurrentSeats") === false))
    {
      regionDiv.css('pointer-events', 'none')
    }
    else
    {
      regionDiv.css('pointer-events', 'inherit')
    }
  }

  for (let regionID of regionIDsToUpdate)
  {
    $("#" + regionID + "-text").css('fill', regionData.disabled && !currentMapType.getMapSettingValue("mapCurrentSeats") ? 'gray' : 'white')
  }

  if (shouldUpdatePieChart == null || shouldUpdatePieChart == true)
  {
    updateTotalsPieChart()
  }
}

function getMarginIndexForValue(margin)
{
  if (margin == 101)
  {
    return "current"
  }
  for (var marginName in marginValues)
  {
    if (Math.abs(margin) >= marginValues[marginName])
    {
      return marginName
    }
  }
}

function generateSVGPattern(patternID, fillColor, strokeColor)
{
  if ($("#" + patternID).length == 0)
  {
    var patternHTML = '<pattern id="' + patternID + '" width="' + flipPatternWidth + '" height="' + flipPatternHeight + '" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">'
    patternHTML += '<rect x1="0" y1="0" width="' + flipPatternWidth + '" height="' + flipPatternHeight + '" style="fill: ' + fillColor + ';"></rect>'
    patternHTML += '<line x1="0" y1="0" x2="0" y2="' + flipPatternHeight + '" style="stroke: ' + strokeColor + '; stroke-width: ' + flipPatternWidth + '"></line>'
    patternHTML += '</pattern>'

    var tempDiv = document.createElement('div')
    document.getElementById("svgdefinitions").appendChild(tempDiv)
    tempDiv.outerHTML = patternHTML
  }
}

function generateFlipPattern(partyID, margin)
{
  var fillColor = politicalParties[partyID].getMarginColors()[margin]
  var patternID = "flip-" + fillColor.slice(1)

  generateSVGPattern(patternID, fillColor, multiplyBrightness(fillColor, flipPatternBrightnessFactor))

  return patternID
}

function generateFlipPatternsFromPartyMap(partyMap)
{
  for (var partyID in partyMap)
  {
    for (var margin in partyMap[partyID].getMarginColors())
    {
      generateFlipPattern(partyID, margin)
    }
  }
}

function getPartyTotals(includeFlipData)
{
  var partyTotals = {}
  var partyFlipTotals = {}
  var partyFlipData = {}

  for (var partyIDNum in mainPoliticalPartyIDs)
  {
    partyTotals[mainPoliticalPartyIDs[partyIDNum]] = 0
  }

  var shouldGetOriginalMapData = currentMapSource.getShouldUseOriginalMapDataForTotalsPieChart()
  var regionDataArray = shouldGetOriginalMapData && currentSliderDate ? currentMapSource.getMapData()[currentSliderDate.getTime()] : displayRegionDataArray

  for (var regionID in regionDataArray)
  {
    if (regionID == nationalPopularVoteID || regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) { continue }

    var currentRegionEV = currentMapType.getEV(getCurrentDecade(), regionID, regionDataArray[regionID]) ?? regionDataArray[regionID].voteWorth

    if (currentViewingState != ViewingState.splitVote)
    {
      var partyIDToSet = regionDataArray[regionID].partyID
      if (regionDataArray[regionID].partyID == null)
      {
        partyIDToSet = TossupParty.getID()
      }

      if (includeFlipData && regionDataArray[regionID].flip)
      {
        if (!(partyIDToSet in partyFlipTotals))
        {
          partyFlipTotals[partyIDToSet] = 0
          partyFlipData[partyIDToSet] = []
        }
        partyFlipTotals[partyIDToSet] += currentRegionEV
        partyFlipData[partyIDToSet].push({region: regionID, margin: regionDataArray[regionID].margin})
      }
      else
      {
        if (!(partyIDToSet in partyTotals))
        {
          partyTotals[partyIDToSet] = 0
        }
        partyTotals[partyIDToSet] += currentRegionEV
      }
    }
    else if (currentViewingState == ViewingState.splitVote)
    {
      if (!regionDataArray[regionID].voteSplits) { continue }

      for (let partyVote of regionDataArray[regionID].voteSplits)
      {
        let partyIDToSet = partyVote.partyID
        let votesWon = partyVote.votes

        if (!(partyIDToSet in partyTotals))
        {
          partyTotals[partyIDToSet] = 0
        }
        partyTotals[partyIDToSet] += votesWon
      }

      if (regionDataArray[regionID].voteSplits.length == 0)
      {
        if (!(regionDataArray[regionID].partyID in partyTotals))
        {
          partyTotals[regionDataArray[regionID].partyID] = 0
        }
        partyTotals[regionDataArray[regionID].partyID] += currentRegionEV
      }
    }
  }

  Object.values(partyFlipData).forEach((partyData) => {
    partyData.sort((regionData1, regionData2) => regionData1.margin-regionData2.margin)
  })

  return includeFlipData ? {nonFlipTotals: partyTotals, flipTotals: partyFlipTotals, flipData: partyFlipData} : partyTotals
}

function getPopularVotePartyVoteshareData(regionDataArray, enforceNationalPopularVote)
{
  regionDataArray = regionDataArray ? regionDataArray : displayRegionDataArray
  enforceNationalPopularVote = enforceNationalPopularVote === true

  let popularVoteData
  if (nationalPopularVoteID in regionDataArray && regionDataArray[nationalPopularVoteID].partyID != TossupParty.getID())
  {
    popularVoteData = regionDataArray[nationalPopularVoteID]
  }
  if (!enforceNationalPopularVote && currentViewingState == ViewingState.zooming && currentMapZoomRegion && currentMapZoomRegion + subregionSeparator + statePopularVoteDistrictID in regionDataArray && regionDataArray[currentMapZoomRegion + subregionSeparator + statePopularVoteDistrictID].partyID != TossupParty.getID())
  {
    popularVoteData = regionDataArray[currentMapZoomRegion + subregionSeparator + statePopularVoteDistrictID]
  }

  if (popularVoteData && popularVoteData.partyVotesharePercentages)
  {
    return popularVoteData.partyVotesharePercentages
  }
}

function getCurrentDecade()
{
  var dateForDecade
  if (currentMapSource.isCustom() && showingCompareMap)
  {
    var compareDate = mapSources[compareMapSourceIDArray[0]].getMapDates()[$("#firstCompareDataMapDateSlider")[0].value-1]
    if (compareDate != null)
    {
      dateForDecade = new Date(compareDate)
    }
  }
  else if (currentMapType.getID() == USAPresidentialMapType.getID() && currentMapType.getMapSettingValue("evDecadeOverrideToggle"))
  {
    return currentMapType.getMapSettingValue("evDecadeOverrideSelection")
  }
  else if (currentSliderDate != null)
  {
    dateForDecade = currentSliderDate
  }
  return getDecadeFromDate(dateForDecade)
}

function getCurrentDateOrToday()
{
  var dateToUse = new Date(getTodayString("/", false, "mdy")).getTime()
  if (currentSliderDate)
  {
    dateToUse = currentSliderDate.getTime()
  }

  return dateToUse
}

async function updateRegionBox(regionID)
{
  let currentMapDataForDate = currentSliderDate && currentMapSource.getMapData() ? currentMapSource.getMapData()[currentSliderDate.getTime()] : null
  let canZoomCurrently = await currentMapSource.canZoom(currentMapDataForDate)

  let isDiscreteRegion = viewingDiscreteRegions()

  var regionData = regionID ? getRegionData(regionID).regionData : null

  if (regionID == null || regionData == null || regionData.partyID == null || (regionData.partyID == TossupParty.getID() && !canZoomCurrently && !editingRegionVotesharePercentages) || regionData.disabled == true || (currentEditingState == EditingState.editing && currentMapSource.getEditingMode() == EditingMode.margin && !shiftKeyDown && !editingRegionMarginValue))
  {
    $("#regionboxcontainer").trigger('hide')
    return
  }
  $("#regionboxcontainer").trigger('show')

  var formattedRegionID = (getKeyByValue(mapRegionNameToID, currentRegionID) || currentRegionID)
  if (currentMapSource.getFormattedRegionName)
  {
    formattedRegionID = currentMapSource.getFormattedRegionName(formattedRegionID)
  }

  if (editingRegionEVs)
  {
    $("#regionbox").html(formattedRegionID + "<div style='height: 10px'></div>" + "EV: <input id='regionEV-text' class='textInput' style='float: none; position: inherit' type='text' oninput='applyRegionEVEdit(\"" + regionID + "\")' value='" + currentMapType.getEV(getCurrentDecade(), regionID, regionData) + "'>")
    $("#regionEV-text").focus().select()
    return
  }

  var roundedMarginValue = getRoundedMarginValue(regionData.margin)
  var regionMarginString = (regionData.candidateName || politicalParties[regionData.partyID].getNames()[0]) + " +"

  if (editingRegionMarginValue)
  {
    $("#regionbox").html(formattedRegionID + "<div style='height: 10px'></div>" + "<span style='color: " + politicalParties[regionData.partyID].getMarginColors().lean + ";'>" + regionMarginString + "<input id='regionMargin-text' class='textInput' style='float: none; position: inherit' type='text' oninput='applyRegionMarginValue(\"" + regionID + "\")' value='" + roundedMarginValue + "'></span>")
    $("#regionMargin-text").select()
    return
  }

  if (editingRegionVotesharePercentages)
  {
    let candidateDataToSelect = (selectedParty == null || selectedParty == TossupParty.getID()) ? regionData.partyVotesharePercentages[0] : regionData.partyVotesharePercentages.find(candidateData => candidateData.partyID == selectedParty.getID())
    if (!candidateDataToSelect && selectedParty)
    {
      regionData.partyVotesharePercentages.push({partyID: selectedParty.id, candidate: selectedParty.getCandidateName(), voteshare: 0.0})
      candidateDataToSelect = regionData.partyVotesharePercentages[regionData.partyVotesharePercentages.length-1]
    }

    let regionBoxHTML = formattedRegionID
    regionBoxHTML += "<div style='border-radius: 50px; color: white; font-size: 17px; line-height: 100%; margin-top: 5px; margin-bottom: 8px; display: block;'>"
    for (let candidateOn in regionData.partyVotesharePercentages)
    {
      let candidateData = regionData.partyVotesharePercentages[candidateOn]
      regionBoxHTML += "<div style='display: flex; justify-content: space-between; align-items: center; padding: 1px 4px; margin: 2px 0px; border-radius: " + (candidateOn == 0 ? "3px 3px" : "0px 0px") + (candidateOn == regionData.partyVotesharePercentages.length-1 ? " 3px 3px" : " 0px 0px") + "; background: " + getGradientCSS(politicalParties[candidateData.partyID].getMarginColors().safe, politicalParties[candidateData.partyID].getMarginColors().lean, candidateData.voteshare) + ";'><span style='margin-right: 5px;'>" + candidateData.candidate + "</span>"
      regionBoxHTML += "<span><input id='regionVoteshare-" + candidateData.candidate + "' class='textInput' style='float: none; position: inherit; min-width: 40px; max-height: 20px;' type='text' oninput='applyRegionVotesharePercentage(this, \"" + regionID + "\")' onclick='this.select()' onselect='selectedVoteshareCandidate = $(this).data(\"candidate\")' value='" + candidateData.voteshare + "' data-candidate='" + candidateData.candidate + "'>%</span>"
      regionBoxHTML += "</div>"
    }
    regionBoxHTML += "</div>"

    if (currentMapType.getMapSettingValue("showTooltips"))
    {
      regionBoxHTML += "<div style='color: gray; font-size: 15px; font-style: italic'>"
      regionBoxHTML += "Click to save voteshare"
      regionBoxHTML += "</div>"
      regionBoxHTML += "<div style='padding-bottom: 3px;'></div>"
    }

    $("#regionbox").html(regionBoxHTML)

    if (candidateDataToSelect)
    {
      $("#regionVoteshare-" + candidateDataToSelect.candidate).select()
    }

    return
  }

  regionMarginString += roundedMarginValue

  let regionBoxHTML = (currentEditingState == EditingState.viewing || (isDiscreteRegion && currentMapSource.getEditingMode() == EditingMode.margin)) ? regionMarginString : ""

  let tooltipsToShow = {
    shiftForVotes: [false, "Shift to show votes"],
    shiftClickToEditEVs: [false, "Shift click to edit EVs"],
    clickToZoom: [false, "Click to expand"],
    clickToOpenLink: [false, "Click to open<img style='position: relative; left: 5px; top: 3px; height: 16px; width: 16px;' src='" + currentMapSource.getIconURL(true) + "'>"],
    clickToEditVoteshare: [false, "Click to edit voteshare"],
    shiftClickToEditMargin: [false, "Shift click to edit margin"]
  }

  if (regionData.chanceChallenger && regionData.chanceIncumbent)
  {
    regionBoxHTML += "<br></span><span style='font-size: 17px; padding-top: 5px; padding-bottom: 5px; display: block; line-height: 100%;'>Chances<br>"
    regionBoxHTML += "<span style='color: " + politicalParties[incumbentChallengerPartyIDs.challenger].getMarginColors().lean + ";'>" // Hardcoding challenger first
    regionBoxHTML += decimalPadding(Math.round(regionData.chanceChallenger*1000)/10)
    regionBoxHTML += "%</span>&nbsp;&nbsp;&nbsp;<span style='color: " + politicalParties[incumbentChallengerPartyIDs.incumbent].getMarginColors().lean + ";'>"
    regionBoxHTML += decimalPadding(Math.round(regionData.chanceIncumbent*1000)/10)
    regionBoxHTML += "%</span></span>"
  }

  if (regionData.partyVotesharePercentages && currentMapSource.getShouldShowVoteshare() == true)
  {
    let sortedPercentages
    if (regionData.partyVotesharePercentages[0].order !== undefined)
    {
      sortedPercentages = regionData.partyVotesharePercentages.sort((voteData1, voteData2) => {
        return voteData1.order - voteData2.order
      })
    }
    else
    {
      sortedPercentages = regionData.partyVotesharePercentages.sort((voteData1, voteData2) => {
        return voteData2.voteshare - voteData1.voteshare
      })
    }

    if (currentEditingState == EditingState.viewing)
    {
      regionBoxHTML += "<br></span><span style='font-size: 17px; padding-top: 5px; padding-bottom: 0px; display: block; line-height: 100%;'>Voteshare<br></span>"
    }
    else
    {
      regionBoxHTML += "</span>"
    }

    regionBoxHTML += "<div style='font-size: 17px; padding-top: 2px; padding-bottom: 5px; padding-right: 8px; display: block; line-height: 100%; border-radius: 50px;'>"

    let hasVoteCountsForAll = true

    sortedPercentages.forEach((voteData, i) => {
      regionBoxHTML += "<span id='voteshare-" + (voteData.partyID + "-" + voteData.candidate) + "' style='display: inline-block; padding: 4px; color: #fff; border-radius: " + (i == 0 ? "3px 3px" : "0px 0px") + " " + (i == sortedPercentages.length-1 ? "3px 3px" : "0px 0px") + "; " + "background: " + getGradientCSS(politicalParties[voteData.partyID].getMarginColors().safe, politicalParties[voteData.partyID].getMarginColors().lean, (showingCompareMap && currentMapSource.isCustom() ? 50 : 0) + voteData.voteshare) + "; " + " width: 100%'><span style='float: left;'>" + voteData.candidate + "</span><span style='float: right;'>"
      regionBoxHTML += shiftKeyDown && voteData.votes ? addCommaFormatting(voteData.votes) : (showingCompareMap && currentMapSource.isCustom() && voteData.voteshare > 0.0 ? "+" : "") + decimalPadding(Math.round(voteData.voteshare*100)/100, 2) + "%"
      regionBoxHTML += "</span></span><br>"

      hasVoteCountsForAll = hasVoteCountsForAll && voteData.votes != null
    })

    tooltipsToShow.shiftForVotes[0] = hasVoteCountsForAll

    regionBoxHTML += "</div>"
  }

  let splitVoteDisplayOptions = currentMapSource.getSplitVoteDisplayOptions()

  if (regionData.voteSplits && regionData.voteSplits.length > 0 && ((canZoomCurrently && splitVoteDisplayOptions.showSplitVotesOnCanZoom) || currentViewingState == ViewingState.splitVote))
  {
    let voteSplitDataToDisplay = regionData.voteSplits
    regionBoxHTML = "</span>"
    voteSplitDataToDisplay.forEach((candidateSplitVoteData, i) => {
      regionBoxHTML += "<div style='margin-top: " + (i == 0 ? 0 : -5) + "px; margin-bottom: " + (i < voteSplitDataToDisplay.length-1 ? 0 : 5) + "px; color: " + politicalParties[candidateSplitVoteData.partyID].getMarginColors().lean + ";'>" + candidateSplitVoteData.candidate + ": " + candidateSplitVoteData.votes + "</div>"
    })
  }

  if (regionData.voteSplits && regionData.voteSplits.length > 0 && canZoomCurrently && splitVoteDisplayOptions.showSplitVoteBoxes && currentSliderDate && currentMapSource.getMapData())
  {
    var zoomingData = await currentMapSource.getZoomingData(currentMapDataForDate, currentRegionID)
    if (zoomingData)
    {
      const districtsPerLine = 3

      Object.keys(zoomingData).filter(districtID => !districtID.endsWith(subregionSeparator + statePopularVoteDistrictID)).forEach((districtID, i, districtIDs) => {
        if (i % districtsPerLine == 0 && i != 0)
        {
          regionBoxHTML += "<br></div>"
        }
        if (i % districtsPerLine == 0)
        {
          var isLastDistrictLine = (i+((districtIDs.length-1) % districtsPerLine)) == districtIDs.length-1
          regionBoxHTML += "<div style='display: flex; justify-content: center; align-items: center; " + (isLastDistrictLine ? "margin-bottom: 4px" : "") + "'>"
        }
        if (i % districtsPerLine > 0)
        {
          regionBoxHTML += "&nbsp;&nbsp;"
        }

        var districtNumber = districtID.split(subregionSeparator)[1]
        var marginIndex = getMarginIndexForValue(zoomingData[districtID].margin, zoomingData[districtID].partyID)
        var marginColor = politicalParties[zoomingData[districtID].partyID].getMarginColors()[marginIndex]

        regionBoxHTML += (districtNumber == 0 ? "AL" : zeroPadding(districtNumber)) + ":&nbsp;<div style='display: inline-block; margin-top: 2px; border-radius: 2px; border: solid " + (zoomingData[districtID].flip ? "gold 3px; width: 11px; height: 11px;" : "gray 1px; width: 15px; height: 15px;") + " background-color: " + marginColor + "'></div>"
      })
    }
    regionBoxHTML += "<br></div>"
  }

  tooltipsToShow.shiftClickToEditEVs[0] = isDiscreteRegion && currentMapType.getID() == USAPresidentialMapType.getID() && currentMapSource.isCustom() && currentEditingState == EditingState.viewing
  tooltipsToShow.clickToZoom[0] = canZoomCurrently && currentViewingState == ViewingState.viewing
  tooltipsToShow.clickToOpenLink[0] = currentMapSource.hasHomepageURL() && !tooltipsToShow.clickToZoom[0] && currentEditingState == EditingState.viewing
  tooltipsToShow.clickToEditVoteshare[0] = isDiscreteRegion && currentEditingState == EditingState.editing && currentMapSource.getEditingMode() == EditingMode.voteshare
  tooltipsToShow.shiftClickToEditMargin[0] = isDiscreteRegion && currentEditingState == EditingState.editing && currentMapSource.getEditingMode() == EditingMode.margin

  if (currentMapType.getMapSettingValue("showTooltips"))
  {
    let isShowingSomeTooltip = false
    Object.keys(tooltipsToShow).forEach((tooltipID) => {
      if (tooltipsToShow[tooltipID][0])
      {
        regionBoxHTML += "<div style='color: gray; font-size: 15px; font-style: italic'>"
        regionBoxHTML += tooltipsToShow[tooltipID][1]
        regionBoxHTML += "</div>"

        isShowingSomeTooltip = true
      }
    })
    if (isShowingSomeTooltip)
    {
      regionBoxHTML += "<div style='padding-bottom: 3px;'></div>"
    }
  }

  $("#regionbox").html(formattedRegionID + "<br>" + "<span style='color: " + politicalParties[regionData.partyID].getMarginColors().lean + ";'>" + regionBoxHTML + "</span>")

  updateRegionBoxYPosition()
}

function updateRegionBoxPosition(mouseX, mouseY)
{
  $("#regionboxcontainer").css("left", mouseX+5)
  updateRegionBoxYPosition(mouseY)
}

function updateRegionBoxYPosition(mouseY)
{
  var newRegionBoxYPos = (mouseY+5) || (currentMouseY+5)
  if (!newRegionBoxYPos) { return }

  var regionBoxHeightDifference = $(document).height() - (newRegionBoxYPos+$("#regionboxcontainer").height())
  if (regionBoxHeightDifference < 0)
  {
    newRegionBoxYPos += regionBoxHeightDifference
  }
  $("#regionboxcontainer").css("top", newRegionBoxYPos)
}

function getRoundedMarginValue(fullMarginValue)
{
  let roundedMarginValue = roundValueToPlace(fullMarginValue, 2)
  return currentMapSource.getAddDecimalPadding() ? decimalPadding(roundedMarginValue) : roundedMarginValue
}

function getGradientCSS(fillColor, backgroundColor, fillPercentage)
{
  return "linear-gradient(90deg, " + fillColor + " " + fillPercentage + "%, " + backgroundColor + " 0%)"
}

function applyRegionEVEdit(regionID)
{
  var regionData = getRegionData(regionID).regionData

  var shouldRefreshEV = false

  var newEV = parseInt($("#regionEV-text").val())
  if ($("#regionEV-text").val() == "")
  {
    delete overrideRegionEVs[regionID]
    shouldRefreshEV = true
  }

  var currentEV = currentMapType.getEV(getCurrentDecade(), regionID, regionData)
  if (!isNaN(newEV) && newEV > 0 && newEV != currentEV)
  {
    overrideRegionEVs[regionID] = newEV
    shouldRefreshEV = true

    $("#regionEV-text").val(newEV)
  }
  else if ($("#regionEV-text").val() != currentEV)
  {
    $("#regionEV-text").val(currentEV)
    $("#regionEV-text").select()
  }

  if (shouldRefreshEV)
  {
    updateMapElectoralVoteText()
    displayPartyTotals(getPartyTotals())
    updateTotalsPieChart()
  }
}

function toggleRegionMarginEditing()
{
  editingRegionMarginValue = !editingRegionMarginValue

  if (editingRegionMarginValue)
  {
    updateRegionBox(currentRegionID)
  }
  else
  {
    $("#regionboxcontainer").trigger('hide')
  }
}

function applyRegionMarginValue(regionID)
{
  var regionDataCallback = getRegionData(regionID)
  var regionIDsToFill = regionDataCallback.linkedRegionIDs
  var regionData = regionDataCallback.regionData

  var newMarginString = $("#regionMargin-text").val()
  var newMargin = parseFloat(newMarginString)
  if (newMarginString == "")
  {
    newMargin = 1
  }
  var newMarginIsValid = /^\d+\.?\d*e?[\+\-]?\d*$/.test(newMarginString) && !isNaN(newMargin) && newMargin >= 0

  var currentMargin = getRoundedMarginValue(regionData.margin)
  if (newMarginIsValid && newMargin != currentMargin)
  {
    regionData.margin = newMargin

    updateRegionFillColors(regionIDsToFill, regionData, false)
    displayPartyTotals(getPartyTotals())
    updateTotalsPieChart()
  }
  else if (!newMarginIsValid)
  {
    $("#regionMargin-text").val(currentMargin)
    $("#regionMargin-text").select()
  }
}

function toggleRegionVoteshareEditing(regionID, regionData)
{
  if (editingRegionVotesharePercentages)
  {
    closeRegionVoteshareEditing(voteshareEditRegion)
  }

  let baseRegionID = getBaseRegionID(regionID).baseID
  editingRegionVotesharePercentages = !editingRegionVotesharePercentages || (voteshareEditRegion != baseRegionID && regionData.partyVotesharePercentages)

  regionData && regionData.partyVotesharePercentages.sort((voteshareData1, voteshareData2) => voteshareData2.voteshare-voteshareData1.voteshare)

  if (editingRegionVotesharePercentages)
  {
    voteshareEditRegion = baseRegionID
    updateRegionBoxPosition(currentMouseX, currentMouseY)
    updateRegionBox(currentRegionID)
  }
  else
  {
    updateRegionBox(regionID)
  }
}

function applyRegionVotesharePercentage(textBoxDiv, regionID)
{
  let regionDataCallback = getRegionData(regionID)
  let regionIDsToFill = regionDataCallback.linkedRegionIDs
  let regionData = regionDataCallback.regionData

  let newVoteshareString = $(textBoxDiv).val()
  let newVoteshare = newVoteshareString != "" ? parseFloat(newVoteshareString) : 0
  let newVoteshareIsValid = /^\d+\.?\d*e?[\+\-]?\d*$/.test(newVoteshareString) && !isNaN(newVoteshare) && newVoteshare >= 0 && newVoteshare <= 100

  let currentVoteshareData = regionData.partyVotesharePercentages.find(voteshareData => voteshareData.candidate == $(textBoxDiv).data("candidate"))
  if (newVoteshareIsValid && newVoteshare != currentVoteshareData.voteshare)
  {
    currentVoteshareData.voteshare = newVoteshare

    let partyVotesharePercentages = regionData.partyVotesharePercentages.concat()
    partyVotesharePercentages.sort((voteshareData1, voteshareData2) => voteshareData2.voteshare-voteshareData1.voteshare)
    regionData.margin = partyVotesharePercentages.length < 2 ? partyVotesharePercentages[0].voteshare : partyVotesharePercentages[0].voteshare-partyVotesharePercentages[1].voteshare
    regionData.partyID = partyVotesharePercentages[0].partyID

    $(textBoxDiv).parent().parent().css("background", getGradientCSS(politicalParties[currentVoteshareData.partyID].getMarginColors().safe, politicalParties[currentVoteshareData.partyID].getMarginColors().lean, currentVoteshareData.voteshare))

    updateRegionFillColors(regionIDsToFill, regionData, false)
    displayPartyTotals(getPartyTotals())
    updateTotalsPieChart()
  }
  else if (!newVoteshareIsValid)
  {
    $(textBoxDiv).val(currentVoteshareData.voteshare)
    $(textBoxDiv).select()
  }
}

function cycleSelectedRegionVoteshare(directionToCycle)
{
  let regionData = getRegionData(voteshareEditRegion).regionData
  let voteshareIndex = regionData.partyVotesharePercentages.findIndex(voteshareData => voteshareData.candidate == selectedVoteshareCandidate)

  voteshareIndex += directionToCycle
  if (voteshareIndex < 0)
  {
    voteshareIndex = regionData.partyVotesharePercentages.length-1
  }
  else if (voteshareIndex > regionData.partyVotesharePercentages.length-1)
  {
    voteshareIndex = 0
  }

  $("#regionVoteshare-" + regionData.partyVotesharePercentages[voteshareIndex].candidate).select()
}

function closeRegionVoteshareEditing(regionID)
{
  if (!regionID) { return }
  let previousRegionData = getRegionData(regionID).regionData
  previousRegionData.partyVotesharePercentages = previousRegionData.partyVotesharePercentages.filter(candidateData => candidateData.voteshare > 0.0)
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

async function updateCompareMapSources(compareSourcesToUpdate, overrideSwapSources, swapSliderValues)
{
  $('.comparesourcecheckbox').prop('disabled', true)
  if (compareSourcesToUpdate[0])
  {
    await loadCompareMapSource(compareMapSourceIDArray[0])
  }
  if (compareSourcesToUpdate[1] && compareSourcesToUpdate[1] != compareSourcesToUpdate[0])
  {
    await loadCompareMapSource(compareMapSourceIDArray[1])
  }
  $('.comparesourcecheckbox').prop('disabled', false)

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
}

async function loadCompareMapSource(sourceID)
{
  let mapSource = mapSources[sourceID]
  let voteshareCutoff = mapSource.voteshareCutoffMargin
  mapSource.voteshareCutoffMargin = null
  await mapSource.loadMap()
  mapSource.voteshareCutoffMargin = voteshareCutoff
}

function shouldSwapCompareMapSources(firstMapSourceID, secondMapSourceID)
{
  return mapSources[firstMapSourceID].getMapDates().slice(-1)[0] < mapSources[secondMapSourceID].getMapDates().slice(-1)[0]
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
  $("#compareItem-" + compareArrayIndex).html(currentMapSource.getName() + " : " + getDateString(currentSliderDate))
}

function setCompareSourceDate(compareArrayIndex, dateIndex)
{
  var mapDates = mapSources[compareMapSourceIDArray[compareArrayIndex]].getMapDates()

  var dateToDisplay
  var overrideDateString
  if (dateIndex-1 > mapDates.length-1)
  {
    dateToDisplay = new Date(mapDates[dateIndex-1-1])
    overrideDateString = "Latest (" + getDateString(dateToDisplay, "/", false, true) + ")"
    // overrideDateString = "Latest (" + (zeroPadding(dateToDisplay.getMonth()+1)) + "/" + zeroPadding(dateToDisplay.getDate()) + "/" + dateToDisplay.getFullYear() + ")"
  }
  else
  {
    dateToDisplay = new Date(mapDates[dateIndex-1])
  }
  updateSliderDateDisplay(dateToDisplay, overrideDateString, compareArrayIndex == 0 ? "firstCompareDateDisplay" : "secondCompareDateDisplay")

  $("#compareItem-" + compareArrayIndex).html(mapSources[compareMapSourceIDArray[compareArrayIndex]].getName() + " (" + getDateString(dateToDisplay) + ")")

  compareMapDataArray[compareArrayIndex] = mapSources[compareMapSourceIDArray[compareArrayIndex]].getMapData()[dateToDisplay.getTime()]

  if (compareArrayIndex == 0)
  {
    currentCustomMapSource.setCandidateNames(mapSources[compareMapSourceIDArray[compareArrayIndex]].getCandidateNames(dateToDisplay.getTime()), dateToDisplay.getTime())
  }

  applyCompareToCustomMap()
}

function applyCompareToCustomMap()
{
  if (compareMapDataArray.length < 2 || compareMapDataArray[0] == null || compareMapDataArray[1] == null) { return }

  let voteshareCutoffMargin0 = mapSources[compareMapSourceIDArray[0]].voteshareCutoffMargin
  let voteshareCutoffMargin1 = mapSources[compareMapSourceIDArray[1]].voteshareCutoffMargin

  var resultMapArray = {}
  for (var regionID in compareMapDataArray[0])
  {
    var compareRegionData0 = compareMapDataArray[0][regionID]
    var compareRegionData1 = compareMapDataArray[1][regionID]

    if (currentMapType.getMapSettings().seatArrangement == "election-type" && compareRegionData0.seatClass != compareRegionData1.seatClass)
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

    if (compareRegionData0 && compareRegionData0.partyID == TossupParty.getID())
    {
      resultMapArray[regionID] = cloneObject(compareRegionData0)
    }
    else if (!compareRegionData0 || !compareRegionData1 || compareRegionData0.disabled == true || compareRegionData1.disabled == true)
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
        resultMapArray[regionID].partyID = sortedVoteshareArray.length >= 2 ? sortedVoteshareArray[1].partyID : TossupParty.getID()
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

      if (compareRegionData0.partyVotesharePercentages && compareRegionData1.partyVotesharePercentages)
      {
        compareRegionData0.partyVotesharePercentages.sort((candidateData0, candidateData1) => candidateData0.voteshare-candidateData1.voteshare)
        compareRegionData1.partyVotesharePercentages.sort((candidateData0, candidateData1) => candidateData0.voteshare-candidateData1.voteshare)

        let partiesChecked = new Set()
        let partiesToRemove = new Set([IndependentGenericParty.getID()])
        let candidatesToKeep = new Set()
        for (let candidateData0 of compareRegionData0.partyVotesharePercentages)
        {
          let candidateData1 = compareRegionData1.partyVotesharePercentages.find(candidateData => candidateData.partyID == candidateData0.partyID)
          if (candidateData0.voteshare < voteshareCutoffMargin0 && (!candidateData1 || candidateData1.voteshare < voteshareCutoffMargin1))
          {
            partiesToRemove.add(candidateData0.partyID)
          }
          else if (partiesToRemove.has(candidateData0.partyID))
          {
            candidatesToKeep.add(candidateData0.candidate)
          }
          partiesChecked.add(candidateData0.partyID)
        }
        for (let candidateData1 of compareRegionData1.partyVotesharePercentages)
        {
          if (partiesChecked.has(candidateData1.partyID)) { continue }
          let candidateData0 = compareRegionData0.partyVotesharePercentages.find(candidateData => candidateData.partyID == candidateData1.partyID)
          if (candidateData1.voteshare < voteshareCutoffMargin1 && (!candidateData0 || candidateData0.voteshare < voteshareCutoffMargin0))
          {
            partiesToRemove.add(candidateData1.partyID)
          }
          else if (partiesToRemove.has(candidateData1.partyID))
          {
            candidatesToKeep.add(candidateData1.candidate)
          }
        }
        let filteredVoteshares0 = compareRegionData0.partyVotesharePercentages.filter(candidateData => !partiesToRemove.has(candidateData.partyID) || candidatesToKeep.has(candidateData.candidate)).sort((candidateData1, candidateData2) => candidateData2.voteshare-candidateData1.voteshare)
        let filteredVoteshares1 = compareRegionData1.partyVotesharePercentages.filter(candidateData => !partiesToRemove.has(candidateData.partyID) || candidatesToKeep.has(candidateData.candidate)).sort((candidateData1, candidateData2) => candidateData2.voteshare-candidateData1.voteshare)

        let candidateOn = 0

        resultMapArray[regionID].partyVotesharePercentages = filteredVoteshares0.map(candidateData => {
          let differenceCandidateData = cloneObject(candidateData)
          let previousCandidateData = filteredVoteshares1.find(candidateData => candidateData.partyID == differenceCandidateData.partyID)
          differenceCandidateData.voteshare = previousCandidateData ? differenceCandidateData.voteshare-previousCandidateData.voteshare : differenceCandidateData.voteshare

          differenceCandidateData.order = candidateOn
          candidateOn += 1

          return differenceCandidateData
        })

        resultMapArray[regionID].partyVotesharePercentages = resultMapArray[regionID].partyVotesharePercentages.concat(filteredVoteshares1.filter(candidateData => {
          return resultMapArray[regionID].partyVotesharePercentages.every(existingCandidateData => existingCandidateData.partyID != candidateData.partyID)
        }).map(candidateData => {
          let newCandidateData = {...candidateData, voteshare: -candidateData.voteshare, order: candidateOn}
          candidateOn += 1
          return newCandidateData
        }))

        if (compareSortMode == CompareSortMode.shiftMargin)
        {
          resultMapArray[regionID].partyVotesharePercentages = resultMapArray[regionID].partyVotesharePercentages.sort((cand1, cand2) => cand2.voteshare-cand1.voteshare)
          for (let candidateOn in resultMapArray[regionID].partyVotesharePercentages)
          {
            let candidateData = resultMapArray[regionID].partyVotesharePercentages[candidateOn]
            candidateData.order = candidateOn == 0 ? 0 : candidateOn+1
          }
        }
      }
    }
  }

  currentCustomMapSource.updateMapData(resultMapArray, (new Date(getTodayString("/", false, "mdy"))).getTime(), true, null, EditingMode.voteshare)
  currentMapSource = currentCustomMapSource
  updateNavBarForNewSource()
  loadDataMap()
}
