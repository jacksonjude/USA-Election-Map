const projectionDataURL = "https://projects.fivethirtyeight.com/2020-general-data/presidential_state_toplines_2020.csv"
const pollAverageDataURL = "https://projects.fivethirtyeight.com/2020-general-data/presidential_poll_averages_2020.csv"

const kProjectionSource = "projection"
const kPollAverageSource = "pollaverage"
const dataSourceTypes = [kProjectionSource, kPollAverageSource]

var currentDataSource = kPollAverageSource

const projectionDataRegionURL = "https://projects.fivethirtyeight.com/2020-election-forecast/"
const pollDataRegionURL = "https://projects.fivethirtyeight.com/polls/president-general/"

var selectedPartyID
var partyIDs = ["DEM", "REP"]
var partyCandiates = {"Biden":0, "Trump":1}
var partyCandiateFullNames = {"Joseph R. Biden Jr.":0, "Donald Trump":1}
var incumbentPartyNum
var challengerPartyNum
var marginColorValues = [15, 5, 1, 0]
var marginColors = [["#1c408c", "#587ccc", "#8aafff", "#949bb3"], ["#be1c29", "#ff5864", "#ff8b98", "#cf8980"]]

const regionNameToID = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}

const regionEV = {"AL":9, "AK":3, "AZ":11, "AR":6, "CA":55, "CO":9, "CT":7, "DE":3, "DC":3, "FL":29, "GA":16, "HI":4, "ID":4, "IL":20, "IN":11, "IA":6, "KS":6, "KY":8, "LA":8, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":11, "MI":16, "MN":10, "MS":6, "MO":10, "MT":3, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":6, "NH":4, "NJ":14, "NM":5, "NY":29, "NC":15, "ND":3, "OH":18, "OK":7, "OR":7, "PA":20, "RI":4, "SC":9, "SD":3, "TN":11, "TX":38, "UT":6, "VT":3, "VA":13, "WA":12, "WV":5, "WI":10, "WY":3}

const ev2016 = {"AL":1, "AK":1, "AZ":1, "AR":1, "CA":0, "CO":0, "CT":0, "DE":0, "DC":0, "FL":1, "GA":1, "HI":0, "ID":1, "IL":0, "IN":1, "IA":1, "KS":1, "KY":1, "LA":1, "ME-D1":0, "ME-D2":1, "ME-AL":0, "MD":0, "MA":0, "MI":1, "MN":0, "MS":1, "MO":1, "MT":1, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":1, "NV":0, "NH":0, "NJ":0, "NM":0, "NY":0, "NC":1, "ND":1, "OH":1, "OK":1, "OR":0, "PA":1, "RI":0, "SC":1, "SD":1, "TN":1, "TX":1, "UT":1, "VT":0, "VA":0, "WA":0, "WV":1, "WI":1, "WY":1}

const regionIDToProjectionName = {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine-1", "ME-D2":"maine-2", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska-1", "NE-D2":"nebraska-2", "NE-D3":"nebraska-3", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}

const regionIDToPollName = {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine", "ME-D2":"maine", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska", "NE-D2":"nebraska", "NE-D3":"nebraska", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}

var regionDataArray = {}
var regionIDsToIgnore = [/.+-button/, /.+-land/]
var linkedRegions = [["MD", "MD-button"], ["DE", "DE-button"], ["NJ", "NJ-button"], ["CT", "CT-button"], ["RI", "RI-button"], ["MA", "MA-button"], ["VT", "VT-button"], ["NH", "NH-button"], ["HI", "HI-button"], ["ME-AL", "ME-AL-land"], ["ME-D1", "ME-D1-land"], ["ME-D2", "ME-D2-land"], ["NE-AL", "NE-AL-land"], ["NE-D1", "NE-D1-land"], ["NE-D2", "NE-D2-land"], ["NE-D3", "NE-D3-land"]]

var mapData
var dataMapLoaded = false

var cachedRawMapData = {}

var rawMapData
var dataMapStartDate
var dataMapEndDate

var currentSliderDate
const initialKeyPressDelay = 300
const zoomKeyPressDelay = 30

const kEditing = 0
const kViewing = 1

var currentMapState = kViewing

var showingHelpBox = false

$(function() {
  $(".slider").css("width", (parseInt($("#svgdata").css("width").replace("px", ""))*parseInt(document.getElementById("mapzoom").style.zoom.replace("%", ""))/100-170) + "px")
  $("#loader").hide()

  populateRegionsArray()
  recalculatePartyTotals()
  //loadDataMap(currentDataSource)
})

function loadDataMap(dataSourceType)
{
  var loadDataMapPromise = new Promise(async (resolve, reject) => {
    if (!(dataSourceType in cachedRawMapData))
    {
      var url = getURLFromSourceConstant(dataSourceType)
      rawMapData = await fetchMapData(url)

      cachedRawMapData[dataSourceType] = rawMapData.concat()
    }
    else
    {
      rawMapData = cachedRawMapData[dataSourceType].concat()
    }

    setDataMapDateSliderRange()
    displayDataMap(dataSourceType)
    $("#dataMapDateSliderContainer").show()
    $("#dateDisplay").show()

    resolve()
  })

  return loadDataMapPromise
}

function getURLFromSourceConstant(sourceType)
{
  switch (sourceType)
  {
    case kProjectionSource:
    return projectionDataURL

    case kPollAverageSource:
    return pollAverageDataURL
  }
}

async function downloadAllMapData()
{
  for (sourceNum in dataSourceTypes)
  {
    cachedRawMapData[dataSourceTypes[sourceNum]] = await fetchMapData(getURLFromSourceConstant(dataSourceTypes[sourceNum]))
  }

  var endDate = getDateRange(cachedRawMapData[dataSourceTypes[0]], dataSourceTypes[0])[1]
  $("#downloadButton").html("Download (" + (endDate.getMonth()+1) + "/" + endDate.getDate() + ")")

  if (dataMapLoaded)
  {
    loadDataMap(currentDataSource)
  }
}

function fetchMapData(url)
{
  var fetchMapDataPromise = new Promise((resolve, reject) => {
    $("#loader").show()
    $.get(url, null, function(data) {
      $("#loader").hide()
      resolve(data)
    })
  })

  return fetchMapDataPromise
}

function getDateRange(mapData, dataSourceType)
{
  var modelDateColumn
  switch (dataSourceType)
  {
    case kProjectionSource:
    modelDateColumn = 3
    break

    case kPollAverageSource:
    modelDateColumn = 2
    break
  }

  var rowSplit = mapData.split("\n")
  var firstRow = rowSplit[1]
  var lastRow = rowSplit[rowSplit.length-2]
  var startDate = new Date(lastRow.split(",")[modelDateColumn])
  var endDate = new Date(firstRow.split(",")[modelDateColumn])

  return [startDate, endDate]
}

function setDataMapDateSliderRange()
{
  var dateRangeCallback = getDateRange(rawMapData, currentDataSource)
  var startDate = dateRangeCallback[0]
  var endDate = dateRangeCallback[1]

  var dayCount = Math.round((endDate.getTime()-startDate.getTime()+((endDate.getTimezoneOffset()-startDate.getTimezoneOffset())*60*1000))/(1000*60*60*24))
  $("#dataMapDateSlider").attr("max", dayCount)
  if (currentSliderDate == null)
  {
    $("#dataMapDateSlider").val(dayCount)
    currentSliderDate = endDate
  }
  else
  {
    var previousSliderDateValue = Math.round((currentSliderDate.getTime()-startDate.getTime()+((endDate.getTimezoneOffset() - startDate.getTimezoneOffset())*60*1000))/(1000*60*60*24))
    if (previousSliderDateValue < 0)
    {
      $("#dataMapDateSlider").val(0)
      currentSliderDate = startDate
    }
    else
    {
      $("#dataMapDateSlider").val(previousSliderDateValue)
    }
  }

  dataMapStartDate = startDate
  dataMapEndDate = endDate
}

function updateSliderDateDisplay(dateToDisplay)
{
  var dateString = (zeroPadding(dateToDisplay.getMonth()+1)) + "/" + zeroPadding(dateToDisplay.getDate()) + "/" + dateToDisplay.getFullYear()
  $("#dateDisplay").html(dateString)
  currentSliderDate = new Date(dateString)
}

function displayDataMap(dataSourceType, daysAgo)
{
  daysAgo = daysAgo || $("#dataMapDateSlider").attr('max')-$("#dataMapDateSlider").val()

  var dateToDisplay = new Date(dataMapEndDate.getTime()-daysAgo*1000*60*60*24) //To fix: This terrible timezone workaround code
  var hoursToAdd
  if (dateToDisplay.getHours() < 12)
  {
    hoursToAdd = -dateToDisplay.getHours()
  }
  else
  {
    hoursToAdd = 24-dateToDisplay.getHours()
  }
  dateToDisplay = new Date(dateToDisplay.getTime()+hoursToAdd*1000*60*60)
  updateSliderDateDisplay(dateToDisplay)

  mapData = extractDataMapDate(rawMapData, dateToDisplay)

  switch (dataSourceType)
  {
    case kProjectionSource:
    incumbentPartyNum = partyCandiates[mapData[0].candidate_inc]
    challengerPartyNum = partyCandiates[mapData[0].candidate_chal]
    break

    case kPollAverageSource: //Hard-Coding
    incumbentPartyNum = 1
    challengerPartyNum = 0

    var mapDataTmp = []
    var regionNames = Object.keys(regionNameToID)
    for (regionNum in regionNames)
    {
      var regionToFind = regionNames[regionNum]

      var mapDataRows = mapData.filter(row => (row.state == regionToFind && Object.keys(partyCandiateFullNames).includes(row.candidate_name)))
      var marginSum = mapDataRows.length > 0 ? 0 : (ev2016[regionNameToID[regionToFind]] == challengerPartyNum ? -100 : 100)
      for (rowNum in mapDataRows)
      {
        if (partyCandiateFullNames[mapDataRows[rowNum].candidate_name] == incumbentPartyNum)
        {
          marginSum += parseFloat(mapDataRows[rowNum].pct_trend_adjusted)
        }
        else
        {
          marginSum -= parseFloat(mapDataRows[rowNum].pct_trend_adjusted)
        }
      }
      mapDataTmp.push({state: regionToFind, margin: marginSum})
    }

    mapData = mapDataTmp
    break
  }

  for (regionNum in mapData)
  {
    var mapRegionData = mapData[regionNum]
    var regionID = regionNameToID[mapRegionData.state]
    var margin = mapRegionData.margin

    var chanceInc
    var chanceChal
    if (currentDataSource == kProjectionSource)
    {
      chanceInc = mapRegionData.winstate_inc
      chanceChal = mapRegionData.winstate_chal
    }

    var partyTilt
    if (Math.sign(margin) == -1)
    {
      partyTilt = challengerPartyNum
    }
    else
    {
      partyTilt = incumbentPartyNum
    }

    var regionDataCallback = getRegionData(regionID)
    var regionData = regionDataCallback[0]
    var regionsToFill = regionDataCallback[1]

    regionData.margin = Math.abs(margin)
    regionData.party = partyTilt
    regionData.chanceInc = chanceInc
    regionData.chanceChal = chanceChal

    updateRegionFillColors(regionsToFill, regionData)
  }

  dataMapLoaded = true
}

function extractDataMapDate(strData, dateToExtract)
{
  var finalArray = []

  var columnDelimiter = ","
  var rowDelimiter = "\n"

  var rowSplitStringArray = strData.split(rowDelimiter)
  var fieldKeys = []
  var previousDate
  var dateChangeCount = 0
  for (rowNum in rowSplitStringArray)
  {
    var rowDataArray = {}
    var columnSplitStringArray = rowSplitStringArray[rowNum].split(columnDelimiter)
    for (columnNum in columnSplitStringArray)
    {
      if (rowNum == 0)
      {
        fieldKeys.push(columnSplitStringArray[columnNum])
      }
      else
      {
        rowDataArray[fieldKeys[columnNum]] = columnSplitStringArray[columnNum]
      }
    }

    if (rowNum > 0)
    {
      if (dateToExtract.getTime() < (new Date(rowDataArray.modeldate)).getTime() || rowDataArray.modeldate == undefined)
      {
        continue
      }

      if (dateToExtract.getTime() > (new Date(rowDataArray.modeldate)).getTime())
      {
        break
      }
    }

    if (rowNum > 0)
    {
      finalArray.push(rowDataArray)
    }
  }

  return finalArray
}

function toggleDataSource(buttonDiv)
{
  var dataSourceArrayIndex = dataSourceTypes.indexOf(currentDataSource)
  dataSourceArrayIndex++
  if (dataSourceArrayIndex > dataSourceTypes.length-1)
  {
    dataSourceArrayIndex = 0
  }
  currentDataSource = dataSourceTypes[dataSourceArrayIndex]

  updateDataSourceButton(buttonDiv)
  loadDataMap(currentDataSource)
}

function updateDataSourceButton(buttonDiv)
{
  switch (currentDataSource)
  {
    case kPollAverageSource:
    $(buttonDiv).html("Source: Poll Avg")
    break

    case kProjectionSource:
    $(buttonDiv).html("Source: Projection")
    break
  }
}

function clearMap()
{
  regionDataArray = {}
  populateRegionsArray()
  $('#outlines').children().each(function() {
    var regionDataCallback = getRegionData($(this).attr('id'))
    var regionIDsToFill = regionDataCallback[1]
    var regionData = regionDataCallback[0]

    updateRegionFillColors(regionIDsToFill, regionData)
  })

  $("#dataMapDateSliderContainer").hide()
  $("#dateDisplay").hide()
  $("#sourceToggleButton").html("Load")
  currentDataSource = kPollAverageSource
}

function toggleHelpBox(helpButtonDiv)
{
  showingHelpBox = !showingHelpBox
  if (showingHelpBox)
  {
    $("#helpboxcontainer").show()
  }
  else
  {
    $("#helpboxcontainer").hide()
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

    regionDataArray[regionID] = {party: -1, margin: 0}
  })
}

function selectParty(div)
{
  if (currentMapState == kEditing)
  {
    var partyID = $(div).attr('id')

    if (selectedPartyID != null)
    {
      $("#" + selectedPartyID).removeClass('active')
    }

    if (selectedPartyID == partyID)
    {
      selectedPartyID = null
      $(div).removeClass('active')
    }
    else
    {
      selectedPartyID = partyID
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
  selectedPartyID = null
}

function toggleEditing()
{
  if (currentMapState == kEditing)
  {
    currentMapState = kViewing
    selectAllParties()
    $("#editDoneButton").html("Edit")

    if (dataMapLoaded && currentRegionID)
    {
      updateStateBox(currentRegionID)
    }
  }
  else if (currentMapState == kViewing)
  {
    currentMapState = kEditing
    deselectAllParties()
    $("#editDoneButton").html("Done")
    $("#stateboxcontainer").hide()
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
    var regionData = regionDataCallback[0]
    var regionIDsToFill = regionDataCallback[1]

    if (partyIDs[regionData.party] != selectedPartyID)
    {
      regionData.party = partyIDs.indexOf(selectedPartyID)
      regionData.margin = marginColorValues[0]
    }
    else
    {
      var marginValueIndex = marginColorValues.indexOf(regionData.margin)
      if (marginValueIndex == -1)
      {
        for (marginValueNum in marginColorValues)
        {
          if (regionData.margin >= marginColorValues[marginValueNum])
          {
            regionData.margin = marginColorValues[marginValueNum]
            break
          }
        }
        marginValueIndex = marginColorValues.indexOf(regionData.margin)
      }

      marginValueIndex += 1
      if (marginValueIndex > marginColorValues.length-1)
      {
        marginValueIndex = 0
      }

      regionData.margin = marginColorValues[marginValueIndex]
    }

    updateRegionFillColors(regionIDsToFill, regionData)
  }
  else if (currentMapState == kViewing && currentRegionID)
  {
    switch (currentDataSource)
    {
      case kProjectionSource:
      window.open(projectionDataRegionURL + regionIDToProjectionName[currentRegionID])
      break

      case kPollAverageSource:
      window.open(pollDataRegionURL + regionIDToPollName[currentRegionID])
      break
    }
  }
}

function rightClickRegion(div)
{
  if (currentMapState == kEditing)
  {
    var regionDataCallback = getRegionData($(div).attr('id'))
    var regionData = regionDataCallback[0]
    var regionIDsToFill = regionDataCallback[1]

    if (partyIDs[regionData.party] != selectedPartyID)
    {
      regionData.party = partyIDs.indexOf(selectedPartyID)
      regionData.margin = 0
    }
    else
    {
      var marginValueIndex = marginColorValues.indexOf(regionData.margin)
      if (marginValueIndex == -1)
      {
        for (marginValueNum in marginColorValues)
        {
          if (regionData.margin >= marginColorValues[marginValueNum])
          {
            regionData.margin = marginColorValues[marginValueNum]
            break
          }
        }
        marginValueIndex = marginColorValues.indexOf(regionData.margin)
      }

      marginValueIndex -= 1
      if (marginValueIndex < 0)
      {
        marginValueIndex = marginColorValues.length-1
      }

      regionData.margin = marginColorValues[marginValueIndex]
    }

    updateRegionFillColors(regionIDsToFill, regionData)
  }
}

function getRegionData(regionID)
{
  var baseRegionIDCallback = getBaseRegionID(regionID)
  regionID = baseRegionIDCallback[0]
  var regionsToFill = baseRegionIDCallback[1]

  var regionData = regionDataArray[regionID]

  return [regionData, regionsToFill]
}

function getBaseRegionID(regionID)
{
  var regionsToFill = [regionID]
  var foundRegion = regionID in regionDataArray

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
            regionsToFill.push(linkedRegionToTest)
          }
          if (!foundRegion && linkedRegionToTest in regionDataArray)
          {
            regionID = linkedRegionToTest
          }
        }
        return [regionID, regionsToFill]
      }
    }
  }

  return [regionID, regionsToFill]
}

function updateRegionFillColors(regionIDsToUpdate, regionData)
{
  var fillColor
  if (regionData.party == -1)
  {
    fillColor = "#6c6e74"
  }
  else
  {
    fillColor = getFillColorForMargin(regionData.margin, regionData.party)
  }

  for (regionIDNum in regionIDsToUpdate)
  {
    var regionDiv = $("#" + regionIDsToUpdate[regionIDNum])
    regionDiv.css('animation-fill-mode', 'forwards')
    regionDiv.css('fill', fillColor)
  }

  recalculatePartyTotals()
}

function getFillColorForMargin(margin, party)
{
  for (marginValueNum in marginColorValues)
  {
    if (Math.abs(margin) >= marginColorValues[marginValueNum])
    {
      return marginColors[party][marginValueNum]
    }
  }
}

function recalculatePartyTotals()
{
  var partyTotals = []
  for (partyNum in partyIDs)
  {
    partyTotals.push(0)
  }

  for (regionID in regionDataArray)
  {
    partyTotals[regionDataArray[regionID].party] += regionEV[regionID]
  }

  for (partyTotalNum in partyTotals)
  {
    $("#" + partyIDs[partyTotalNum]).html(getKeyByValue(partyCandiates, partyTotalNum) + " (" + partyTotals[partyTotalNum] + ")")
  }
}

function updateStateBox(regionID)
{
  var regionData = getRegionData(regionID)[0]
  if (regionData.party == -1) { return }
  $("#stateboxcontainer").show()

  var regionMarginString
  var roundedMarginValue = decimalPadding(Math.round(regionData.margin*10)/10)
  regionMarginString = getKeyByValue(partyCandiates, regionData.party) + " +" + roundedMarginValue

  if (currentDataSource == kProjectionSource)
  {
    //
    regionMarginString += "<br></span><span style='font-size: 17px; padding-top: 5px; padding-bottom: 5px; display: block; line-height: 100%;'>Chances<br>"
    regionMarginString += "<span style='color: " + marginColors[challengerPartyNum][2] + ";'>"
    regionMarginString += decimalPadding(Math.round(regionData.chanceChal*1000)/10)
    regionMarginString += "%</span>&nbsp;&nbsp;&nbsp;<span style='color: " + marginColors[incumbentPartyNum][2] + ";'>"
    regionMarginString += decimalPadding(Math.round(regionData.chanceInc*1000)/10)
    regionMarginString += "%</span></span>"
  }
  //Couldn't get safe colors to look good
  // + "<span style='color: " + getFillColorForMargin(roundedMarginValue, regionData.party) + "; -webkit-text-stroke-width: 0.5px; -webkit-text-stroke-color: white;'>"
  $("#statebox").html(getKeyByValue(regionNameToID, currentRegionID) + "<br>" + "<span style='color: " + marginColors[regionData.party][2] + ";'>" + regionMarginString + "</span>")
}

var arrowKeysDown = {left: 0, right: 0, up: 0, down: 0}

document.addEventListener('keydown', function(e) {
  if (e.which >= 37 && e.which <= 40 && dataMapLoaded)
  {
    switch (e.which)
    {
      case 37:
      if (arrowKeysDown.left > 0) { return }
      arrowKeysDown.left = 1
      setTimeout(function() { arrowKeyCycle("left") }, initialKeyPressDelay)

      incrementSlider("left")
      break

      case 39:
      if (arrowKeysDown.right > 0) { return }
      arrowKeysDown.right = 1
      setTimeout(function() { arrowKeyCycle("right") }, initialKeyPressDelay)

      incrementSlider("right")
      break

      case 40:
      if (arrowKeysDown.down > 0) { return }
      arrowKeysDown.down = 1
      setTimeout(function() { arrowKeyCycle("down") }, initialKeyPressDelay)

      incrementSlider("down")
      break

      case 38:
      if (arrowKeysDown.up > 0) { return }
      arrowKeysDown.up = 1
      setTimeout(function() { arrowKeyCycle("up") }, initialKeyPressDelay)

      incrementSlider("up")
      break
    }
  }
})

function arrowKeyCycle(keyString)
{
  switch (arrowKeysDown[keyString])
  {
    case 0:
    break

    case 1:
    arrowKeysDown[keyString] = 2
    case 2:
    incrementSlider(keyString)
    setTimeout(function() { arrowKeyCycle(keyString) }, zoomKeyPressDelay)
    break
  }
}

function incrementSlider(keyString)
{
  var sliderDiv = $("#dataMapDateSlider")[0]

  switch (keyString)
  {
    case "left":
    if (sliderDiv.value == 0) { return }
    sliderDiv.value -= 1
    break

    case "right":
    if (sliderDiv.value == sliderDiv.max) { return }
    sliderDiv.value -= -1 //WHY DO I HAVE TO DO THIS BS
    break

    case "down":
    if (sliderDiv.value == 0) { return }
    if (sliderDiv.value < 5)
    {
      sliderDiv.value = 0
    }
    else
    {
      sliderDiv.value -= 5
    }
    break

    case "up":
    if (sliderDiv.value == sliderDiv.max) { return }
    if (parseInt(sliderDiv.max)-sliderDiv.value < 5)
    {
      sliderDiv.value = sliderDiv.max
    }
    else
    {
      sliderDiv.value -= -5 //WHY DO I HAVE TO DO THIS BS
    }
    break
  }

  displayDataMap(currentDataSource, sliderDiv.max-sliderDiv.value)
  if (currentRegionID)
  {
    updateStateBox(currentRegionID)
  }
}

document.addEventListener('keyup', function(e) {
  if (e.which >= 37 && e.which <= 40 && dataMapLoaded)
  {
    switch (e.which)
    {
      case 37:
      arrowKeysDown.left = 0
      break

      case 39:
      arrowKeysDown.right = 0
      break

      case 40:
      arrowKeysDown.down = 0
      break

      case 38:
      arrowKeysDown.up = 0
      break
    }
  }
})

document.addEventListener('keypress', async function(e) {
  if (dataMapLoaded && currentMapState == kViewing && e.which >= 49 && e.which <= 57 && e.which-49 < dataSourceTypes.length)
  {
    currentDataSource = dataSourceTypes[e.which-49]
    updateDataSourceButton($("#sourceToggleButton")[0])
    await loadDataMap(currentDataSource)
    if (currentRegionID)
    {
      updateStateBox(currentRegionID)
    }
  }
  else if (currentMapState == kEditing && e.which >= 48 && e.which <= 57 && e.which-48 <= partyIDs.length)
  {
    var partyToSelect = e.which-48
    if (partyToSelect == 0)
    {
      selectParty()
    }
    else
    {
      selectParty($("#" + partyIDs[partyToSelect-1]))
    }
  }
  else if (e.which == 13)
  {
    toggleEditing()
  }
})

var mouseIsDown = false
var regionIDsChanged = []
var startRegionID
var mouseMovedDuringClick = false
var currentRegionID
var ignoreNextClick = false

document.addEventListener('mousedown', function(e) {
  if (currentMapState == kEditing)
  {
    startRegionID = currentRegionID
    mouseIsDown = true
  }
})

document.oncontextmenu = function() {
  if (currentMapState == kEditing)
  {
    regionIDsChanged = []
    mouseIsDown = false
    mouseMovedDuringClick = false
    startRegionID = null
  }
}

function mouseEnteredRegion(div)
{
  var regionID = getBaseRegionID($(div).attr('id'))[0]
  currentRegionID = regionID
  if (currentMapState == kEditing && mouseIsDown && !regionIDsChanged.includes(regionID))
  {
    leftClickRegion(div)
    regionIDsChanged.push(regionID)
  }
  else if (currentMapState == kViewing && dataMapLoaded)
  {
    updateStateBox(regionID)
  }
}

function mouseLeftRegion(div)
{
  var regionID = getBaseRegionID($(div).attr('id'))[0]
  if (currentRegionID == regionID)
  {
    currentRegionID = null
  }

  if (currentMapState == kViewing)
  {
    $("#stateboxcontainer").hide()
  }
}

document.addEventListener('mousemove', function(e) {
  if (currentMapState == kEditing)
  {
    if (mouseIsDown)
    {
      mouseMovedDuringClick = true
    }
    if (mouseIsDown && currentRegionID && !regionIDsChanged.includes(currentRegionID))
    {
      leftClickRegion($("#" + currentRegionID))
      regionIDsChanged.push(currentRegionID)
    }
  }
  else if (currentMapState == kViewing && currentRegionID)
  {
    $("#stateboxcontainer").css("left", e.x+5)
    $("#stateboxcontainer").css("top", e.y+5)
  }
})

document.addEventListener('mouseup', function () {
  if (currentMapState == kEditing)
  {
    regionIDsChanged = []
    mouseIsDown = false
    if (currentRegionID != null && startRegionID == currentRegionID && mouseMovedDuringClick)
    {
      ignoreNextClick = true
    }
    mouseMovedDuringClick = false
    startRegionID = null
  }
})

function zeroPadding(num)
{
  if (num < 10)
  {
    return "0" + num
  }
  return num
}

function decimalPadding(num)
{
  if (num-Math.floor(num) == 0)
  {
    return num + ".0"
  }
  return num
}

function getKeyByValue(object, value)
{
  return Object.keys(object).find(key => object[key] == value)
}
