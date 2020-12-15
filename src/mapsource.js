class MapSource
{
  constructor(id, dataURL, regionURL, iconURL, columnMap, candidateNameToPartyIDMap, shortCandidateNameOverride, incumbentChallengerPartyIDs, regionNameToIDMap, ev2016, regionIDToLinkMap, shouldFilterOutDuplicateRows, addDecimalPadding, organizeMapDataFunction, customOpenRegionLinkFunction)
  {
    this.id = id
    this.dataURL = dataURL
    this.regionURL = regionURL
    this.iconURL = iconURL
    this.columnMap = columnMap
    this.candidateNameToPartyIDMap = candidateNameToPartyIDMap
    this.shortCandidateNameOverride = shortCandidateNameOverride
    this.incumbentChallengerPartyIDs = incumbentChallengerPartyIDs
    this.regionNameToIDMap = regionNameToIDMap
    this.ev2016 = ev2016
    this.regionIDToLinkMap = regionIDToLinkMap
    this.shouldFilterOutDuplicateRows = shouldFilterOutDuplicateRows
    this.addDecimalPadding = addDecimalPadding
    this.filterMapDataFunction = organizeMapDataFunction
    this.customOpenRegionLinkFunction = customOpenRegionLinkFunction
  }

  loadMap(reloadCache, onlyAttemptLocalFetch)
  {
    var self = this

    var loadMapPromise = new Promise(async (resolve, reject) => {
      if ((self.rawMapData == null || reloadCache) && (self.dataURL || self.textMapData))
      {
        var textData
        if (self.dataURL)
        {
          textData = await self.loadMapCache(self, reloadCache, onlyAttemptLocalFetch)
        }
        else
        {
          textData = self.textMapData
        }
        if (textData == null) { resolve(false); return }
        self.rawMapData = self.convertCSVToArray(self, textData)
      }

      if (self.rawMapData == null) { resolve(false); return }

      self.mapDates = Object.keys(self.rawMapData)
      for (var dateNum in self.mapDates)
      {
        self.mapDates[dateNum] = parseInt(self.mapDates[dateNum])
      }
      self.mapDates.sort((mapDate1, mapDate2) => (mapDate1-mapDate2))

      self.setDateRange(self)

      var filterMapDataCallback = self.filterMapDataFunction(self.rawMapData, self.mapDates, self.columnMap, self.candidateNameToPartyIDMap, self.incumbentChallengerPartyIDs, self.regionNameToIDMap, self.ev2016, self.shouldFilterOutDuplicateRows)
      self.mapData = filterMapDataCallback.mapData

      if (filterMapDataCallback.candidateNameData != null && self.shortCandidateNameOverride == null)
      {
        self.candidateNameData = filterMapDataCallback.candidateNameData
      }

      resolve(true)
    })

    return loadMapPromise
  }

  loadMapCache(self, reloadCache, onlyAttemptLocalFetch)
  {
    self = self || this

    var fetchMapDataPromise = new Promise(async (resolve, reject) => {
      if (!reloadCache)
      {
        var savedCSVText = await CSVDatabase.fetchCSV(this.id)
        if (savedCSVText != null)
        {
          return resolve(savedCSVText)
        }
        else if (onlyAttemptLocalFetch)
        {
          return resolve()
        }
      }

      $("#loader").show()
      $.get(self.dataURL, null, function(data) {
        $("#loader").hide()

        CSVDatabase.insertCSV(self.id, data)
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
        if (columnSplitStringArray[columnNum].includes("\r"))
        {
          columnSplitStringArray[columnNum] = columnSplitStringArray[columnNum].replace("\r", "")
        }
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

    if (currentModelDate != null && currentModelDate.getTime() != null && currentDateArray.length > 0 && self.columnMap.date in currentDateArray[0])
    {
      finalArray[currentModelDate.getTime()] = currentDateArray.concat()
    }

    return finalArray
  }

  setTextMapData(textData)
  {
    this.textMapData = textData
  }

  getTextMapData()
  {
    return this.textMapData
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
      this.customOpenRegionLinkFunction(this.regionURL, regionID, this.regionIDToLinkMap, modelDate, false)
    }
  }

  openHomepageLink(modelDate)
  {
    if (this.customOpenRegionLinkFunction == undefined)
    {
      if (!this.regionURL) { return }
      window.open(this.regionURL)
    }
    else
    {
      this.customOpenRegionLinkFunction(this.regionURL, null, null, modelDate, true)
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

  getIconURL()
  {
    return this.iconURL
  }

  setIconURL(newIconURL)
  {
    this.iconURL = newIconURL
  }

  getAddDecimalPadding()
  {
    return this.addDecimalPadding
  }

  updateMapData(displayRegionArray, dateToUpdate, resetMapData)
  {
    if (!this.mapData || resetMapData)
    {
      this.mapData = {}
    }
    if (!(dateToUpdate in this.mapData))
    {
      this.mapData[dateToUpdate] = {}
    }
    for (regionID in displayRegionArray)
    {
      var regionData = displayRegionArray[regionID]
      regionData.region = regionID
      this.mapData[dateToUpdate][regionID] = regionData
    }

    this.textMapData = this.convertArrayToCSV(this.mapData, this.columnMap, this.regionNameToIDMap, this.candidateNameToPartyIDMap)
    this.rawMapData = this.convertCSVToArray(this, this.textMapData)
  }

  convertArrayToCSV(mapData, columnMap, regionNameToID, candidateNameToPartyIDs)
  {
    var csvText = ""

    var columnTitles = Object.values(columnMap)
    for (var titleNum in columnTitles)
    {
      csvText += columnTitles[titleNum]
      if (titleNum < columnTitles.length-1)
      {
        csvText += ","
      }
    }
    csvText += "\n"

    var candidateNames = Object.keys(candidateNameToPartyIDs)

    for (var mapDate in mapData)
    {
      var mapDateObject = new Date(parseInt(mapDate))
      var mapDateString = (mapDateObject.getMonth()+1) + "/" + mapDateObject.getDate() + "/" + mapDateObject.getFullYear()
      for (var regionID in mapData[mapDate])
      {
        if (mapData[mapDate][regionID].partyID == TossupParty.getID()) { continue }

        for (var candidateName in candidateNameToPartyIDs)
        {
          for (var columnTitleNum in columnTitles)
          {
            var columnKey = getKeyByValue(columnMap, columnTitles[columnTitleNum])
            switch (columnKey)
            {
              case "date":
              csvText += mapDateString
              break

              case "candidateName":
              csvText += candidateName
              break

              case "percentAdjusted":
              if (candidateNameToPartyIDs[candidateName] == mapData[mapDate][regionID].partyID)
              {
                csvText += mapData[mapDate][regionID].margin
              }
              else
              {
                csvText += 0
              }
              break

              case "region":
              csvText += getKeyByValue(regionNameToID, regionID)
              break
            }

            if (columnTitleNum < columnTitles.length-1)
            {
              csvText += ","
            }
          }

          csvText += "\n"
        }
      }
    }

    csvText = csvText.slice(0, -1)

    var rowCount = csvText.split("\n").length
    if (rowCount == 1)
    {
      var mapDates = Object.keys(mapData)
      var dateToUse = new Date()
      if (mapDates.length > 0)
      {
        dateToUse = new Date(parseInt(mapDates[0]))
      }
      csvText = "date\n" + (dateToUse.getMonth()+1) + "/" + dateToUse.getDate() + "/" + dateToUse.getFullYear()
    }

    return csvText
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

var doubleLinePercentFilterFunction = function(rawMapData, mapDates, columnMap, candidateNameToPartyIDMap, partyIDs, regionNameToID, ev2016, shouldFilterOutDuplicateRows)
{
  var filteredMapData = {}
  var candidateNameData = {}

  for (var dateNum in mapDates)
  {
    var rawDateData = rawMapData[mapDates[dateNum]]
    var filteredDateData = {}

    var currentMapDate = new Date(mapDates[dateNum])

    var regionNames = Object.keys(regionNameToID)
    for (var regionNum in regionNames)
    {
      var regionToFind = regionNames[regionNum]

      var candidateArrayToTest = Object.keys(candidateNameToPartyIDMap)
      if (candidateArrayToTest.includes(currentMapDate.getFullYear().toString()))
      {
        candidateArrayToTest = Object.keys(candidateNameToPartyIDMap[currentMapDate.getFullYear()])
      }

      var mapDataRows = rawDateData.filter(row => {
        return row[columnMap.region] == regionToFind && candidateArrayToTest.includes(row[columnMap.candidateName])
      })

      if (shouldFilterOutDuplicateRows)
      {
        // cuz JHK is stupid for a third time and has duplicate rows sometimes
        mapDataRows = mapDataRows.filter((row1, index, self) =>
          index === self.findIndex((row2) => (
            row1[columnMap.candidateName] === row2[columnMap.candidateName]
          ))
        )
      }

      var marginSum = 0
      if (!(mapDataRows.length > 0) && ev2016)
      {
        marginSum = ev2016[regionNameToID[regionToFind]] == partyIDs.challenger ? -100 : 100
      }

      var incumbentWinChance
      var challengerWinChance

      for (var rowNum in mapDataRows)
      {
        var partyID = candidateNameToPartyIDMap[mapDataRows[rowNum][columnMap.candidateName]]
        if (Object.keys(candidateNameToPartyIDMap).includes(currentMapDate.getFullYear().toString()))
        {
          partyID = candidateNameToPartyIDMap[currentMapDate.getFullYear().toString()][mapDataRows[rowNum][columnMap.candidateName]]
        }

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

      if (marginSum == 0 && ev2016) //cuz JHK is stupid and made pollAvg = 0 if there are no polls with no any other indication of such fact
      {
        marginSum = ev2016[regionNameToID[regionToFind]] == partyIDs.challenger ? -100 : 100
      }

      //cuz JHK is stupid again and used % chances as 100x the size they should be instead of putting them in decimal form like everyone else does it
      challengerWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? challengerWinChance/100 : challengerWinChance
      incumbentWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? incumbentWinChance/100 : incumbentWinChance

      var greaterMarginPartyID = partyIDs.tossup
      if (Math.sign(marginSum) == -1)
      {
        greaterMarginPartyID = partyIDs.challenger
      }
      else if (Math.sign(marginSum) == 1)
      {
        greaterMarginPartyID = partyIDs.incumbent
      }

      filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: Math.abs(marginSum), partyID: greaterMarginPartyID, chanceIncumbent: incumbentWinChance, chanceChallenger: challengerWinChance, partyCandidates: candidateNameToPartyIDMap}
    }

    filteredMapData[mapDates[dateNum]] = filteredDateData
  }

  return {mapData: filteredMapData, candidateNameData: candidateNameData}
}


// Map Source Declarations

const democraticPartyID = DemocraticParty.getID()
const republicanPartyID = RepublicanParty.getID()
const tossupPartyID = TossupParty.getID()

const incumbentChallengerPartyIDs = {incumbent: republicanPartyID, challenger: democraticPartyID, tossup: tossupPartyID}
const partyCandiateLastNames = {"Biden":democraticPartyID, "Trump":republicanPartyID}
const partyCandiateFullNames = {"Joseph R. Biden Jr.":democraticPartyID, "Donald Trump":republicanPartyID}
const partyNamesToIDs = {"democrat":democraticPartyID, "republican":republicanPartyID}

const partyIDToCandidateLastNames = {}
partyIDToCandidateLastNames[democraticPartyID] = "Biden"
partyIDToCandidateLastNames[republicanPartyID] = "Trump"

const electionYearToCandidateData = {
  1976: {"Carter":democraticPartyID, "Ford":republicanPartyID},
  1980: {"Carter":democraticPartyID, "Reagan":republicanPartyID},
  1984: {"Mondale":democraticPartyID, "Reagan":republicanPartyID},
  1988: {"Dukakis":democraticPartyID, "Bush":republicanPartyID},
  1992: {"Clinton":democraticPartyID, "Bush":republicanPartyID},
  1996: {"Clinton":democraticPartyID, "Dole":republicanPartyID},
  2000: {"Gore":democraticPartyID, "Bush":republicanPartyID},
  2004: {"Kerry":democraticPartyID, "Bush":republicanPartyID},
  2008: {"Obama":democraticPartyID, "McCain":republicanPartyID},
  2012: {"Obama":democraticPartyID, "Romney":republicanPartyID},
  2016: {"Clinton":democraticPartyID, "Trump":republicanPartyID},
  2020: {"Biden":democraticPartyID, "Trump":republicanPartyID}
}

const regionNameToIDFiveThirtyEight = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const regionNameToIDJHK = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine CD-1":"ME-D1", "Maine CD-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska CD-1":"NE-D1", "Nebraska CD-2":"NE-D2", "Nebraska CD-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const regionNameToIDCook = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Washington DC":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD":"NE-D2", "Nebraska 3rd CD":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const regionNameToIDHistorical = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME-AL", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE-AL", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD": "NE-D2", "Nebraska 3rd CD":"NE-D3", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
const regionNameToIDCustom = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}

const ev2016 = {"AL":republicanPartyID, "AK":republicanPartyID, "AZ":republicanPartyID, "AR":republicanPartyID, "CA":democraticPartyID, "CO":democraticPartyID, "CT":democraticPartyID, "DE":democraticPartyID, "DC":democraticPartyID, "FL":republicanPartyID, "GA":republicanPartyID, "HI":democraticPartyID, "ID":republicanPartyID, "IL":democraticPartyID, "IN":republicanPartyID, "IA":republicanPartyID, "KS":republicanPartyID, "KY":republicanPartyID, "LA":republicanPartyID, "ME-D1":democraticPartyID, "ME-D2":republicanPartyID, "ME-AL":democraticPartyID, "MD":democraticPartyID, "MA":democraticPartyID, "MI":republicanPartyID, "MN":democraticPartyID, "MS":republicanPartyID, "MO":republicanPartyID, "MT":republicanPartyID, "NE-DrepublicanPartyID":republicanPartyID, "NE-D2":republicanPartyID, "NE-D3":republicanPartyID, "NE-AL":republicanPartyID, "NV":democraticPartyID, "NH":democraticPartyID, "NJ":democraticPartyID, "NM":democraticPartyID, "NY":democraticPartyID, "NC":republicanPartyID, "ND":republicanPartyID, "OH":republicanPartyID, "OK":republicanPartyID, "OR":democraticPartyID, "PA":republicanPartyID, "RI":democraticPartyID, "SC":republicanPartyID, "SD":republicanPartyID, "TN":republicanPartyID, "TX":republicanPartyID, "UT":republicanPartyID, "VT":democraticPartyID, "VA":democraticPartyID, "WA":democraticPartyID, "WV":republicanPartyID, "WI":republicanPartyID, "WY":republicanPartyID}

var FiveThirtyEightPollAverageMapSource = new MapSource(
  "538 Poll Avg",
  "https://projects.fivethirtyeight.com/2020-general-data/presidential_poll_averages_2020.csv",
  "https://projects.fivethirtyeight.com/polls/president-general/",
  "./assets/fivethirtyeight-large.png",
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
  false,
  true,
  doubleLinePercentFilterFunction,
  null
)

var FiveThirtyEightProjectionMapSource = new MapSource(
  "538 Projection",
  "https://projects.fivethirtyeight.com/2020-general-data/presidential_state_toplines_2020.csv",
  "https://projects.fivethirtyeight.com/2020-election-forecast/",
  "./assets/fivethirtyeight-large.png",
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
  false,
  true,
  singleLineMarginFilterFunction,
  null
)

var JHKProjectionMapSource = new MapSource(
  "JHK",
  "https://data.jhkforecasts.com/2020-presidential.csv",
  "https://projects.jhkforecasts.com/presidential-forecast/",
  "./assets/jhk-large.png",
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
  true,
  true,
  doubleLinePercentFilterFunction,
  null
)

var CookProjectionMapSource = new MapSource(
  "Cook Political",
  "https://map.jacksonjude.com/csv-sources/cook/cook-latest.csv",
  "https://map.jacksonjude.com/csv-sources/cook/",
  "./assets/cookpolitical-large.png",
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
  false,
  false,
  singleLineMarginFilterFunction,
  function(regionURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
  {
    if (mapDate == null) { return }
    window.open(regionURL + mapDate.getFullYear() + zeroPadding(mapDate.getMonth()+1) + mapDate.getDate() + ".pdf")
  }
)

var PastElectionResultMapSource = new MapSource(
  "Past Elections",
  "https://map.jacksonjude.com/csv-sources/historical-president.csv",
  "https://en.wikipedia.org/wiki/",
  "./assets/wikipedia-large.png",
  {
    date: "date",
    region: "region",
    percentAdjusted: "voteshare",
    partyCandidateName: "candidate",
    candidateName: "candidate"
  },
  electionYearToCandidateData,
  null,
  incumbentChallengerPartyIDs,
  regionNameToIDHistorical,
  ev2016,
  {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "DC":"the_District_of_Columbia", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME-D1":"Maine", "ME-D2":"Maine", "ME-AL":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE-D1":"Nebraska", "NE-D2":"Nebraska", "NE-D3":"Nebraska", "NE-AL":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"},
  false,
  true,
  doubleLinePercentFilterFunction,
  function(regionURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
  {
    if (mapDate == null) { return }

    var linkToOpen = regionURL + mapDate.getFullYear() + "_United_States_presidential_election"
    if (!shouldOpenHomepage)
    {
      linkToOpen += "_in_" + regionIDToLinkMap[regionID]
    }
    window.open(linkToOpen)
  }
)

var NYTElectionResultsMapSource = new MapSource(
  "2020 Results",
  "https://map.jacksonjude.com/csv-sources/nyt-2020-president-results.csv",
  "https://www.nytimes.com/interactive/2020/11/03/us/elections/results-",
  "./assets/nyt-large.png",
  {
    date: "date",
    region: "region",
    candidateName: "candidate",
    percentAdjusted: "percent"
  },
  partyCandiateLastNames,
  partyIDToCandidateLastNames,
  incumbentChallengerPartyIDs,
  regionNameToIDCustom,
  null,
  {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine", "ME-D2":"maine", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska", "NE-D2":"nebraska", "NE-D3":"nebraska", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"},
  false,
  false,
  doubleLinePercentFilterFunction,
  function(regionURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
  {
    if (mapDate == null) { return }

    var linkToOpen = regionURL
    if (!shouldOpenHomepage)
    {
      linkToOpen += regionIDToLinkMap[regionID] + ".html"
    }
    else
    {
      linkToOpen += "president.html"
    }
    window.open(linkToOpen)
  }
)

var CustomMapSource = new MapSource(
  "Custom",
  null,
  null,
  null,
  {
    date: "date",
    region: "region",
    candidateName: "candidate",
    percentAdjusted: "percent"
  },
  partyCandiateLastNames,
  partyIDToCandidateLastNames,
  incumbentChallengerPartyIDs,
  regionNameToIDCustom,
  null,
  null,
  false,
  true,
  doubleLinePercentFilterFunction,
  null
)

var todayDate = new Date()
CustomMapSource.setTextMapData("date\n" + (todayDate.getMonth()+1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear())

var mapSources = {}
mapSources[FiveThirtyEightPollAverageMapSource.getID()] = FiveThirtyEightPollAverageMapSource
mapSources[FiveThirtyEightProjectionMapSource.getID()] = FiveThirtyEightProjectionMapSource
mapSources[JHKProjectionMapSource.getID()] = JHKProjectionMapSource
mapSources[CookProjectionMapSource.getID()] = CookProjectionMapSource
mapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
mapSources[NYTElectionResultsMapSource.getID()] = NYTElectionResultsMapSource
mapSources[CustomMapSource.getID()] = CustomMapSource

var mapSourceIDs = [FiveThirtyEightPollAverageMapSource.getID(), FiveThirtyEightProjectionMapSource.getID(), JHKProjectionMapSource.getID(), CookProjectionMapSource.getID(), PastElectionResultMapSource.getID(), CustomMapSource.getID()]

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
