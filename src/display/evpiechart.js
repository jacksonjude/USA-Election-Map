var evPieChart
var regionMarginStrings = []

const kClockwiseDirection = 0
const kCounterclockwiseDirection = 1

const partyOrdering = [
  {partyID: IndependentGenericParty.getID(), direction: kClockwiseDirection},
  {partyID: GreenParty.getID(), direction: kClockwiseDirection},
  {partyID: DemocraticParty.getID(), direction: kClockwiseDirection},
  {partyID: TossupParty.getID(), direction: kClockwiseDirection},
  {partyID: RepublicanParty.getID(), direction: kCounterclockwiseDirection},
  {partyID: LibertarianParty.getID(), direction: kCounterclockwiseDirection}
]

var evPieChartCutoutPercent = 55
const minEVPieChartSliceLabelPercent = 0.03
const minEVPieChartSliceLabelBrightness = 0.7

function setupEVPieChart()
{
  var marginSectionData = []
  var marginSectionBackgroundColors = []
  var marginSectionLabels = []

  var partySectionData = []
  var partySectionBackgroundColors = []
  var partySectionLabels = []

  for (var partyNum in partyOrdering)
  {
    var partyID = partyOrdering[partyNum].partyID
    if (partyID != TossupParty.getID())
    {
      var marginNames = Object.keys(cloneObject(politicalParties[partyID].getMarginNames()))
      if (partyOrdering[partyNum].direction == kClockwiseDirection) {}
      else if (partyOrdering[partyNum].direction == kCounterclockwiseDirection)
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
          var evSum = 0
          for (var dataNum in context.dataset.data)
          {
            evSum += context.dataset.data[dataNum]
          }
          return (value == 0 || value < Math.floor(minEVPieChartSliceLabelPercent*evSum)) ? "rgb(0, 0, 0, 0)" : "#fff"
        },
        font: {
          family: "Bree5erif-Mono",
          size: Math.round(24*$(window).width()/1800),
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
  var marginTotalsData = {} // TODO: Fix hardcoding of two parties for pie chart; Use object for marginTotals, etc
  var regionMarginStringsData = {}

  for (var partyNum in partyOrdering)
  {
    let partyID = partyOrdering[partyNum].partyID

    marginTotalsData[partyID] = {}
    regionMarginStringsData[partyID] = {}

    if (partyID != TossupParty.getID())
    {
      for (let marginKey in politicalParties[partyID].getMarginNames())
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

  for (var regionID in displayRegionDataArray)
  {
    var regionParty = displayRegionDataArray[regionID].partyID
    var regionMargin = displayRegionDataArray[regionID].margin

    var regionEV = currentMapType.getEV(getCurrentDecade(), regionID)
    var regionString = regionID + " +" + decimalPadding(Math.round(regionMargin*10)/10, currentMapSource.getAddDecimalPadding())

    var pieChartIndex
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
  for (partyNum in partyOrdering)
  {
    var partyID = partyOrdering[partyNum].partyID
    if (partyID != TossupParty.getID())
    {
      var marginNames = Object.keys(cloneObject(politicalParties[partyID].getMarginNames()))
      if (partyOrdering[partyNum].direction == kClockwiseDirection) {}
      else if (partyOrdering[partyNum].direction == kCounterclockwiseDirection)
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
  for (partyNum in partyOrdering)
  {
    sortedPartyTotalsArray.push(partyTotals[partyOrdering[partyNum].partyID])
  }
  evPieChart.data.datasets[1].data = sortedPartyTotalsArray

  if (safeMarginTotalsArray.toString() == sortedPartyTotalsArray.toString())
  {
    evPieChart.data.datasets[0].hidden = true
    evPieChart.data.datasets[0].data = []
  }
  else
  {
    evPieChart.data.datasets[0].hidden = false
    evPieChart.data.datasets[0].data = marginTotalsArray
  }

  evPieChart.update()
}
