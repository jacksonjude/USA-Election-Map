var evPieChart
var regionMarginStrings = []

var evPieChartCutoutPercent = 55
const minEVPieChartSliceLabelValue = 16
const minEVPieChartSliceLabelBrightness = 0.7

var marginPieChartIndexes = {}
marginPieChartIndexes[DemocraticParty.getID()] = ["safe", "likely", "lean", "tilt"]
marginPieChartIndexes[TossupParty.getID()] = [TossupParty.getID()]
marginPieChartIndexes[RepublicanParty.getID()] = ["tilt", "lean", "likely", "safe"]

var marginPartyPieChartOrder = [DemocraticParty.getID(), TossupParty.getID(), RepublicanParty.getID()]

function setupEVPieChart()
{
  // Hardcoding two parties
  var democraticPartyColors = DemocraticParty.getMarginColors()
  var republicanPartyColors = RepublicanParty.getMarginColors()
  var tossupPartyColor = TossupParty.getMarginColors().safe

  var data = {
    datasets: [
      {
        data: [0, 0, 0, 0, 538, 0, 0, 0, 0],
        backgroundColor: [
          democraticPartyColors.safe,
          democraticPartyColors.likely,
          democraticPartyColors.lean,
          democraticPartyColors.tilt,
          tossupPartyColor,
          republicanPartyColors.tilt,
          republicanPartyColors.lean,
          republicanPartyColors.likely,
          republicanPartyColors.safe
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
          democraticPartyColors.safe,
          tossupPartyColor,
          republicanPartyColors.safe
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
  var marginTotals = [] // TODO: Fix hardcoding of two parties for pie chart; Use object for marginTotals, etc
  for (partyIDNum in politicalPartyIDs)
  {
    for (marginNum in politicalParties[politicalPartyIDs[partyIDNum]].getMarginColors())
    {
      marginTotals.push(0)
    }
  }

  regionMarginStrings = []
  for (partyIDNum in politicalPartyIDs)
  {
    for (marginNum in politicalParties[politicalPartyIDs[partyIDNum]].getMarginColors())
    {
      regionMarginStrings.push([])
    }
  }
  regionMarginStrings.push([])

  for (regionID in displayRegionDataArray)
  {
    var regionParty = displayRegionDataArray[regionID].partyID
    var regionMargin = displayRegionDataArray[regionID].margin
    var pieChartIndex
    if (regionParty == null || regionParty == TossupParty.getID())
    {
      pieChartIndex = 0
      for (partyIDNum in marginPartyPieChartOrder)
      {
        if (marginPartyPieChartOrder[partyIDNum] == TossupParty.getID()) { break }
        pieChartIndex += marginPieChartIndexes[marginPartyPieChartOrder[partyIDNum]].length
      }
    }
    else
    {
      pieChartIndex = 0
      for (partyIDNum in marginPartyPieChartOrder)
      {
        if (marginPartyPieChartOrder[partyIDNum] == regionParty) { break }
        pieChartIndex += marginPieChartIndexes[marginPartyPieChartOrder[partyIDNum]].length
      }
      pieChartIndex += marginPieChartIndexes[regionParty].indexOf(getMarginIndexForValue(regionMargin, regionParty))
    }

    marginTotals[pieChartIndex] += regionEVArray[getCurrentDecade()][regionID]
    regionMarginStrings[pieChartIndex].push(regionID + " +" + decimalPadding(Math.round(regionMargin*10)/10, currentMapSource.getAddDecimalPadding()))
  }

  for (regionArrayNum in regionMarginStrings)
  {
    regionMarginStrings[regionArrayNum].sort((marginString1, marginString2) => {
      return parseFloat(marginString1.split("+")[1]) > parseFloat(marginString2.split("+")[1]) ? 1 : -1
    })
  }

  var partyTotals = Object.values(getPartyTotals())
  var evNotTossup = 0
  for (partyTotalNum in partyTotals)
  {
    evNotTossup += partyTotals[partyTotalNum]
  }
  if (partyTotals.length == 0)
  {
    for (partyIDNum in politicalPartyIDs)
    {
      partyTotals.push(0)
    }
  }

  partyTotals = partyTotals.concat().splice(0,Math.ceil(partyTotals.length/2)).concat(partyTotals.concat().splice(Math.ceil(partyTotals.length/2)))
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
