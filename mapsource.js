class MapSource
{
  constructor(id, dataURL, regionURL, columnMap, candidateNameToPartyIDMap, shortCandidateNameOverride, incumbentChallengerPartyIDs, regionNameToIDMap, ev2016, regionIDToLinkMap, organizeMapDataFunction, customOpenRegionLinkFunction)
  {
    this.id = id
    this.dataURL = dataURL
    this.regionURL = regionURL
    this.columnMap = columnMap
    this.candidateNameToPartyIDMap = candidateNameToPartyIDMap
    this.shortCandidateNameOverride = shortCandidateNameOverride
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

      var filterMapDataCallback = self.filterMapDataFunction(self.rawMapData, self.mapDates, self.columnMap, self.candidateNameToPartyIDMap, self.incumbentChallengerPartyIDs, self.regionNameToIDMap, self.ev2016)
      self.mapData = filterMapDataCallback.mapData

      if (filterMapDataCallback.candidateNameData != null && self.shortCandidateNameOverride == null)
      {
        self.candidateNameData = filterMapDataCallback.candidateNameData
      }

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

  clearMapData()
  {
    this.rawMapData = null
    this.mapData = null
    this.mapDates = null
    this.startDate = null
    this.endDate = null
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
      this.customOpenRegionLinkFunction(this.regionURL, regionID, this.regionIDToLinkMap, modelDate)
    }
  }

  getID()
  {
    return this.id
  }

  getCandidateNames(date)
  {
    if (this.candidateNameData == null || date == null || this.candidateNameData[date] == null)
    {
      return this.shortCandidateNameOverride
    }
    else
    {
      return this.candidateNameData[date]
    }
  }
}

var singleLineMarginFilterFunction = function(rawMapData, mapDates, columnMap, candidateNameToPartyIDMap, partyIDs, regionNameToID, ev2016)
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

  return {mapData: filteredMapData}
}

var doubleLinePercentFilterFunction = function(rawMapData, mapDates, columnMap, candidateNameToPartyIDMap, partyIDs, regionNameToID, ev2016)
{
  var filteredMapData = {}
  var candidateNameData = {}

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

      var marginSum = mapDataRows.length > 0 ? 0 : (ev2016[regionNameToID[regionToFind]] == partyIDs.challenger ? -100 : 100)
      var incumbentWinChance
      var challengerWinChance

      for (var rowNum in mapDataRows)
      {
        var partyID = candidateNameToPartyIDMap[mapDataRows[rowNum][columnMap.candidateName]]

        if (!(mapDates[dateNum] in candidateNameData))
        {
          candidateNameData[mapDates[dateNum]] = {}
        }
        if (!(partyID in candidateNameData[mapDates[dateNum]]))
        {
          var candidateNameToAdd
          if ("partyCandidateName" in columnMap)
          {
            candidateNameToAdd = mapDataRows[rowNum][columnMap.partyCandidateName]
          }
          else
          {
            candidateNameToAdd = mapDataRows[rowNum][columnMap.candidateName]
          }
          candidateNameData[mapDates[dateNum]][partyID] = candidateNameToAdd
        }

        if (partyID == partyIDs.incumbent)
        {
          marginSum += parseFloat(mapDataRows[rowNum][columnMap.percentAdjusted])
          incumbentWinChance = columnMap.winChance ? mapDataRows[rowNum][columnMap.winChance] : null
        }
        else if (partyID == partyIDs.challenger)
        {
          marginSum -= parseFloat(mapDataRows[rowNum][columnMap.percentAdjusted])
          challengerWinChance = columnMap.winChance ? mapDataRows[rowNum][columnMap.winChance] : null
        }
      }

      if (marginSum == 0) //cuz JHK is stupid and made pollAvg = 0 if there are no polls with no any other indication of such fact
      {
        marginSum = ev2016[regionNameToID[regionToFind]] == partyIDs.challenger ? -100 : 100
      }

      //cuz JHK is stupid again and used % chances as 100x the size they should be instead of putting them in decimal form like everyone else does it
      challengerWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? challengerWinChance/100 : challengerWinChance
      incumbentWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? incumbentWinChance/100 : incumbentWinChance

      filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: Math.abs(marginSum), partyID: (Math.sign(marginSum) == -1 ? partyIDs.challenger : partyIDs.incumbent), chanceIncumbent: incumbentWinChance, chanceChallenger: challengerWinChance, partyCandidates: candidateNameToPartyIDMap}
    }

    filteredMapData[mapDates[dateNum]] = filteredDateData
  }

  return {mapData: filteredMapData, candidateNameData: candidateNameData}
}


// Map Source Declarations

const incumbentChallengerPartyIDs = {incumbent: RepublicanParty.getID(), challenger: DemocraticParty.getID()}
const partyCandiateLastNames = {"Biden":DemocraticParty.getID(), "Trump":RepublicanParty.getID()}
const partyCandiateFullNames = {"Joseph R. Biden Jr.":DemocraticParty.getID(), "Donald Trump":RepublicanParty.getID()}
const partyNamesToIDs = {"democrat":DemocraticParty.getID(), "republican":RepublicanParty.getID()}

const partyIDToCandidateLastNames = {}
partyIDToCandidateLastNames[DemocraticParty.getID()] = "Biden"
partyIDToCandidateLastNames[RepublicanParty.getID()] = "Trump"

const regionNameToIDFiveThirtyEight = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const regionNameToIDJHK = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine CD-1":"ME-D1", "Maine CD-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska CD-1":"NE-D1", "Nebraska CD-2":"NE-D2", "Nebraska CD-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const regionNameToIDCook = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Washington DC":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD":"NE-D2", "Nebraska 3rd CD":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const regionNameToIDHistorical = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME-AL", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE-AL", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD": "NE-D2", "Nebraska 3rd CD":"NE-D3", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}

var democraticPartyID = DemocraticParty.getID()
var republicanPartyID = RepublicanParty.getID()
const ev2016 = {"AL":republicanPartyID, "AK":republicanPartyID, "AZ":republicanPartyID, "AR":republicanPartyID, "CA":democraticPartyID, "CO":democraticPartyID, "CT":democraticPartyID, "DE":democraticPartyID, "DC":democraticPartyID, "FL":republicanPartyID, "GA":republicanPartyID, "HI":democraticPartyID, "ID":republicanPartyID, "IL":democraticPartyID, "IN":republicanPartyID, "IA":republicanPartyID, "KS":republicanPartyID, "KY":republicanPartyID, "LA":republicanPartyID, "ME-DrepublicanPartyID":democraticPartyID, "ME-D2":republicanPartyID, "ME-AL":democraticPartyID, "MD":democraticPartyID, "MA":democraticPartyID, "MI":republicanPartyID, "MN":democraticPartyID, "MS":republicanPartyID, "MO":republicanPartyID, "MT":republicanPartyID, "NE-DrepublicanPartyID":republicanPartyID, "NE-D2":republicanPartyID, "NE-D3":republicanPartyID, "NE-AL":republicanPartyID, "NV":democraticPartyID, "NH":democraticPartyID, "NJ":democraticPartyID, "NM":democraticPartyID, "NY":democraticPartyID, "NC":republicanPartyID, "ND":republicanPartyID, "OH":republicanPartyID, "OK":republicanPartyID, "OR":democraticPartyID, "PA":republicanPartyID, "RI":democraticPartyID, "SC":republicanPartyID, "SD":republicanPartyID, "TN":republicanPartyID, "TX":republicanPartyID, "UT":republicanPartyID, "VT":democraticPartyID, "VA":democraticPartyID, "WA":democraticPartyID, "WV":republicanPartyID, "WI":republicanPartyID, "WY":republicanPartyID}

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
  partyIDToCandidateLastNames,
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
  partyIDToCandidateLastNames,
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
  partyIDToCandidateLastNames,
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
  partyIDToCandidateLastNames,
  incumbentChallengerPartyIDs,
  regionNameToIDCook,
  ev2016,
  null,
  singleLineMarginFilterFunction,
  function(regionURL, regionID, regionIDToLinkMap, mapDate)
  {
    if (mapDate == null) { return }
    window.open(regionURL + mapDate.getFullYear() + zeroPadding(mapDate.getMonth()+1) + mapDate.getDate() + ".pdf")
  }
)

var PastElectionResultMapSource = new MapSource(
  "Past Elections",
  "https://map.jacksonjude.com/historical-president.csv",
  "https://en.wikipedia.org/wiki/",
  {
    date: "date",
    region: "region",
    percentAdjusted: "voteshare",
    partyCandidateName: "candidate",
    candidateName: "party"
  },
  partyNamesToIDs,
  null,
  incumbentChallengerPartyIDs,
  regionNameToIDHistorical,
  ev2016,
  {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "DC":"the_District_of_Columbia", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME-D1":"Maine", "ME-D2":"Maine", "ME-AL":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE-D1":"Nebraska", "NE-D2":"Nebraska", "NE-D3":"Nebraska", "NE-AL":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"},
  doubleLinePercentFilterFunction,
  function(regionURL, regionID, regionIDToLinkMap, mapDate)
  {
    if (mapDate == null) { return }
    window.open(regionURL + mapDate.getFullYear() + "_United_States_presidential_election_in_" + regionIDToLinkMap[regionID])
  }
)

var mapSources = {}
mapSources[FiveThirtyEightPollAverageMapSource.getID()] = FiveThirtyEightPollAverageMapSource
mapSources[FiveThirtyEightProjectionMapSource.getID()] = FiveThirtyEightProjectionMapSource
mapSources[JHKProjectionMapSource.getID()] = JHKProjectionMapSource
mapSources[CookProjectionMapSource.getID()] = CookProjectionMapSource
mapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource

var mapSourceIDs = [FiveThirtyEightPollAverageMapSource.getID(), FiveThirtyEightProjectionMapSource.getID(), JHKProjectionMapSource.getID(), CookProjectionMapSource.getID(), PastElectionResultMapSource.getID()]

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
