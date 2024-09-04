const currentAppVersion = "5"

var currentMapType

var mapSources
var mapSourceIDs
var currentCustomMapSource

var mapRegionIDToName

var currentMapSource

var currentDisplayDate
var displayMapQueue = []
var isRunningDisplayMapQueue = false

var svgPanZoomController
var pannedDuringClick = false

var selectedParty

const standardMarginValues = {safe: 15, likely: 5, lean: 1, tilt: Number.MIN_VALUE}
var defaultMarginValues = JSON.parse(getCookie(marginsCookieName)) || standardMarginValues
var marginValues = cloneObject(defaultMarginValues)
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

const linkedRegions = [["MD", "MD-button"], ["DE", "DE-button"], ["NJ", "NJ-button"], ["CT", "CT-button"], ["RI", "RI-button"], ["MA", "MA-button", "MA-N"], ["VT", "VT-button"], ["NH", "NH-button"], ["HI", "HI-button"], ["ME-AL", "ME-AL-land", "ME"], ["ME-D1", "ME-D1-land"], ["ME-D2", "ME-D2-land"], ["NE-AL", "NE-AL-land", "NE"], ["NE-D1", "NE-D1-land"], ["NE-D2", "NE-D2-land"], ["NE-D3", "NE-D3-land"]]

const noInteractSVGRegionAttribute = "data-nointeract"
const noCountSVGRegionAttribute = "data-nocount"
const isDistrictBoxRegionAttribute = "data-isdistrictbox"

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
const maxDateSliderTicks = 60

var progressCircleDiv
const progressCircleDuration = 100
var lastIndicatorCircleProgress

const downloadIndicatorColor = '#3498db'
const csvParseIndicatorColor = '#3ac635'

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

var selectedDropdownDivID = null

var showingHelpBox = false
var currentHelpBoxPage = 0
const helpBoxPages = [
  {subtitle: "Selection & Viewing", body: `
  Change the type with the <span style='text-decoration: underline'>type dropdown</span>, or press [T] to cycle between:<br>
  [President] ⇒ [Senate] ⇒ [House] ⇒ [Govs]<br>
  <br>

  Select a map with the <span style='text-decoration: underline'>map dropdown</span>, or by using the number keys [0️⃣-9️⃣]<br>
  <br>

  Change the date with the <span style='text-decoration: underline'>slider</span>, or by using the arrow keys [⬇️ -5, ⬅️ -1, ➡️ +1, ⬆️ +5]<br>
  <br>

  Change the state color margin thresholds with the <span style='text-decoration: underline'>margins dropdown</span><br>
  To switch between presets, press [M] then<br>
  [1️⃣] Default ⇒ Safe 15%, Likely 5%, Lean 1%<br>
  [2️⃣] Alt ⇒ Safe 5%, Likely 3%, Lean 1%<br>
  <br>

  Compare between preset maps using the <span style='text-decoration: underline'>compare dropdown</span><br>
  Compare between other maps by selecting two checkboxes in the <span style='text-decoration: underline'>map dropdown</span>
  `},
  {subtitle: "Editing", body: `
  Copy with the <span style='text-decoration: underline'>copy button</span>, or [Enter]<br>
  Switch the current editing mode by selecting [Edit by margin] or [Edit by voteshare] in the <span style='text-decoration: underline'>copy dropdown</span><br>
  <br>

  When editing, first select a party in the <span style='text-decoration: underline'>parties box</span> by clicking the respective button or using the number keys [1️⃣-4️⃣]<br>
  <br>

  If editing by margin, [Left Click] to cycle:<br>
  Safe ⇒ Likely ⇒ Lean ⇒ Tilt<br>
  and [Right Click] to cycle in reverse:<br>
  Tilt ⇒ Lean ⇒ Likely ⇒ Safe<br>
  <br>

  If editing by voteshare, click to begin editing a region, and click again to save<br>
  Change the candidates with the cursor or by using the arrow keys [⬆️, ⬇️]<br>
  Set a candidate's voteshare to 0 to remove<br>
  `}
]

$(async function() {
  setMapTypes()

  currentMapType = mapTypes[getCookie("currentMapType") || mapTypeIDs[0]] || mapTypes[mapTypeIDs[0]]
  $("#cycleMapTypeButton").find("img").attr('src', currentMapType.getIconURL())

  await initializeDatabases()

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
  mapRegionIDToName = currentMapType.getRegionIDToName()

  if (currentMapType.getCustomMapEnabled())
  {
    $("#editDoneButton").removeClass('topnavdisable')
  }
  else
  {
    $("#editDoneButton").addClass('topnavdisable')
  }

  if (currentMapType.getCompareMapEnabled())
  {
    $("#compareButton").removeClass('topnavdisable')
    $("#compareDropdownContent").removeClass('topnavdisable')
    $("#compareDropdownContent").css("opacity", "100%")
  }
  else
  {
    $("#compareButton").addClass('topnavdisable')
    $("#compareDropdownContent").addClass('topnavdisable')
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

  initializeCompareVariables()

  createMapTypeDropdownItems()
  createComparePresetDropdownItems()
  createMapSourceDropdownItems()
  createSettingsDropdownItems()

  currentMapSource = (currentMapType.getCurrentMapSourceID() && currentMapType.getCurrentMapSourceID() in mapSources && !(!currentMapType.getCustomMapEnabled() && currentMapType.getCurrentMapSourceID() == currentMapType.getCustomMapSource().getID())) ? mapSources[currentMapType.getCurrentMapSourceID()] : mapSources[currentMapType.getMapSourceIDs()[0]]
  if (currentMapSource.getID() == NullMapSource.getID())
  {
    $("#sourceToggleButton").addClass('active')
  }

  await loadMapSVGFile()

  $("#totalsPieChart").remove()
  $("#totalsPieChartContainer").prepend('<canvas id="totalsPieChart"></canvas>')
  $("#totalsPieChartOverlayText").html("")

  $("#loader").hide()
  $("#loader-circle-container").hide()
  updateSVGViewbox()

  $("#mapZoomControls").trigger('hide')

  populateRegionsArray()
  for (let partyID of dropdownPoliticalPartyIDs)
  {
    if (partyID == TossupParty.getID() || !politicalParties[partyID]) { continue }
    politicalParties[partyID].setCandidateName(politicalParties[partyID].getNames()[0])
  }
  displayPartyTotals()

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
  let loadSVGFilePromise = new Promise((resolve) => {
    if ($("#loader-circle-container").is(":hidden")) $("#loader").show()

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

    currentMapType.loadSVG().then((svgPath) => {
      handleNewSVG(resolve, svgPath)
    })
  })

  return loadSVGFilePromise
}

function handleNewSVGFields(resolve, _, fadeForNewSVG, updateViewboxOutlines = false)
{
  if (fadeForNewSVG)
  {
    $("#mapcontainertmp #svgdata").css('opacity', "0")
  }

  // updateSVGViewbox($("#mapcontainertmp #svgdata"), updateViewboxOutlines)

  $("#mapcontainer").html($("#mapcontainertmp").html())
  $("#mapcontainertmp").empty()
  
  updateSVGViewbox($("#mapcontainer #svgdata"), updateViewboxOutlines)

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
      handleNewSVG(() => {
        innerResolve()
        resolve()
      }, svgPath, fadeForNewSVG, true)
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
      else if (currentViewingState != ViewingState.zooming || !(currentEditingState == EditingState.viewing && pannedDuringClick))
      {
        leftClickRegion(e.target)
      }
    })

    outlineDiv.on('contextmenu', function(e) {
      rightClickRegion(e.target)
    })
  })
}

function updateSVGViewbox(svgDiv = $("#mapcontainer #svgdata"), setOutlines = false)
{
  if (svgDiv.length == 0) return
  var svgDataBoundingBox = svgDiv[0].getBBox()
  setOutlines && svgDiv.children("#outlines").css("stroke-width", ((Math.max(svgDataBoundingBox.width/svgDiv.width(), svgDataBoundingBox.height/svgDiv.height()))) + "rem")
  svgDiv[0].setAttribute('viewBox', (svgDataBoundingBox.x) + " " + (svgDataBoundingBox.y) + " " + (svgDataBoundingBox.width) + " " + (svgDataBoundingBox.height))
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
        var divsToUpdateStatus = getIconDivsToUpdateArrayForSourceID(mapSourceID)
        for (let divID in divsToUpdateStatus)
        {
          setStatusImage(divID, divsToUpdateStatus[divID].error)
        }
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
      marginValues = cloneObject(standardMarginValues)
      createMarginEditDropdownItems(currentMapSource.getCustomDefaultMargins() == null)

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

  $("#charttooltipcontainer").on('show', function() {
    $(this).show()
    $(this).css('opacity', "1")
  })

  $("#charttooltipcontainer").on('hide', function() {
    $(this).css('opacity', "0")

    setTimeout(function() {
      if ($("#charttooltipcontainer").css('opacity') == "0") { $("#charttooltipcontainer").hide() }
    }, 200)
  })

  let buttonImagePairs = [["mapCloseButton", "close-icon"], ["mapResetZoomButton", "reset-icon"], ["mapZoomInButton", "zoom-in-icon"], ["mapZoomOutButton", "zoom-out-icon"]]
  buttonImagePairs.forEach(buttonData => {
    let [buttonID, image] = buttonData
    $("#" + buttonID).hover(function() {
      $("#" + buttonID + "Image").attr('src', "./assets/" + image + "-hover.png")
    }, function() {
      $("#" + buttonID + "Image").attr('src', "./assets/" + image + ".png")
    })
  })

  $("#mapZoomControls").on('show', function() {
    $("#mapZoomControls").css("display", "flex")
  })
  $("#mapZoomControls").on('hide', function() {
    $("#mapZoomControls").css("display", "none")
  })

  createPartyDropdownsBoxHoverHandler()
}

function addTextBoxSpacingCSS()
{
  switch (browserName)
  {
    case "Chrome":
    $(".textbox").css('letter-spacing', "1rem")
    break

    case "Firefox":
    $(".textbox").css('letter-spacing', "0.8rem")
    break
  }
}

async function setMapSource(mapSource, ...loadDataMapArgs)
{
  currentMapSource.cancelDownload()

  currentMapSource = mapSource
  updateNavBarForNewSource(false, false)
  await loadDataMap(...loadDataMapArgs)
}

async function loadDataMap(shouldSetToMax, forceDownload, previousDateOverride, resetCandidateNames, reloadPartyDropdowns)
{
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

  if (!loadedSuccessfully) { return }
  
  if (currentMapSource.getCustomDefaultMargins() != null)
  {
    marginValues = currentMapSource.getCustomDefaultMargins()
  }
  else
  {
    marginValues = cloneObject(defaultMarginValues)
  }
  createMarginEditDropdownItems()

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
}

function createCSVParsingIndicator(color)
{
  if (progressCircleDiv)
  {
    progressCircleDiv.destroy()
  }

  progressCircleDiv = new ProgressBar.Circle('#loader-circle-container', {
    color: color,
    strokeWidth: 15,
  })

  if (!$("#loader").is(":hidden")) $("#loader").hide()
  $("#loader-circle-container").show()
}

function updateCSVParsingIndicator(progress)
{
  if (lastIndicatorCircleProgress && progress-lastIndicatorCircleProgress < 0.01) return

  progressCircleDiv.set(progress)
  progressCircleDiv.setText(Math.round(progress*100) + "%")

  lastIndicatorCircleProgress = progress
}

function hideCSVParsingIndicator()
{
  lastIndicatorCircleProgress = null

  progressCircleDiv.set(0)
  $("#loader-circle-container").hide()
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
  if (!currentMapSource) return

  dateIndex = dateIndex || $("#dataMapDateSlider").val()

  var mapDates = currentMapSource.getMapDates()
  var dateToDisplay = new Date(mapDates[dateIndex-1])

  currentDisplayDate = dateToDisplay

  updateSliderDateDisplay(dateToDisplay)

  var shouldReloadSVG = false
  var currentSVGPath = currentMapType.getSVGPath()
  var newOverrideSVGPath = await currentMapSource.getOverrideSVGPath(showingCompareMap && currentMapSource.isCustom() ? currentCompareSliderDate : dateToDisplay)

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
    regionData.reportingPercent = currentMapDataForDate[regionNum].reportingPercent
    regionData.altData = currentMapDataForDate[regionNum].altData

    updateRegionFillColors(regionsToFill, regionData, false)
  }

  updatePoliticalPartyCandidateNames(dateToDisplay.getTime())
  displayPartyTotals(reloadPartyDropdowns)

  updateTotalsPieChart()
  
  let iconOverlayText = currentMapSource.getIconOverlayText()
  if (iconOverlayText != null)
  {
    $("#totalsPieChartOverlayText").html(iconOverlayText)
  }
  else
  {
    $("#totalsPieChartOverlayText").html(iconOverlayText)
  }

  updateMapElectoralVoteText()

  if (currentRegionID && currentEditingState == EditingState.viewing)
  {
    updateRegionBox()
  }

  if (currentViewingState == ViewingState.zooming)
  {
    svgPanZoomController = svgPanZoom('#svgdata', {
      controlIconsEnabled: false,
      fit: true,
      contain: true,
      minZoom: 1,
      panEnabled: true,
      dblClickZoomEnabled: false,
      beforePan: () => {
        if (mouseIsDown)
        {
          pannedDuringClick = true
        }
      }
    })
  }

  if (shouldReloadSVG)
  {
    if (currentViewingState == ViewingState.zooming)
    {
      $("#mapZoomControls").trigger('show')
    }
    else
    {
      $("#mapZoomControls").trigger('hide')
    }
  }

  showingDataMap = true
}

function updateMapElectoralVoteText()
{
  if (!currentMapType.getShouldDisplayEVOnMap()) { return }

  var regionIDs = Object.keys(mapRegionIDToName)
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
    $("#sourceToggleButton").html("Select Map")
  }
  else
  {
    $("#sourceToggleButton").html("Map: " + currentMapSource.getName())
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
    currentMapZoomRegion = null
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
  displayPartyTotals()

  updateTotalsPieChart()
  if (currentRegionID != null)
  {
    updateRegionBox()
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

    updateHelpBoxPage(0)
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

function updateHelpBoxPage(increment)
{
  if (currentHelpBoxPage+increment > helpBoxPages.length-1 || currentHelpBoxPage+increment < 0) return
  currentHelpBoxPage += increment

  $("#helpboxSubtitle").html(helpBoxPages[currentHelpBoxPage].subtitle)
  $("#helpboxBody").html(helpBoxPages[currentHelpBoxPage].body)
  $("#helpboxPage").html('[' + (currentHelpBoxPage+1) + '/' + helpBoxPages.length + ']')

  if (currentHelpBoxPage-1 < 0)
  {
    $("#helpboxLeftButton").css('visibility', 'hidden')
  }
  else
  {
    $("#helpboxLeftButton").css('visibility', 'visible')
  }
  if (currentHelpBoxPage+1 > helpBoxPages.length-1)
  {
    $("#helpboxRightButton").css('visibility', 'hidden')
  }
  else
  {
    $("#helpboxRightButton").css('visibility', 'visible')
  }
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

  updateRegionBox()

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

    $("#regionboxcontainer").css('pointer-events', "")

    var currentMapIsCustom = (currentMapSource.isCustom())
    var currentMapDataForDate = currentSliderDate ? currentMapSource.getMapData()[currentSliderDate.getTime()] : displayRegionDataArray
    currentCustomMapSource.updateMapData(currentMapDataForDate, getCurrentDateOrToday(), !currentMapIsCustom, currentMapSource.getCandidateNames(getCurrentDateOrToday()), !currentMapIsCustom ? currentEditingMode : null)

    if (!currentMapIsCustom)
    {
      currentCustomMapSource.setCandidateNames(currentMapSource.getCandidateNames(getCurrentDateOrToday()), getCurrentDateOrToday())

      let dropdownPoliticalPartyIDsForEditing = currentMapType == USAPresidentMapType ? getNonEVDropdownCandidates(cloneObject(dropdownPoliticalPartyIDs)) : dropdownPoliticalPartyIDs
      currentCustomMapSource.setDropdownPartyIDs(dropdownPoliticalPartyIDsForEditing)

      await setMapSource(currentCustomMapSource)
      updatePoliticalPartyCandidateNames(getCurrentDateOrToday())
    }
    else
    {
      displayPartyTotals(true)
    }
    
    deselectAllParties()
    selectFirstParty()
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

    $("#regionboxcontainer").css('pointer-events', "none")

    if (currentMapSource.isCustom())
    {
      currentCustomMapSource.updateMapData(displayRegionDataArray, getCurrentDateOrToday(), false, currentMapSource.getCandidateNames(getCurrentDateOrToday()))
      await loadDataMap()
      displayPartyTotals(true)
    }

    if (showingDataMap && currentRegionID)
    {
      updateRegionBox()
    }

    selectAllParties()
    break
  }

  updatePartyDropdownVisibility()
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

  var isDisabledOrTossup = regionData.partyID == null || regionData.partyID == TossupParty.getID() || (regionData.disabled == true && !currentMapType.getMapSettingValue("mapCurrentSeats"))
  var canUseVoteSplitsForColor = (regionData.margin == 0 || currentViewingState == ViewingState.splitVote) && regionData.voteSplits != null && regionData.voteSplits.length >= 2
  if (isDisabledOrTossup)
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
    else
    {
      fillColor = TossupParty.getMarginColors().safe
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
  else
  {
    var marginIndex = getMarginIndexForValue(regionData.margin, regionData.partyID)
    fillColor = politicalParties[regionData.partyID].getMarginColors()[marginIndex]
  }

  if (!isDisabledOrTossup && currentMapType.getMapSettingValue("flipStates") && regionData.flip && !(canUseVoteSplitsForColor && currentViewingState == ViewingState.splitVote))
  {
    var patternID = generateFlipPattern(fillColor)
    fillColor = "url(#" + patternID + ")"
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

function generateFlipPattern(fillColor)
{
  let patternID = "flip-" + fillColor.slice(1)

  generateSVGPattern(patternID, fillColor, multiplyBrightness(fillColor, flipPatternBrightnessFactor))

  return patternID
}

function generateFlipPatternsFromPartyMap(partyMap)
{
  for (let partyID in partyMap)
  {
    for (let marginIndex in partyMap[partyID].getMarginColors())
    {
      generateFlipPattern(partyMap[partyID].getMarginColors()[marginIndex])
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

  if (popularVoteData && "partyVotesharePercentages" in popularVoteData)
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
  else if (currentMapType.getID() == USAPresidentMapType.getID() && currentMapType.getMapSettingValue("evDecadeOverrideToggle"))
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
