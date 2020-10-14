var currentMapSource = FiveThirtyEightPollAverageMapSource

var selectedPartyID
var partyIDs = ["DEM", "REP"]
var partyCandiates = {"Biden":0, "Trump":1}
var marginColorValues = [15, 5, 1, 0]
var marginColors = [["#1c408c", "#587ccc", "#8aafff", "#949bb3"], ["#be1c29", "#ff5864", "#ff8b98", "#cf8980"]]

const regionNameToID = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}

const regionEV = {"AL":9, "AK":3, "AZ":11, "AR":6, "CA":55, "CO":9, "CT":7, "DE":3, "DC":3, "FL":29, "GA":16, "HI":4, "ID":4, "IL":20, "IN":11, "IA":6, "KS":6, "KY":8, "LA":8, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":11, "MI":16, "MN":10, "MS":6, "MO":10, "MT":3, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":6, "NH":4, "NJ":14, "NM":5, "NY":29, "NC":15, "ND":3, "OH":18, "OK":7, "OR":7, "PA":20, "RI":4, "SC":9, "SD":3, "TN":11, "TX":38, "UT":6, "VT":3, "VA":13, "WA":12, "WV":5, "WI":10, "WY":3}
const linkedRegions = [["MD", "MD-button"], ["DE", "DE-button"], ["NJ", "NJ-button"], ["CT", "CT-button"], ["RI", "RI-button"], ["MA", "MA-button"], ["VT", "VT-button"], ["NH", "NH-button"], ["HI", "HI-button"], ["ME-AL", "ME-AL-land"], ["ME-D1", "ME-D1-land"], ["ME-D2", "ME-D2-land"], ["NE-AL", "NE-AL-land"], ["NE-D1", "NE-D1-land"], ["NE-D2", "NE-D2-land"], ["NE-D3", "NE-D3-land"]]

var displayRegionDataArray = {}
var regionIDsToIgnore = [/.+-button/, /.+-land/]

var showingDataMap = false

var currentSliderDate
const initialKeyPressDelay = 500
const zoomKeyPressDelayForHalf = 3000

const kEditing = 0
const kViewing = 1

var currentMapState = kViewing

var showingHelpBox = false

const electionDayTime = 1604361600000 //1604390400000 PST

var evPieChart
var regionMarginStrings = []

var evPieChartCutoutPercent = 50
const minEVPieChartSliceLabelValue = 16
const minEVPieChartSliceLabelBrightness = 0.7

$(function() {
  $("#loader").hide()
  resizeElements(false)

  populateRegionsArray()
  displayPartyTotals(getPartyTotals())

  setupEVPieChart()
  updateEVPieChart()

  updateElectionDayCountdown()
  setTimeout(function() {
    setInterval(function() {
      updateElectionDayCountdown()
    }, 1000)
  }, 1000-((new Date()).getTime()%1000))
})

function resizeElements(initilizedPieChart)
{
  var windowWidth = $(window).width()

  //1.0*svgdatawidth*zoom/windowwidth == 0.6
  var mapZoom = 0.62*windowWidth/$("#svgdata").css("width").replace("px", "")
  $("#mapzoom").css("zoom", (mapZoom*100) + "%")

  var mapWidth = parseInt($("#svgdata").css("width").replace("px", ""))*mapZoom
  $(".slider").css("width", mapWidth-190 + "px")
  $("#dateDisplay").css("zoom", (100*windowWidth/1800) + "%")

  $("#evPieChart").css("width", windowWidth-windowWidth*0.12-mapWidth)
  $("#evPieChart").css("height", windowWidth-windowWidth*0.09-mapWidth)

  //1.0*infoboxcontainerswidth*zoom/evpiechartwidth == 1.0
  $("#infoboxcontainers").css("width", $("#evPieChart").css("width").replace("px", ""))

  if (initilizedPieChart == true || initilizedPieChart == null)
  {
    updateEVPieChart()
  }
}

function loadDataMap(shouldSetToMax)
{
  var loadDataMapPromise = new Promise(async (resolve, reject) => {
    $("#dataMapDateSliderContainer").hide()
    $("#dateDisplay").hide()

    insertStatusImage("sourceToggleButton", "./assets/icon-loading.png")
    var loadedSuccessfully = await currentMapSource.loadMap()
    removeStatusImage("sourceToggleButton")

    if (!loadedSuccessfully)
    {
      insertStatusImage("sourceToggleButton", "./assets/icon-error.png")
      resolve()
      return
    }
    else
    {
      $("#dataMapDateSliderContainer").show()
      $("#dateDisplay").show()
      insertStatusImage("sourceToggleButton", "./assets/icon-success.png")
    }

    setDataMapDateSliderRange(shouldSetToMax)
    displayDataMap()
    $("#dataMapDateSliderContainer").show()
    $("#dateDisplay").show()

    resolve()
  })

  return loadDataMapPromise
}

async function downloadAllMapData()
{
  $("#downloadButton").html("Downloading")
  insertStatusImage("downloadButton", "./assets/icon-loading.png")
  for (sourceIDNum in mapSourceIDs)
  {
    await mapSources[mapSourceIDs[sourceIDNum]].loadMap(true)
  }

  var endDate = FiveThirtyEightPollAverageMapSource.getDateRange().end //Hardcoding 538 polls as most recent end date
  $("#downloadButton").html("Download (" + (endDate.getMonth()+1) + "/" + endDate.getDate() + ")")
  insertStatusImage("downloadButton", "./assets/icon-success.png")

  if (showingDataMap)
  {
    loadDataMap(true)
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

function setDataMapDateSliderRange(shouldSetToMax)
{
  shouldSetToMax = shouldSetToMax || false

  var mapDates = currentMapSource.getMapDates()
  var startDate = new Date(mapDates[0])
  var endDate = new Date(mapDates[mapDates.length-1])

  var previousValueWasLatest = $("#dataMapDateSlider").val() == $("#dataMapDateSlider").attr('max')

  $("#dataMapDateSlider").attr('max', mapDates.length+1)

  if (currentSliderDate == null || shouldSetToMax || previousValueWasLatest)
  {
    $("#dataMapDateSlider").val(mapDates.length+1)
    currentSliderDate = endDate
  }
  else
  {
    var previousDate = currentSliderDate.getTime()
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

    $("#dataMapDateSlider").val(parseInt(closestDateIndex)+1)
    currentSliderDate = new Date(closestDate)
  }
}

function updateSliderDateDisplay(dateToDisplay, overrideDateString)
{
  var dateString
  if (overrideDateString != null)
    dateString = overrideDateString
  else
    dateString = (zeroPadding(dateToDisplay.getMonth()+1)) + "/" + zeroPadding(dateToDisplay.getDate()) + "/" + dateToDisplay.getFullYear()

  $("#dateDisplay").html(dateString)
  currentSliderDate = dateToDisplay
}

function displayDataMap(dateIndex)
{
  dateIndex = dateIndex || $("#dataMapDateSlider").val()

  var mapDates = currentMapSource.getMapDates()
  var dateToDisplay
  var overrideDateString
  if (dateIndex-1 > mapDates.length-1)
  {
    dateToDisplay = new Date(mapDates[dateIndex-1-1])
    overrideDateString = "Latest (" + (zeroPadding(dateToDisplay.getMonth()+1)) + "/" + zeroPadding(dateToDisplay.getDate()) + "/" + dateToDisplay.getFullYear() + ")"
  }
  else
    dateToDisplay = new Date(mapDates[dateIndex-1])

  updateSliderDateDisplay(dateToDisplay, overrideDateString)

  var currentMapDataForDate = currentMapSource.getMapData()[dateToDisplay.getTime()]

  for (regionNum in currentMapDataForDate)
  {
    var regionDataCallback = getRegionData(currentMapDataForDate[regionNum].region)
    var regionData = regionDataCallback.regionData
    var regionsToFill = regionDataCallback.linkedRegionIDs

    regionData.margin = currentMapDataForDate[regionNum].margin
    regionData.party = currentMapDataForDate[regionNum].party
    regionData.chanceIncumbent = currentMapDataForDate[regionNum].chanceIncumbent
    regionData.chanceChallenger = currentMapDataForDate[regionNum].chanceChallenger

    updateRegionFillColors(regionsToFill, currentMapDataForDate[regionNum], false)
  }

  updateEVPieChart()

  showingDataMap = true
}

function toggleMapSource(buttonDiv)
{
  var mapSourceArrayIndex = mapSourceIDs.indexOf(currentMapSource.getID())
  mapSourceArrayIndex++
  if (mapSourceArrayIndex > mapSourceIDs.length-1)
  {
    mapSourceArrayIndex = 0
  }
  currentMapSource = mapSources[mapSourceIDs[mapSourceArrayIndex]]

  updateMapSourceButton(buttonDiv)
  loadDataMap()
}

function updateMapSourceButton(buttonDiv)
{
  $(buttonDiv).html("Source: " + currentMapSource.getID())
}

function clearMap()
{
  displayRegionDataArray = {}
  populateRegionsArray()
  $('#outlines').children().each(function() {
    var regionDataCallback = getRegionData($(this).attr('id'))
    var regionIDsToFill = regionDataCallback.linkedRegionIDs
    var regionData = regionDataCallback.regionData

    updateRegionFillColors(regionIDsToFill, regionData, false)
  })

  updateEVPieChart()

  $("#dataMapDateSliderContainer").hide()
  $("#dateDisplay").hide()
  $("#sourceToggleButton").html("Display")
  currentMapSource = FiveThirtyEightPollAverageMapSource

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
  }
  else
  {
    $("#helpboxcontainer").hide()
    $("#toggleHelpBoxButton").removeClass('active')
    $("#evPieChartContainer").show()
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

    displayRegionDataArray[regionID] = {party: -1, margin: 0}
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

    if (showingDataMap && currentRegionID)
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
    var regionData = regionDataCallback.regionData
    var regionIDsToFill = regionDataCallback.linkedRegionIDs

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

  displayPartyTotals(getPartyTotals())
  if (shouldUpdatePieChart == null || shouldUpdatePieChart == true)
  {
    updateEVPieChart()
  }
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

function getPartyTotals()
{
  var partyTotals = []
  for (partyNum in partyIDs)
  {
    partyTotals.push(0)
  }

  for (regionID in displayRegionDataArray)
  {
    if (displayRegionDataArray[regionID].party == -1) { continue }
    partyTotals[displayRegionDataArray[regionID].party] += regionEV[regionID]
  }

  return partyTotals
}

function displayPartyTotals(partyTotals)
{
  for (partyTotalNum in partyTotals)
  {
    $("#" + partyIDs[partyTotalNum]).html(getKeyByValue(partyCandiates, partyTotalNum) + " (" + partyTotals[partyTotalNum] + ")")
  }
}

function setupEVPieChart()
{
  var data = {
    datasets: [
      {
        data: [0, 0, 0, 0, 538, 0, 0, 0, 0],
        backgroundColor: [
          marginColors[0][0],
          marginColors[0][1],
          marginColors[0][2],
          marginColors[0][3],
          "#6c6e74",
          marginColors[1][3],
          marginColors[1][2],
          marginColors[1][1],
          marginColors[1][0]
        ],
        labels: [
          "Safe Dem",
          "Likely Dem",
          "Lean Dem",
          "Tilt Dem",
          "Tossup",
          "Tilt Rep",
          "Lean Rep",
          "Likely Rep",
          "Safe Rep"
        ]
      },
      {
        data: [0, 538, 0],
        backgroundColor: [
          marginColors[0][0],
          "#6c6e74",
          marginColors[1][0]
        ],
        labels: [
          "Democratic",
          "Tossup",
          "Republican"
        ]
      }
    ],
  }

  var options = {
    responsive: false,
    cutoutPercentage: evPieChartCutoutPercent,
    rotation: 0.5*Math.PI,
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#ddd"
      }
    },
    legend: {
      display: false
    },
    tooltips: {
      titleFontSize: 15,
      titleFontStyle: "bold",
      bodyFontSize: 15,
      bodyFontStyle: "bold",
      displayColors: false,
      callbacks: {
        title: function(tooltipItem, data) {
          var label = data.datasets[tooltipItem[0].datasetIndex].labels[tooltipItem[0].index] || ''
          label += ': '
          label += data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index]

          return label
        },
        label: function(tooltipItem, data) {
          if (tooltipItem.datasetIndex != 0) { return }
          var labelArray = regionMarginStrings[tooltipItem.index].concat()
          return labelArray
        },
        labelTextColor: function(tooltipItem, chart) {
          var color = chart.config.data.datasets[tooltipItem.datasetIndex].backgroundColor[tooltipItem.index]
          return adjustBrightness(color, minEVPieChartSliceLabelBrightness)
        }
      }
    },
    plugins: {
      datalabels: {
        color: function(context) {
          var value = context.dataset.data[context.dataIndex]
          return value < minEVPieChartSliceLabelValue ? "rgb(0, 0, 0, 0)" : "#fff"
        },
        font: {
          family: "Bree5erif-Mono",
          size: Math.round(24*$(window).width()/1800), //abc
          weight: "bold"
        }
      }
    }
  }

  var ctx = document.getElementById('evPieChart').getContext('2d')
  evPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: options
  })
}

function updateEVPieChart()
{
  var marginTotals = []
  for (partyNum in partyIDs)
  {
    for (marginNum in marginColors[partyNum])
    {
      marginTotals.push(0)
    }
  }
  marginTotals.push(0) // Add tossup

  regionMarginStrings = []
  for (partyNum in partyIDs)
  {
    for (marginNum in marginColors[partyNum])
    {
      regionMarginStrings.push([])
    }
  }
  regionMarginStrings.push([])

  for (regionID in displayRegionDataArray)
  {
    var regionParty = displayRegionDataArray[regionID].party
    var regionMargin = displayRegionDataArray[regionID].margin
    var marginIndex
    if (regionParty == -1)
    {
      marginIndex = marginColors[0].length-1+1
    }
    else
    {
      marginIndex = marginColors[regionParty].indexOf(getFillColorForMargin(regionMargin, regionParty))
    }

    var pieChartIndex = (regionParty == -1 ? marginIndex : (regionParty == 0 ? marginIndex : marginColors[0].length-1+1+marginColors[0].length-marginIndex))  // Hardcoding party 0, 1 indexes for dataset
    marginTotals[pieChartIndex] += regionEV[regionID]
    regionMarginStrings[pieChartIndex].push(regionID + " +" + decimalPadding(Math.round(regionMargin*10)/10))
  }

  for (regionArrayNum in regionMarginStrings)
  {
    regionMarginStrings[regionArrayNum].sort((marginString1, marginString2) => {
      return parseFloat(marginString1.split("+")[1]) > parseFloat(marginString2.split("+")[1])
    })
  }

  var partyTotals = getPartyTotals()
  var evNotTossup = 0
  for (partyTotalNum in partyTotals)
  {
    evNotTossup += partyTotals[partyTotalNum]
  }
  if (partyTotals.length == 0)
  {
    for (partyNum in partyIDs)
    {
      partyTotals.push(0)
    }
  }

  partyTotals = partyTotals.concat().splice(0,Math.ceil(partyTotals.length/2)).concat([538-evNotTossup]).concat(partyTotals.concat().splice(Math.ceil(partyTotals.length/2)))
  evPieChart.data.datasets[1].data = partyTotals

  var safeMarginTotals = [marginTotals[0], marginTotals[4], marginTotals[8]] // Hardcoding two parties
  if (safeMarginTotals.toString() == partyTotals.toString())
  {
    evPieChart.data.datasets[0].hidden = true
    evPieChart.data.datasets[0].data = []
  }
  else
  {
    evPieChart.data.datasets[0].hidden = false
    evPieChart.data.datasets[0].data = marginTotals
  }

  evPieChart.update()
}

function updateStateBox(regionID)
{
  var regionData = getRegionData(regionID).regionData
  if (regionData.party == -1) { return }
  $("#stateboxcontainer").show()

  var regionMarginString
  var roundedMarginValue = decimalPadding(Math.round(regionData.margin*10)/10)
  regionMarginString = getKeyByValue(partyCandiates, regionData.party) + " +" + roundedMarginValue

  if (regionData.chanceChallenger && regionData.chanceIncumbent)
  {
    regionMarginString += "<br></span><span style='font-size: 17px; padding-top: 5px; padding-bottom: 5px; display: block; line-height: 100%;'>Chances<br>"
    regionMarginString += "<span style='color: " + marginColors[incumbentChallengerPartyNumbers.challenger][2] + ";'>"
    regionMarginString += decimalPadding(Math.round(regionData.chanceChallenger*1000)/10)
    regionMarginString += "%</span>&nbsp;&nbsp;&nbsp;<span style='color: " + marginColors[incumbentChallengerPartyNumbers.incumbent][2] + ";'>"
    regionMarginString += decimalPadding(Math.round(regionData.chanceIncumbent*1000)/10)
    regionMarginString += "%</span></span>"
  }
  //Couldn't get safe colors to look good
  // + "<span style='color: " + getFillColorForMargin(roundedMarginValue, regionData.party) + "; -webkit-text-stroke-width: 0.5px; -webkit-text-stroke-color: white;'>"
  $("#statebox").html(getKeyByValue(regionNameToID, currentRegionID) + "<br>" + "<span style='color: " + marginColors[regionData.party][2] + ";'>" + regionMarginString + "</span>")
}

function updateElectionDayCountdown()
{
  var currentDate = new Date()
  var electionDayLocalOffset = (new Date(electionDayTime)).getTimezoneOffset()*60*1000
  var timeUntilElectionDay = electionDayTime-currentDate.getTime()+electionDayLocalOffset

  var daysUntilElectionDay = Math.floor(timeUntilElectionDay/(1000*60*60*24))
  var hoursUntilElectionDay = Math.floor(timeUntilElectionDay/(1000*60*60)%24)
  var minutesUntilElectionDay = Math.floor(timeUntilElectionDay/(1000*60)%60)
  var secondsUntilElectionDay = Math.floor(timeUntilElectionDay/1000%60)

  $("#electionCountdownDisplay").html(daysUntilElectionDay + "<span style='font-size: 16px;'> day" + (daysUntilElectionDay == 1 ? "" : "s") + "</span>&nbsp;&nbsp;" + zeroPadding(hoursUntilElectionDay) + "<span style='font-size: 16px;'> hr" + (hoursUntilElectionDay == 1 ? "" : "s") + "</span>&nbsp;&nbsp;" + zeroPadding(minutesUntilElectionDay) + "<span style='font-size: 16px;'> min" + (minutesUntilElectionDay == 1 ? "" : "s") + "</span>&nbsp;&nbsp;" + zeroPadding(secondsUntilElectionDay) + "<span style='font-size: 16px;'> s" + "</span>")
}

var arrowKeysDown = {left: 0, right: 0, up: 0, down: 0}
var arrowKeyTimeouts = {}

document.addEventListener('keydown', function(e) {
  if (e.which >= 37 && e.which <= 40 && showingDataMap)
  {
    switch (e.which)
    {
      case 37:
      if (arrowKeysDown.left > 0) { return }
      arrowKeysDown.left = 1
      arrowKeyTimeouts.left = setTimeout(function() { arrowKeyCycle("left") }, initialKeyPressDelay)

      incrementSlider("left")
      break

      case 39:
      if (arrowKeysDown.right > 0) { return }
      arrowKeysDown.right = 1
      arrowKeyTimeouts.right = setTimeout(function() { arrowKeyCycle("right") }, initialKeyPressDelay)

      incrementSlider("right")
      break

      case 40:
      if (arrowKeysDown.down > 0) { return }
      arrowKeysDown.down = 1
      arrowKeyTimeouts.down = setTimeout(function() { arrowKeyCycle("down") }, initialKeyPressDelay)

      incrementSlider("down")
      break

      case 38:
      if (arrowKeysDown.up > 0) { return }
      arrowKeysDown.up = 1
      arrowKeyTimeouts.up = setTimeout(function() { arrowKeyCycle("up") }, initialKeyPressDelay)

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
    setTimeout(function() { arrowKeyCycle(keyString) }, zoomKeyPressDelayForHalf*2.0/currentMapSource.getMapDates().length)
    break
  }
}

function incrementSlider(keyString)
{
  var sliderDiv = $("#dataMapDateSlider")[0]
  if ($(sliderDiv).is(":hidden")) { return }

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

  displayDataMap(sliderDiv.value)
  if (currentRegionID)
  {
    updateStateBox(currentRegionID)
  }
}

document.addEventListener('keyup', function(e) {
  if (e.which >= 37 && e.which <= 40 && showingDataMap)
  {
    switch (e.which)
    {
      case 37:
      arrowKeysDown.left = 0
      clearTimeout(arrowKeyTimeouts.left)
      break

      case 39:
      arrowKeysDown.right = 0
      clearTimeout(arrowKeyTimeouts.right)
      break

      case 40:
      arrowKeysDown.down = 0
      clearTimeout(arrowKeyTimeouts.down)
      break

      case 38:
      arrowKeysDown.up = 0
      clearTimeout(arrowKeyTimeouts.up)
      break
    }
  }
})

document.addEventListener('keypress', async function(e) {
  if (showingDataMap && currentMapState == kViewing && e.which >= 49 && e.which <= 57 && e.which-49 < mapSourceIDs.length)
  {
    currentMapSource = mapSources[mapSourceIDs[e.which-49]]
    updateMapSourceButton($("#sourceToggleButton")[0])
    await loadDataMap()
    if (currentRegionID)
    {
      updateStateBox(currentRegionID)
    }
  }
  else if (currentMapState == kViewing && e.which == 48)
  {
    clearMap()
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
  else if (e.which == 82)
  {
    resizeElements()
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
  var regionID = getBaseRegionID($(div).attr('id')).baseID
  currentRegionID = regionID
  if (currentMapState == kEditing && mouseIsDown && !regionIDsChanged.includes(regionID))
  {
    leftClickRegion(div)
    regionIDsChanged.push(regionID)
  }
  else if (currentMapState == kViewing && showingDataMap)
  {
    updateStateBox(regionID)
  }
}

function mouseLeftRegion(div)
{
  var regionID = getBaseRegionID($(div).attr('id')).baseID
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

$("html").on('dragenter', function(e) {
  e.stopPropagation()
  e.preventDefault()
})

$("html").on('dragover', function(e) {
  e.stopPropagation()
  e.preventDefault()
})

$("html").on('drop', function(e) {
  e.stopPropagation()
  e.preventDefault()

  var file = e.originalEvent.dataTransfer.files[0]

  //Eventually add switch here to check for file type (possibly using extension), for file uploads of maps, icons, etc.

  var fr = new FileReader()
	fr.onload = onFileReaderLoad
	fr.readAsDataURL(file)
})

function onFileReaderLoad(e)
{
  var backgroundURL = "url('" + e.target.result + "')";
	$("#evPieChart").css("background", backgroundURL)
  $("#evPieChart").css("background-position", "center")
  $("#evPieChart").css("background-size", $("#evPieChart").width()*evPieChartCutoutPercent/100.0*0.5)
  $("#evPieChart").css("background-repeat", "no-repeat")
}

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

function adjustBrightness(hexColorString, minBrightness)
{
  var rgb = hexToRGB(hexColorString)
  if (!rgb) { return }

  var hsv = RGBtoHSV(rgb)
  if (hsv.v < minBrightness)
  {
    hsv.v = minBrightness
  }

  console.log(hsv.v)

  return RGBToHex(HSVtoRGB(hsv))
}

function hexToRGB(hex)
{
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function componentToHex(c) {
  var hex = c.toString(16)
  return hex.length == 1 ? "0" + hex : hex
}

function RGBToHex(rgb) {
  return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b)
}

function RGBtoHSV(r, g, b) {
  if (arguments.length === 1) {
    g = r.g, b = r.b, r = r.r
  }
  var max = Math.max(r, g, b), min = Math.min(r, g, b),
    d = max - min,
    h,
    s = (max === 0 ? 0 : d / max),
    v = max / 255

  switch (max) {
    case min: h = 0; break
    case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break
    case g: h = (b - r) + d * 2; h /= 6 * d; break
    case b: h = (r - g) + d * 4; h /= 6 * d; break
  }

  return {
    h: h,
    s: s,
    v: v
  }
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t
  if (arguments.length === 1) {
    s = h.s, v = h.v, h = h.h
  }
  i = Math.floor(h * 6)
  f = h * 6 - i
  p = v * (1 - s)
  q = v * (1 - f * s)
  t = v * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break
    case 1: r = q, g = v, b = p; break
    case 2: r = p, g = v, b = t; break
    case 3: r = p, g = q, b = v; break
    case 4: r = t, g = p, b = v; break
    case 5: r = v, g = p, b = q; break
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}
