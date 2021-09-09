var totalsPieChart
var regionMarginStrings = []

const PieChartDirection = {
  clockwise: 0,
  counterclockwise: 1
}

var partyOrdering = [
  {partyID: Independent1860JohnBreckenridgeParty.getID(), direction: PieChartDirection.clockwise},
  {partyID: GreenParty.getID(), direction: PieChartDirection.clockwise},
  {partyID: DemocraticParty.getID(), direction: PieChartDirection.clockwise},
  {partyID: Independent1948SMParty.getID(), direction: PieChartDirection.clockwise},
  {partyID: Independent1960HBParty.getID(), direction: PieChartDirection.clockwise},
  {partyID: Independent1968GWParty.getID(), direction: PieChartDirection.clockwise},
  {partyID: IndependentGenericParty.getID(), direction: PieChartDirection.clockwise},
  {partyID: TossupParty.getID(), direction: PieChartDirection.clockwise},
  {partyID: Independent1856MFParty.getID(), direction: PieChartDirection.counterclockwise},
  {partyID: Independent1860JohnBellParty.getID(), direction: PieChartDirection.counterclockwise},
  {partyID: Independent1892JWParty.getID(), direction: PieChartDirection.counterclockwise},
  {partyID: Independent1924RLParty.getID(), direction: PieChartDirection.counterclockwise},
  {partyID: RepublicanParty.getID(), direction: PieChartDirection.counterclockwise},
  {partyID: LibertarianParty.getID(), direction: PieChartDirection.counterclockwise},
  {partyID: Independent1912TRParty.getID(), direction: PieChartDirection.counterclockwise}
]

var totalsPieChartCutoutPercent = 55
const minTotalsPieChartSliceLabelPercent = 0.04
const minTotalsPieChartSliceLabelBrightness = 0.7

function setupTotalsPieChart()
{
  for (var customPartyOn=1; customPartyOn <= maxPartiesToDisplay; customPartyOn++)
  {
    insertPartyIntoTotalsPieChartOrdering(customPartyIDPrefix + customPartyOn)
  }

  var data = setupTotalsPieChartDatasets()

  var options = {
    responsive: false,
    cutoutPercentage: totalsPieChartCutoutPercent,
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
          return adjustBrightness(color, minTotalsPieChartSliceLabelBrightness)
        }
      }
    },
    plugins: {
      datalabels: {
        color: function(context) {
          var value = context.dataset.data[context.dataIndex]
          var evSum = 0
          for (var dataNum in context.dataset.data)
          {
            evSum += context.dataset.data[dataNum]
          }
          return (value == 0 || value < Math.floor(minTotalsPieChartSliceLabelPercent*evSum)) ? "rgb(0, 0, 0, 0)" : "#fff"
        },
        font: {
          family: "Bree5erif-Mono",
          size: Math.round(24*$(window).width()/1800),
          weight: "bold"
        }
      }
    }
  }

  var ctx = document.getElementById('totalsPieChart').getContext('2d')
  totalsPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: options
  })
}

function setupTotalsPieChartDatasets(partyOrderingArg)
{
  var fullPartyOrdering = partyOrderingArg || partyOrdering

  var marginSectionData = []
  var marginSectionBackgroundColors = []
  var marginSectionLabels = []

  var partySectionData = []
  var partySectionBackgroundColors = []
  var partySectionLabels = []

  for (var partyNum in fullPartyOrdering)
  {
    var partyID = fullPartyOrdering[partyNum].partyID
    if (partyID != TossupParty.getID())
    {
      if (politicalParties[partyID] != null)
      {
        var marginNames = Object.keys(cloneObject(politicalParties[partyID].getMarginNames()))
        if (fullPartyOrdering[partyNum].direction == PieChartDirection.clockwise) {}
        else if (fullPartyOrdering[partyNum].direction == PieChartDirection.counterclockwise)
        {
          marginNames.reverse()
        }

        for (var marginKeyNum in marginNames)
        {
          var marginKey = marginNames[marginKeyNum]

          marginSectionData.push(0)
          marginSectionBackgroundColors.push(politicalParties[partyID].getMarginColors()[marginKey])
          marginSectionLabels.push(politicalParties[partyID].getMarginNames()[marginKey] + " " + politicalParties[partyID].getShortName())
        }

        partySectionData.push(0)
        partySectionBackgroundColors.push(politicalParties[partyID].getMarginColors().safe)
        partySectionLabels.push(politicalParties[partyID].getNames()[0])
      }
      else
      {
        for (var marginKey in defaultMarginNames)
        {
          marginSectionData.push(0)
          marginSectionBackgroundColors.push("#000")
          marginSectionLabels.push(defaultMarginNames[marginKey])
        }

        partySectionData.push(0)
        partySectionBackgroundColors.push("#000")
        partySectionLabels.push("null")
      }
    }
    else
    {
      marginSectionData.push(currentMapType.getTotalEV())
      marginSectionBackgroundColors.push(TossupParty.getMarginColors().safe)
      marginSectionLabels.push(TossupParty.getNames()[0])

      partySectionData.push(currentMapType.getTotalEV())
      partySectionBackgroundColors.push(TossupParty.getMarginColors().safe)
      partySectionLabels.push(TossupParty.getNames()[0])
    }
  }

  var data = {
    datasets: [
      {
        data: marginSectionData,
        backgroundColor: marginSectionBackgroundColors,
        labels: marginSectionLabels
      },
      {
        data: partySectionData,
        backgroundColor: partySectionBackgroundColors,
        labels: partySectionLabels
      }
    ],
  }

  return data
}

function updateTotalsPieChart()
{
  var marginTotalsData = {}
  var regionMarginStringsData = {}

  for (var partyNum in partyOrdering)
  {
    let partyID = partyOrdering[partyNum].partyID

    marginTotalsData[partyID] = {}
    regionMarginStringsData[partyID] = {}

    if (partyID != TossupParty.getID())
    {
      var marginNames = defaultMarginNames
      if (politicalParties[partyID] != null)
      {
        marginNames = politicalParties[partyID].getMarginNames()
      }
      for (let marginKey in marginNames)
      {
        marginTotalsData[partyID][marginKey] = 0
        regionMarginStringsData[partyID][marginKey] = []
      }
    }
    else
    {
      marginTotalsData[partyID].safe = 0
      regionMarginStringsData[partyID].safe = []
    }
  }

  var fullPartyOrdering = cloneObject(partyOrdering)

  for (var regionID in displayRegionDataArray)
  {
    var regionParty = displayRegionDataArray[regionID].partyID
    if (regionParty != null && !fullPartyOrdering.some((orderingData) => orderingData.partyID == regionParty))
    {
      insertPartyIntoTotalsPieChartOrdering(regionParty, fullPartyOrdering)

      marginTotalsData[regionParty] = {}
      regionMarginStringsData[regionParty] = {}

      for (let marginKey in politicalParties[regionParty].getMarginNames())
      {
        marginTotalsData[regionParty][marginKey] = 0
        regionMarginStringsData[regionParty][marginKey] = []
      }
    }

    var regionMargin = displayRegionDataArray[regionID].margin

    var regionEV = currentMapType.getEV(getCurrentDecade(), regionID, displayRegionDataArray[regionID].disabled)
    var regionString = regionID + " +" + decimalPadding(Math.round(regionMargin*10)/10, currentMapSource.getAddDecimalPadding())

    if (regionParty == null || regionParty == TossupParty.getID())
    {
      marginTotalsData[TossupParty.getID()].safe += regionEV
      regionMarginStringsData[TossupParty.getID()].safe.push(regionString)
    }
    else
    {
      let marginKey = getMarginIndexForValue(regionMargin, regionParty)

      marginTotalsData[regionParty][marginKey] += regionEV
      regionMarginStringsData[regionParty][marginKey].push(regionString)
    }
  }

  for (partyNum in regionMarginStringsData)
  {
    for (let marginKey in regionMarginStringsData[partyNum])
    {
      regionMarginStringsData[partyNum][marginKey].sort((marginString1, marginString2) => {
        return parseFloat(marginString1.split("+")[1]) > parseFloat(marginString2.split("+")[1]) ? 1 : -1
      })
    }
  }

  regionMarginStrings = []
  var marginTotalsArray = []
  var safeMarginTotalsArray = []
  for (partyNum in fullPartyOrdering)
  {
    var partyID = fullPartyOrdering[partyNum].partyID
    if (partyID != TossupParty.getID())
    {
      var marginNames = Object.keys(defaultMarginNames)
      if (politicalParties[partyID] != null)
      {
        marginNames = Object.keys(cloneObject(politicalParties[partyID].getMarginNames()))
      }
      if (fullPartyOrdering[partyNum].direction == PieChartDirection.clockwise) {}
      else if (fullPartyOrdering[partyNum].direction == PieChartDirection.counterclockwise)
      {
        marginNames.reverse()
      }

      for (var marginKeyNum in marginNames)
      {
        var marginKey = marginNames[marginKeyNum]

        regionMarginStrings.push(regionMarginStringsData[partyID][marginKey])

        if (marginKey == "current" && !currentMapType.getMapSettingValue("pieCurrentSeats"))
        {
          marginTotalsArray.push(0)
        }
        else
        {
          marginTotalsArray.push(marginTotalsData[partyID][marginKey])
        }

        if (marginKey == "safe")
        {
          safeMarginTotalsArray.push(marginTotalsData[partyID][marginKey])
        }
      }
    }
    else
    {
      regionMarginStrings.push(regionMarginStringsData[partyID].safe)
      marginTotalsArray.push(marginTotalsData[partyID].safe)
      safeMarginTotalsArray.push(marginTotalsData[partyID].safe)
    }
  }

  var partyTotals = getPartyTotals()
  var sortedPartyTotalsArray = []
  for (partyNum in fullPartyOrdering)
  {
    sortedPartyTotalsArray.push(partyTotals[fullPartyOrdering[partyNum].partyID] || 0)
    delete partyTotals[fullPartyOrdering[partyNum].partyID]
  }
  var genericPartyOrderingIndex = fullPartyOrdering.findIndex((orderingData) => orderingData.partyID == IndependentGenericParty.getID())
  for (partyTotalNum in partyTotals)
  {
    sortedPartyTotalsArray[genericPartyOrderingIndex] += partyTotals[partyTotalNum]
  }
  totalsPieChart.data.datasets[1].data = sortedPartyTotalsArray

  if (safeMarginTotalsArray.toString() == sortedPartyTotalsArray.toString())
  {
    totalsPieChart.data.datasets[0].hidden = true
    totalsPieChart.data.datasets[0].data = []
  }
  else
  {
    totalsPieChart.data.datasets[0].hidden = false
    totalsPieChart.data.datasets[0].data = marginTotalsArray
  }

  var preloadedData = setupTotalsPieChartDatasets(fullPartyOrdering)
  totalsPieChart.data.datasets[1].backgroundColor = preloadedData.datasets[1].backgroundColor
  totalsPieChart.data.datasets[1].labels = preloadedData.datasets[1].labels
  totalsPieChart.data.datasets[0].backgroundColor = preloadedData.datasets[0].backgroundColor
  totalsPieChart.data.datasets[0].labels = preloadedData.datasets[0].labels

  totalsPieChart.update()

  partyOrdering = fullPartyOrdering // To avoid transitions of colors between dataslices on every date load
}

function insertPartyIntoTotalsPieChartOrdering(partyID, orderingObject)
{
  orderingObject = orderingObject || partyOrdering

  if (orderingObject.some(partyOrderData => partyOrderData.partyID == partyID)) { return }

  var genericOrderingIndex = orderingObject.findIndex(partyOrderData => partyOrderData.partyID == IndependentGenericParty.getID())
  orderingObject.splice(genericOrderingIndex, 0, {partyID: partyID, direction: PieChartDirection.clockwise})
}
