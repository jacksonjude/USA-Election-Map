const projectionDataURL = "https://projects.fivethirtyeight.com/2020-general-data/presidential_state_toplines_2020.csv"
const pollAverageDataURL = "https://projects.fivethirtyeight.com/2020-general-data/presidential_poll_averages_2020.csv"
var dataURLToUse

var selectedPartyID
var partyIDs = ["DEM", "REP"]
var partyCandiates = {"Biden":0, "Trump":1}
var incumbentPartyNum
var challengerPartyNum
var marginColorValues = [15, 5, 1, 0]
var marginColors = [["#1c408c", "#587ccc", "#8aafff", "#949bb3"], ["#be1c29", "#ff5864", "#ff8b98", "#cf8980"]]

var regionNameToID = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}

var regionEV = {"AL":9, "AK":3, "AZ":11, "AR":6, "CA":55, "CO":9, "CT":7, "DE":3, "DC":3, "FL":29, "GA":16, "HI":4, "ID":4, "IL":20, "IN":11, "IA":6, "KS":5, "KY":8, "LA":8, "ME-D1":1, "ME-D2":2, "ME-AL":2, "MD":10, "MA":11, "MI":16, "MN":10, "MS":6, "MO":10, "MT":3, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":6, "NH":4, "NJ":14, "NM":5, "NY":29, "NC":15, "ND":3, "OH":18, "OK":7, "OR":7, "PA":20, "RI":3, "SC":9, "SD":3, "TN":11, "TX":38, "UT":6, "VT":3, "VA":13, "WA":12, "WV":5, "WI":10, "WY":3}

var regionDataArray = {}
var regionIDsToIgnore = [/.+-button/, /.+-land/]
var linkedRegions = [["MD", "MD-button"], ["DE", "DE-button"], ["NJ", "NJ-button"], ["CT", "CT-button"], ["RI", "RI-button"], ["MA", "MA-button"], ["VT", "VT-button"], ["NH", "NH-button"], ["HI", "HI-button"], ["ME-AL", "ME-AL-land"], ["ME-D1", "ME-D1-land"], ["ME-D2", "ME-D2-land"], ["NE-AL", "NE-AL-land"], ["NE-D1", "NE-D1-land"], ["NE-D2", "NE-D2-land"], ["NE-D3", "NE-D3-land"]]

var mapData
var dataMapLoaded = false

var rawMapData
var dataMapStartDate
var dataMapEndDate

var kEditing = 0
var kViewing = 1

var currentMapState = kViewing

$(function() {
  $(".slider").css("width", (parseInt($("#svgdata").css("width").replace("px", ""))*parseInt(document.getElementById("mapzoom").style.zoom.replace("%", ""))/100-170) + "px")

  populateRegionsArray()
  loadDataMap(projectionDataURL)
})

async function loadDataMap(url)
{
  rawMapData = await fetchMapData(url)
  setDataMapDateSliderRange()
  displayDataMap()
}

function fetchMapData(url)
{
  var fetchMapDataPromise = new Promise((resolve, reject) => {
    $.get(url, null, function(data) {
      resolve(data)
    })
  })

  return fetchMapDataPromise
}

function setDataMapDateSliderRange()
{
  var rowSplit = rawMapData.split("\n")
  var firstRow = rowSplit[1]
  var lastRow = rowSplit[rowSplit.length-2]
  var startDate = new Date(lastRow.split(",")[3])
  var endDate = new Date(firstRow.split(",")[3])

  var dayCount = (endDate.getTime()-startDate.getTime())/(1000*60*60*24)
  $("#dataMapDateSlider").attr("max", dayCount)
  $("#dataMapDateSlider").attr("value", dayCount)

  dataMapStartDate = startDate
  dataMapEndDate = endDate
}

function displayDataMap(daysAgo)
{
  daysAgo = daysAgo || 0

  var dateToDisplay = new Date(dataMapEndDate.getTime()-daysAgo*1000*60*60*24)
  $("#dateDisplay").html((zeroPadding(dateToDisplay.getMonth()+1)) + "/" + zeroPadding(dateToDisplay.getDate()) + "/" + dateToDisplay.getFullYear())

  mapData = extractDataMapDate(rawMapData, daysAgo)

  incumbentPartyNum = partyCandiates[mapData[0].candidate_inc]
  challengerPartyNum = partyCandiates[mapData[0].candidate_chal]

  for (regionNum in mapData)
  {
    var regionData = mapData[regionNum]
    var regionID = regionNameToID[regionData.state]
    var margin = regionData.margin

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

    updateRegionFillColors(regionsToFill, regionData)
  }

  dataMapLoaded = true
}

function extractDataMapDate(strData, daysAgo)
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
      if (!previousDate)
      {
        previousDate = rowDataArray.modeldate
      }

      if (previousDate && previousDate != rowDataArray.modeldate)
      {
        previousDate = rowDataArray.modeldate
        dateChangeCount++
      }

      if (dateChangeCount < daysAgo)
      {
        continue
      }
      else if (dateChangeCount > daysAgo)
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
  }
  else if (currentMapState == kViewing)
  {
    currentMapState = kEditing
    deselectAllParties()
    $("#editDoneButton").html("Done")
    $("#stateboxcontainer").css("display", "none")
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
  else if (currentMapState == kViewing)
  {
    //Link to 538 forecast
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
    for (marginValueNum in marginColorValues)
    {
      if (Math.abs(regionData.margin) >= marginColorValues[marginValueNum])
      {
        fillColor = marginColors[regionData.party][marginValueNum]
        break
      }
    }
  }

  for (regionIDNum in regionIDsToUpdate)
  {
    var regionDiv = $("#" + regionIDsToUpdate[regionIDNum])
    regionDiv.css('animation-fill-mode', 'forwards')
    regionDiv.css('fill', fillColor)
  }

  recalculatePartyTotals()
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

document.addEventListener('keypress', function(e) {
  if (e.which >= 48 && e.which <= 57 && e.which-48 <= partyIDs.length)
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
    var regionData = getRegionData(regionID)[0]
    if (regionData.party == -1) { return }
    $("#stateboxcontainer").css("display", "block")

    var regionMarginString
    var roundedMarginValue = decimalPadding(Math.round(regionData.margin*10)/10)
    regionMarginString = getKeyByValue(partyCandiates, regionData.party) + " +" + roundedMarginValue
    $("#statebox").html(getKeyByValue(regionNameToID, currentRegionID) + "<br>" + regionMarginString)
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
    $("#stateboxcontainer").css("display", "none")
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
  return Object.keys(object).find(key => object[key] == value);
}
