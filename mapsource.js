class MapSource
{
  constructor(id, dataURL, regionURL, columnMap, candidateNameToPartyIDMap, incumbentChallengerPartyNumbers, incumbentChallengerPartyIDs, regionNameToIDMap, ev2016, regionIDToLinkMap, organizeMapDataFunction, customOpenRegionLinkFunction)
  {
    this.id = id
    this.dataURL = dataURL
    this.regionURL = regionURL
    this.columnMap = columnMap
    this.candidateNameToPartyIDMap = candidateNameToPartyIDMap
    this.incumbentChallengerPartyNumbers = incumbentChallengerPartyNumbers
    this.incumbentChallengerPartyIDs = incumbentChallengerPartyIDs
    this.regionNameToIDMap = regionNameToIDMap
    this.ev2016 = ev2016
    this.regionIDToLinkMap = regionIDToLinkMap
    this.filterMapDataFunction = organizeMapDataFunction
    this.customOpenRegionLinkFunction = customOpenRegionLinkFunction
  }

  loadMap(reloadCache)
  {
    var self = this

    var loadMapPromise = new Promise(async (resolve, reject) => {
      if (self.rawMapData == null || reloadCache)
      {
        var data = await self.loadMapCache(self)
        if (data == null) { resolve(false); return }
        self.rawMapData = self.convertCSVToArray(self, data)
      }

      self.mapDates = Object.keys(self.rawMapData)
      for (var dateNum in self.mapDates)
      {
        self.mapDates[dateNum] = parseInt(self.mapDates[dateNum])
      }
      self.mapDates.sort((mapDate1, mapDate2) => (mapDate1-mapDate2))

      self.setDateRange(self)
      self.mapData = self.filterMapDataFunction(self.rawMapData, self.mapDates, self.columnMap, self.candidateNameToPartyIDMap, self.incumbentChallengerPartyNumbers, self.incumbentChallengerPartyIDs, self.regionNameToIDMap, self.ev2016)

      resolve(true)
    })

    return loadMapPromise
  }

  loadMapCache(self)
  {
    self = self || this

    var fetchMapDataPromise = new Promise((resolve, reject) => {
      $("#loader").show()
      $.get(self.dataURL, null, function(data) {
        $("#loader").hide()
        resolve(data)
      }).fail(function() {
        $("#loader").hide()
        resolve(null)
      })
    })

    return fetchMapDataPromise
  }

  convertCSVToArray(self, strData)
  {
    var finalArray = {}
    var currentModelDate
    var currentDateArray = []

    const columnDelimiter = ","
    const rowDelimiter = "\n"

    var rowSplitStringArray = strData.split(rowDelimiter)
    var fieldKeys = []
    var previousDate
    var dateChangeCount = 0
    for (var rowNum in rowSplitStringArray)
    {
      var rowDataArray = {}
      var columnSplitStringArray = rowSplitStringArray[rowNum].split(columnDelimiter)
      for (var columnNum in columnSplitStringArray)
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
        var rowModelDate = new Date(rowDataArray[self.columnMap.date])

        if (currentModelDate == null)
        {
          currentModelDate = rowModelDate
        }
        else if (currentModelDate.getTime() != rowModelDate.getTime())
        {
          finalArray[currentModelDate.getTime()] = currentDateArray.concat()
          currentDateArray = []
          currentModelDate = rowModelDate
        }

        currentDateArray.push(rowDataArray)
      }
    }

    if (currentModelDate.getTime() != null && currentDateArray.length > 0 && self.columnMap.date in currentDateArray[0])
    {
      finalArray[currentModelDate.getTime()] = currentDateArray.concat()
    }

    return finalArray
  }

  getMapData()
  {
    return this.mapData
  }

  setDateRange(self)
  {
    self.startDate = new Date(self.mapDates[0])
    self.endDate = new Date(self.mapDates[self.mapDates.length-1])
  }

  getDateRange()
  {
    return {start: this.startDate, end: this.endDate}
  }

  getMapDates()
  {
    return this.mapDates
  }

  getRegionData(modelDate, regionID)
  {
    return this.mapData[modelDate][regionID]
  }

  openRegionLink(regionID, modelDate)
  {
    if (this.customOpenRegionLinkFunction == undefined)
    {
      if (!this.regionURL) { return }
      window.open(this.regionURL + this.regionIDToLinkMap[regionID])
    }
    else
    {
      this.customOpenRegionLinkFunction(this.regionURL, regionID, modelDate)
    }
  }

  getID()
  {
    return this.id
  }
}

var singleLineMarginFilterFunction = function(rawMapData, mapDates, columnMap, candidateNameToPartyIDMap, partyNumbers, partyIDs, regionNameToID, ev2016)
{
  var filteredMapData = {}

  for (var dateNum in mapDates)
  {
    var rawDateData = rawMapData[mapDates[dateNum]]
    var filteredDateData = {}

    var regionNames = Object.keys(regionNameToID)
    for (var regionNum in regionNames)
    {
      var regionToFind = regionNames[regionNum]
      var regionRow = rawDateData.find(row => (row[columnMap.region] == regionToFind))

      var margin = columnMap.margin ? parseFloat(regionRow[columnMap.margin]) : null

      if (margin == null)
      {
        margin = parseFloat(regionRow[columnMap.percentIncumbent]) - parseFloat(regionRow[columnMap.percentChallenger])
      }

      var winChance = columnMap.winChance ? parseFloat(regionRow[columnMap.winChance]) : null

      var incumbentWinChance
      var challengerWinChance

      if (winChance)
      {
        if (Math.sign(margin) == -1)
        {
          challengerWinChance = winChance
          incumbentWinChance = 100-winChance
        }
        else
        {
          challengerWinChance = 100-winChance
          incumbentWinChance = winChance
        }
      }
      else
      {
        incumbentWinChance = columnMap.incumbentWinChance ? regionRow[columnMap.incumbentWinChance] : null
        challengerWinChance = columnMap.challengerWinChance ? regionRow[columnMap.challengerWinChance] : null
      }

      filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: Math.abs(margin), partyID: (Math.sign(margin) == 0 ? null : (Math.sign(margin) == -1 ? partyIDs.challenger : partyIDs.incumbent)), chanceIncumbent: incumbentWinChance, chanceChallenger: challengerWinChance}
    }

    filteredMapData[mapDates[dateNum]] = filteredDateData
  }

  return filteredMapData
}

var doubleLinePercentFilterFunction = function(rawMapData, mapDates, columnMap, candidateNameToPartyIDMap, partyNumbers, partyIDs, regionNameToID, ev2016)
{
  var filteredMapData = {}

  for (var dateNum in mapDates)
  {
    var rawDateData = rawMapData[mapDates[dateNum]]
    var filteredDateData = {}

    var regionNames = Object.keys(regionNameToID)
    for (var regionNum in regionNames)
    {
      var regionToFind = regionNames[regionNum]
      var mapDataRows = rawDateData.filter(row => {
        return row[columnMap.region] == regionToFind && Object.keys(candidateNameToPartyIDMap).includes(row[columnMap.candidateName])
      })

      // cuz JHK is stupid for a third time and has duplicate rows sometimes
      mapDataRows = mapDataRows.filter((row1, index, self) =>
        index === self.findIndex((row2) => (
          row1[columnMap.candidateName] === row2[columnMap.candidateName]
        ))
      )

      var marginSum = mapDataRows.length > 0 ? 0 : (ev2016[regionNameToID[regionToFind]] == partyNumbers.challenger ? -100 : 100)
      var incumbentWinChance
      var challengerWinChance

      for (var rowNum in mapDataRows)
      {
        var partyNumber = candidateNameToPartyIDMap[mapDataRows[rowNum][columnMap.candidateName]]
        if (partyNumber == partyNumbers.incumbent)
        {
          marginSum += parseFloat(mapDataRows[rowNum][columnMap.percentAdjusted])
          incumbentWinChance = columnMap.winChance ? mapDataRows[rowNum][columnMap.winChance] : null
        }
        else if (partyNumber == partyNumbers.challenger)
        {
          marginSum -= parseFloat(mapDataRows[rowNum][columnMap.percentAdjusted])
          challengerWinChance = columnMap.winChance ? mapDataRows[rowNum][columnMap.winChance] : null
        }
      }

      if (marginSum == 0) //cuz JHK is stupid and made pollAvg = 0 if there are no polls with no any other indication of such fact
      {
        marginSum = ev2016[regionNameToID[regionToFind]] == partyNumbers.challenger ? -100 : 100
      }

      //cuz JHK is stupid again and used % chances as 100x the size they should be instead of putting them in decimal form like everyone else does it
      challengerWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? challengerWinChance/100 : challengerWinChance
      incumbentWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? incumbentWinChance/100 : incumbentWinChance

      filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: Math.abs(marginSum), partyID: (Math.sign(marginSum) == -1 ? partyIDs.challenger : partyIDs.incumbent), chanceIncumbent: incumbentWinChance, chanceChallenger: challengerWinChance}
    }

    filteredMapData[mapDates[dateNum]] = filteredDateData
  }

  return filteredMapData
}


// Map Source Declarations

const incumbentChallengerPartyNumbers = {incumbent: 1, challenger: 0} //TODO: remove incumbentChallengerPartyNumbers (some hardcoding still)
const incumbentChallengerPartyIDs = {incumbent: RepublicanParty.getID(), challenger: DemocraticParty.getID()}
const partyCandiateLastNames = {"Biden":0, "Trump":1}
const partyCandiateFullNames = {"Joseph R. Biden Jr.":0, "Donald Trump":1}

const regionNameToIDFiveThirtyEight = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const regionNameToIDJHK = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine CD-1":"ME-D1", "Maine CD-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska CD-1":"NE-D1", "Nebraska CD-2":"NE-D2", "Nebraska CD-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const regionNameToIDCook = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Washington DC":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD":"NE-D2", "Nebraska 3rd CD":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const ev2016 = {"AL":1, "AK":1, "AZ":1, "AR":1, "CA":0, "CO":0, "CT":0, "DE":0, "DC":0, "FL":1, "GA":1, "HI":0, "ID":1, "IL":0, "IN":1, "IA":1, "KS":1, "KY":1, "LA":1, "ME-D1":0, "ME-D2":1, "ME-AL":0, "MD":0, "MA":0, "MI":1, "MN":0, "MS":1, "MO":1, "MT":1, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":1, "NV":0, "NH":0, "NJ":0, "NM":0, "NY":0, "NC":1, "ND":1, "OH":1, "OK":1, "OR":0, "PA":1, "RI":0, "SC":1, "SD":1, "TN":1, "TX":1, "UT":1, "VT":0, "VA":0, "WA":0, "WV":1, "WI":1, "WY":1}

var FiveThirtyEightPollAverageMapSource = new MapSource(
  "538 Poll Avg",
  "https://projects.fivethirtyeight.com/2020-general-data/presidential_poll_averages_2020.csv",
  "https://projects.fivethirtyeight.com/polls/president-general/",
  {
    date: "modeldate",
    region: "state",
    candidateName: "candidate_name",
    percentAdjusted: "pct_trend_adjusted"
  },
  partyCandiateFullNames,
  incumbentChallengerPartyNumbers,
  incumbentChallengerPartyIDs,
  regionNameToIDFiveThirtyEight,
  ev2016,
  {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine/1", "ME-D2":"maine/2", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska/1", "NE-D2":"nebraska/2", "NE-D3":"nebraska/3", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"},
  doubleLinePercentFilterFunction
)

var FiveThirtyEightProjectionMapSource = new MapSource(
  "538 Projection",
  "https://projects.fivethirtyeight.com/2020-general-data/presidential_state_toplines_2020.csv",
  "https://projects.fivethirtyeight.com/2020-election-forecast/",
  {
    date: "modeldate",
    region: "state",
    margin: "margin",
    incumbentWinChance: "winstate_inc",
    challengerWinChance: "winstate_chal"
  },
  partyCandiateLastNames,
  incumbentChallengerPartyNumbers,
  incumbentChallengerPartyIDs,
  regionNameToIDFiveThirtyEight,
  ev2016,
  {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine-1", "ME-D2":"maine-2", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska-1", "NE-D2":"nebraska-2", "NE-D3":"nebraska-3", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"},
  singleLineMarginFilterFunction
)

var JHKProjectionMapSource = new MapSource(
  "JHK",
  "https://data.jhkforecasts.com/2020-presidential.csv",
  "https://projects.jhkforecasts.com/presidential-forecast/",
  {
    date: "forecastDate",
    region: "state",
    candidateName: "candidate",
    percentAdjusted: "vote",
    winChance: "win",
  },
  partyCandiateFullNames,
  incumbentChallengerPartyNumbers,
  incumbentChallengerPartyIDs,
  regionNameToIDJHK,
  ev2016,
  {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine-cd-1", "ME-D2":"maine-cd-2", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska-cd-1", "NE-D2":"nebraska-cd-2", "NE-D3":"nebraska-cd-3", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"},
  doubleLinePercentFilterFunction
)

var CookProjectionMapSource = new MapSource(
  "Cook",
  "https://map.jacksonjude.com/cook/cook-latest.csv",
  "https://map.jacksonjude.com/cook/",
  {
    date: "date",
    region: "region",
    margin: "margin"
  },
  partyCandiateLastNames,
  incumbentChallengerPartyNumbers,
  incumbentChallengerPartyIDs,
  regionNameToIDCook,
  ev2016,
  null,
  singleLineMarginFilterFunction,
  function(regionURL, regionID, mapDate)
  {
    if (mapDate == null) { return }
    window.open(regionURL + mapDate.getFullYear() + zeroPadding(mapDate.getMonth()+1) + mapDate.getDate() + ".pdf")
  }
)

// var PastElectionResultMapSource = new MapSource(
//   "Past Election",
//   "https://map.jacksonjude.com/historical-president.csv",
//   "https://en.wikipedia.org/wiki/",
//   {
//     date: "date",
//     region: "region",
//     percentAdjusted: "voteshare",
//     party: "party",
//     candidateName: "candidate"
//   },
//
// )

var mapSources = {}
mapSources[FiveThirtyEightPollAverageMapSource.getID()] = FiveThirtyEightPollAverageMapSource
mapSources[FiveThirtyEightProjectionMapSource.getID()] = FiveThirtyEightProjectionMapSource
mapSources[JHKProjectionMapSource.getID()] = JHKProjectionMapSource
mapSources[CookProjectionMapSource.getID()] = CookProjectionMapSource

var mapSourceIDs = [FiveThirtyEightPollAverageMapSource.getID(), FiveThirtyEightProjectionMapSource.getID(), JHKProjectionMapSource.getID(), CookProjectionMapSource.getID()]

// Not implementing Economist bc data csv is not very useful (only shows current date)
// var EconomistProjectionMapSource = new MapSource(
//   "EconomistProjection",
//   "https://cdn.economistdatateam.com/us-2020-forecast/data/president/state_averages_and_predictions_topline.csv",
//   "https://projects.economist.com/us-2020-forecast/president/",
// ...
// )

// Map source testing
// async function app()
// {
//   await FiveThirtyEightPollAverageMapSource.loadMap()
//   await FiveThirtyEightProjectionMapSource.loadMap()
//   await JHKProjectionMapSource.loadMap()
//   console.log(JHKProjectionMapSource.getMapData())
// }
//
// app()
