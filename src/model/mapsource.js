class MapSource
{
  constructor(id, name, dataURL, homepageURL, iconURL, columnMap, cycleYear, candidateNameToPartyIDMap, shortCandidateNameOverride, incumbentChallengerPartyIDs, regionNameToIDMap, ev2016, regionIDToLinkMap, shouldFilterOutDuplicateRows, addDecimalPadding, organizeMapDataFunction, customOpenRegionLinkFunction, convertMapDataRowToCSVFunction, isCustomMap, shouldClearDisabled, shouldShowVoteshare, voteshareCutoffMargin, overrideSVGPath)
  {
    this.id = id
    this.name = name
    this.dataURL = dataURL
    this.homepageURL = homepageURL
    this.iconURL = iconURL
    this.columnMap = columnMap
    this.cycleYear = cycleYear
    this.candidateNameToPartyIDMap = candidateNameToPartyIDMap && this.cycleYear ? candidateNameToPartyIDMap[this.cycleYear] : candidateNameToPartyIDMap
    this.shortCandidateNameOverride = shortCandidateNameOverride && this.cycleYear ? shortCandidateNameOverride[this.cycleYear] : shortCandidateNameOverride
    this.incumbentChallengerPartyIDs = incumbentChallengerPartyIDs
    this.regionNameToIDMap = regionNameToIDMap
    this.ev2016 = ev2016
    this.regionIDToLinkMap = regionIDToLinkMap
    this.shouldFilterOutDuplicateRows = shouldFilterOutDuplicateRows
    this.addDecimalPadding = addDecimalPadding
    this.filterMapDataFunction = organizeMapDataFunction
    this.customOpenRegionLinkFunction = customOpenRegionLinkFunction
    this.convertMapDataRowToCSVFunction = convertMapDataRowToCSVFunction
    this.isCustomMap = isCustomMap == null ? false : isCustomMap
    this.shouldClearDisabled = shouldClearDisabled == null ? true : shouldClearDisabled
    this.shouldShowVoteshare = shouldShowVoteshare == null ? false : shouldShowVoteshare
    this.voteshareCutoffMargin = voteshareCutoffMargin
    this.overrideSVGPath = overrideSVGPath
  }

  loadMap(reloadCache, onlyAttemptLocalFetch)
  {
    var self = this

    var loadMapPromise = new Promise(async (resolve, reject) => {
      reloadCache = reloadCache ? true : (self.dataURL ? !(await CSVDatabase.isSourceUpdated(self.id)) : false)

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

      var filterMapDataCallback = self.filterMapDataFunction(self.rawMapData, self.mapDates, self.columnMap, self.cycleYear, self.candidateNameToPartyIDMap, self.incumbentChallengerPartyIDs, self.regionNameToIDMap, self.ev2016, self.shouldFilterOutDuplicateRows, self.isCustomMap, self.voteshareCutoffMargin)
      self.mapData = filterMapDataCallback.mapData

      if (filterMapDataCallback.candidateNameData != null && self.shortCandidateNameOverride == null)
      {
        self.candidateNameData = filterMapDataCallback.candidateNameData
      }
      if (filterMapDataCallback.mapDates != null)
      {
        self.mapDates = filterMapDataCallback.mapDates
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

  setTextMapData(textData, self)
  {
    self = self || this
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

  resetMapData()
  {
    this.rawMapData = null
    this.mapData = null
    this.mapDates = null
    this.startDate = null
    this.endDate = null
  }

  clearMapData(shouldFullClear)
  {
    shouldFullClear = shouldFullClear == null ? false : shouldFullClear

    var mapIsClearExceptDisabled = true

    for (var mapDate in this.mapData)
    {
      for (var regionID in this.mapData[mapDate])
      {
        if (!this.mapData[mapDate][regionID].disabled && this.mapData[mapDate][regionID].partyID != TossupParty.getID())
        {
          this.mapData[mapDate][regionID].partyID = TossupParty.getID()
          this.mapData[mapDate][regionID].margin = 0

          mapIsClearExceptDisabled = false
        }
      }
    }

    this.textMapData = this.convertArrayToCSV(this.mapData, this.columnMap, this.regionNameToIDMap, this.candidateNameToPartyIDMap, this.convertMapDataRowToCSVFunction)
    this.rawMapData = this.convertCSVToArray(this, this.textMapData)

    if (this.shouldClearDisabled || mapIsClearExceptDisabled || shouldFullClear)
    {
      this.setTextMapData("date\n" + getTodayString(), this)
      this.setIconURL("", this)
      this.setCandidateNames(null, null, this)
    }
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
      if (!this.homepageURL) { return }
      window.open(this.homepageURL + this.regionIDToLinkMap[regionID])
    }
    else
    {
      this.customOpenRegionLinkFunction(this.homepageURL, regionID, this.regionIDToLinkMap, modelDate, false, this.mapData)
    }
  }

  openHomepageLink(modelDate)
  {
    if (this.customOpenRegionLinkFunction == undefined)
    {
      if (!this.homepageURL) { return }
      window.open(this.homepageURL)
    }
    else
    {
      this.customOpenRegionLinkFunction(this.homepageURL, null, null, modelDate, true, this.mapData)
    }
  }

  getID()
  {
    return this.id
  }

  getName()
  {
    return this.name
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

  setCandidateNames(shortNameOverride, shouldResetCandidateNameData, self)
  {
    self = self || this
    if (shortNameOverride)
    {
      this.defaultShortCandidateNameOverride = cloneObject(this.shortCandidateNameOverride)
      this.shortCandidateNameOverride = shortNameOverride
    }
    else if (this.defaultShortCandidateNameOverride)
    {
      this.shortCandidateNameOverride = cloneObject(this.defaultShortCandidateNameOverride)
    }

    if (shouldResetCandidateNameData == true)
    {
      this.candidateNameData = null
    }
  }

  getIconURL()
  {
    return this.iconURL
  }

  setIconURL(newIconURL, self)
  {
    self = self || this
    this.iconURL = newIconURL
  }

  getAddDecimalPadding()
  {
    return this.addDecimalPadding
  }

  getShouldShowVoteshare()
  {
    return this.shouldShowVoteshare
  }

  getOverrideSVGPath()
  {
    return this.overrideSVGPath
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
    for (var regionID in displayRegionArray)
    {
      var regionData = displayRegionArray[regionID]
      regionData.region = regionID

      if (this.mapData[dateToUpdate][regionID] == null)
      {
        this.mapData[dateToUpdate][regionID] = {}
      }
      for (var key in regionData)
      {
        this.mapData[dateToUpdate][regionID][key] = regionData[key]
      }
    }

    this.textMapData = this.convertArrayToCSV(this.mapData, this.columnMap, this.regionNameToIDMap, this.candidateNameToPartyIDMap, this.convertMapDataRowToCSVFunction)
    this.rawMapData = this.convertCSVToArray(this, this.textMapData)
  }

  convertArrayToCSV(mapData, columnMap, regionNameToID, candidateNameToPartyIDs, convertMapDataRowToCSVFunction) // TODO: Make usable for senate too
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
        //if (mapData[mapDate][regionID].partyID == TossupParty.getID()) { continue }

        for (var candidateName in candidateNameToPartyIDs)
        {
          for (var columnTitleNum in columnTitles)
          {
            var regionData = mapData[mapDate][regionID]
            var columnTitle = columnTitles[columnTitleNum]
            csvText += convertMapDataRowToCSVFunction(columnMap, columnTitle, mapDateString, candidateName, candidateNameToPartyIDs, regionData, regionID, regionNameToID)

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
      var mapDates = []
      if (mapData)
      {
        mapDates = Object.keys(mapData)
      }
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


// Map Source Declarations

const democraticPartyID = DemocraticParty.getID()
const republicanPartyID = RepublicanParty.getID()
const tossupPartyID = TossupParty.getID()

const reformPartyID = ReformParty.getID()
const greenPartyID = GreenParty.getID()
const libertarianPartyID = LibertarianParty.getID()

const independentRNPartyID = IndependentRNParty.getID()

const independent2016EMPartyID = Independent2016EMParty.getID()
const independent1980JAPartyID = Independent1980JAParty.getID()
const independent1976EMPartyID = Independent1976EMParty.getID()
const independent1968GWPartyID = Independent1968GWParty.getID()
const independent1948SMPartyID = Independent1948SMParty.getID()
const independent1948GWPartyID = Independent1948GWParty.getID()
const independent1932NTPartyID = Independent1932NTParty.getID()
const independent1924RLPartyID = Independent1924RLParty.getID()
const independent1920EDPartyID = Independent1920EDParty.getID()
const independent1916ABPartyID = Independent1916ABParty.getID()
const independent1912TRPartyID = Independent1912TRParty.getID()
const independent1912EDPartyID = Independent1912EDParty.getID()

const independentGenericPartyID = IndependentGenericParty.getID()

const incumbentChallengerPartyIDs = {incumbent: republicanPartyID, challenger: democraticPartyID, tossup: tossupPartyID}
const partyCandiateLastNames = {2020: {"Biden":democraticPartyID, "Trump":republicanPartyID}}
const partyCandiateFullNames = {2020: {"Joseph R. Biden Jr.":democraticPartyID, "Donald Trump":republicanPartyID}}
const partyNamesToIDs = {2020: {"democrat":democraticPartyID, "republican":republicanPartyID}}

const partyIDToCandidateLastNames = {2020: {}}
partyIDToCandidateLastNames[2020][democraticPartyID] = "Biden"
partyIDToCandidateLastNames[2020][republicanPartyID] = "Trump"

const currentCycleYear = 2020

function createPresidentialMapSources()
{
  var singleLineMarginFilterFunction = function(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, partyIDs, regionNameToID, ev2016)
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

        if (margin == null && columnMap.percentIncumbent && columnMap.percentChallenger)
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

        var greaterMarginPartyID = (Math.sign(margin) == 0 ? null : (Math.sign(margin) == -1 ? partyIDs.challenger : partyIDs.incumbent))

        var partyIDToCandidateNames = {}
        for (var partyCandidateName in candidateNameToPartyIDMap)
        {
          partyIDToCandidateNames[candidateNameToPartyIDMap[partyCandidateName]] = partyCandidateName
        }

        filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: Math.abs(margin), partyID: greaterMarginPartyID, candidateName: partyIDToCandidateLastNames[cycleYear][greaterMarginPartyID], candidateMap: partyIDToCandidateNames, chanceIncumbent: incumbentWinChance, chanceChallenger: challengerWinChance}
      }

      filteredMapData[mapDates[dateNum]] = filteredDateData
    }

    return {mapData: filteredMapData}
  }

  var doubleLinePercentFilterFunction = function(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, partyIDs, regionNameToID, ev2016, shouldFilterOutDuplicateRows)
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

        var isMultipleElections = false
        var candidateArrayToTest = Object.keys(candidateNameToPartyIDMap)
        if (candidateArrayToTest.includes(currentMapDate.getFullYear().toString()))
        {
          isMultipleElections = true
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
        if (mapDataRows.length <= 0 && ev2016)
        {
          marginSum = ev2016[regionNameToID[regionToFind]] == partyIDs.challenger ? -100 : 100
        }

        var incumbentWinChance
        var challengerWinChance

        var partyVotesharePercentages = null

        for (var rowNum in mapDataRows)
        {
          var partyID = candidateNameToPartyIDMap[mapDataRows[rowNum][columnMap.candidateName]]
          if (Object.keys(candidateNameToPartyIDMap).includes(currentMapDate.getFullYear().toString()))
          {
            partyID = candidateNameToPartyIDMap[currentMapDate.getFullYear().toString()][mapDataRows[rowNum][columnMap.candidateName]]
          }

          if (isMultipleElections && mapDataRows[rowNum][columnMap.percentAdjusted] >= 1)
          {
            if (partyVotesharePercentages == null)
            {
              partyVotesharePercentages = []
            }
            partyVotesharePercentages.push({partyID: partyID, candidate: mapDataRows[rowNum][columnMap.candidateName], voteshare: mapDataRows[rowNum][columnMap.percentAdjusted]})
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

        // if (marginSum == 0 && ev2016) //cuz JHK is stupid and made pollAvg = 0 if there are no polls with no any other indication of such fact
        // {
        //   marginSum = ev2016[regionNameToID[regionToFind]] == partyIDs.challenger ? -100 : 100
        // }

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

        var compactPartyVotesharePercentages
        if (partyVotesharePercentages && marginSum != 0)
        {
          compactPartyVotesharePercentages = []
          partyVotesharePercentages.forEach(voteData => {
            var compactVoteDataIndex
            var compactVoteData = compactPartyVotesharePercentages.find((compactVoteData, index) => {
              if (compactVoteData.candidate == voteData.candidate)
              {
                compactVoteDataIndex = index
                return true
              }
              return false
            })
            if (compactVoteData)
            {
              compactVoteData.voteshare = parseInt(compactVoteData.voteshare)+parseInt(voteData.voteshare)
              compactPartyVotesharePercentages[compactVoteDataIndex] = compactVoteData
            }
            else
            {
              compactPartyVotesharePercentages.push(voteData)
            }
          })

          compactPartyVotesharePercentages.sort((voteData1, voteData2) => {
            return voteData2.voteshare - voteData1.voteshare
          })

          marginSum = compactPartyVotesharePercentages[0].voteshare - (compactPartyVotesharePercentages[1] || {voteshare: 0.0}).voteshare
          greaterMarginPartyID = compactPartyVotesharePercentages[0].partyID
        }

        var candidateName
        var candidateNameArray = electionYearToCandidateData[cycleYear || currentMapDate.getFullYear().toString()]
        if (candidateNameArray)
        {
          candidateName = getKeyByValue(candidateNameArray, greaterMarginPartyID)
        }

        var partyIDToCandidateNames = {}
        for (var partyCandidateName in candidateNameToPartyIDMap)
        {
          partyIDToCandidateNames[candidateNameToPartyIDMap[partyCandidateName]] = partyCandidateName
        }

        filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: Math.abs(marginSum), partyID: greaterMarginPartyID, candidateName: candidateName, candidateMap: partyIDToCandidateNames, chanceIncumbent: incumbentWinChance, chanceChallenger: challengerWinChance, partyVotesharePercentages: compactPartyVotesharePercentages}
      }

      filteredMapData[mapDates[dateNum]] = filteredDateData
    }

    return {mapData: filteredMapData, candidateNameData: candidateNameData}
  }

  var doubleLinePercentCopyFunction = function(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, partyIDs)
  {
    var filteredMapData = {}
    var candidateNameData = {}

    for (var dateNum in mapDates)
    {
      var rawDateData = rawMapData[mapDates[dateNum]]
      var filteredDateData = {}

      var currentMapDate = new Date(mapDates[dateNum])

      var candidateArrayToTest = Object.keys(candidateNameToPartyIDMap)
      if (candidateArrayToTest.includes(currentMapDate.getFullYear().toString()))
      {
        candidateArrayToTest = Object.keys(candidateNameToPartyIDMap[currentMapDate.getFullYear()])
      }

      for (var rowNum in rawDateData)
      {
        var rowData = rawDateData[rowNum]

        if (!candidateArrayToTest.includes(rowData[columnMap.candidateName]))
        {
          continue
        }

        var regionID = rowData[columnMap.region]

        var regionDataToFill = {region: regionID, margin: 0, partyID: tossupPartyID, chanceIncumbent: null, chanceChallenger: null, partyCandidates: candidateNameToPartyIDMap}
        if (regionID in filteredDateData)
        {
          regionDataToFill = filteredDateData[regionID]
        }

        var partyID = candidateNameToPartyIDMap[rowData[columnMap.candidateName]]
        if (Object.keys(candidateNameToPartyIDMap).includes(currentMapDate.getFullYear().toString()))
        {
          partyID = candidateNameToPartyIDMap[currentMapDate.getFullYear().toString()][rowData[columnMap.candidateName]]
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
            candidateNameToAdd = rowData[columnMap.partyCandidateName]
          }
          else
          {
            candidateNameToAdd = rowData[columnMap.candidateName]
          }
          candidateNameData[mapDates[dateNum]][partyID] = candidateNameToAdd
        }

        if (partyID == partyIDs.incumbent)
        {
          regionDataToFill.margin += parseFloat(rowData[columnMap.percentAdjusted])
        }
        else if (partyID == partyIDs.challenger)
        {
          regionDataToFill.margin -= parseFloat(rowData[columnMap.percentAdjusted])
        }

        var greaterMarginPartyID = partyIDs.tossup
        if (Math.sign(regionDataToFill.margin) == -1)
        {
          greaterMarginPartyID = partyIDs.challenger
        }
        else if (Math.sign(regionDataToFill.margin) == 1)
        {
          greaterMarginPartyID = partyIDs.incumbent
        }
        regionDataToFill.partyID = greaterMarginPartyID

        var candidateName
        var candidateNameArray = electionYearToCandidateData[cycleYear || currentMapDate.getFullYear().toString()]
        if (candidateNameArray)
        {
          candidateName = getKeyByValue(candidateNameArray, greaterMarginPartyID)
        }
        regionDataToFill.candidateName = candidateName

        filteredDateData[regionID] = regionDataToFill
      }

      for (let regionID in filteredDateData)
      {
        filteredDateData[regionID].margin = Math.abs(filteredDateData[regionID].margin)
      }

      filteredMapData[mapDates[dateNum]] = filteredDateData
    }

    return {mapData: filteredMapData, candidateNameData: candidateNameData}
  }

  function customMapConvertMapDataToCSVFunction(columnMap, columnTitle, mapDateString, candidateName, candidateNameToPartyIDs, regionData, regionID, regionNameToID)
  {
    var columnKey = getKeyByValue(columnMap, columnTitle)
    switch (columnKey)
    {
      case "date":
      return mapDateString

      case "candidateName":
      return candidateName

      case "percentAdjusted":
      if (candidateNameToPartyIDs[candidateName] == regionData.partyID)
      {
        return regionData.margin
      }
      return 0

      case "region":
      if (regionNameToID)
      {
        return getKeyByValue(regionNameToID, regionID)
      }
      else
      {
        return regionID
      }
    }
  }

  const electionYearToCandidateData = {
    1912: {"Wilson":democraticPartyID, "Taft":republicanPartyID, "Roosevelt":independent1912TRPartyID, "Debs":independent1912EDPartyID, "Other":independentGenericPartyID},
    1916: {"Wilson":democraticPartyID, "Hughes":republicanPartyID, "Benson":independent1916ABPartyID, "Other":independentGenericPartyID},
    1920: {"Cox":democraticPartyID, "Harding":republicanPartyID, "Debs":independent1920EDPartyID, "Other":independentGenericPartyID},
    1924: {"Davis":democraticPartyID, "Coolidge":republicanPartyID, "La Follette":independent1924RLPartyID, "Other":independentGenericPartyID},
    1928: {"Smith":democraticPartyID, "Hoover":republicanPartyID, "Other":independentGenericPartyID},
    1932: {"Roosevelt":democraticPartyID, "Hoover":republicanPartyID, "Thomas":independent1932NTPartyID, "Other":independentGenericPartyID},
    1936: {"Roosevelt":democraticPartyID, "Landon":republicanPartyID, "Other":independentGenericPartyID},
    1940: {"Roosevelt":democraticPartyID, "Willkie":republicanPartyID, "Other":independentGenericPartyID},
    1944: {"Roosevelt":democraticPartyID, "Dewey":republicanPartyID, "Other":independentGenericPartyID},
    1948: {"Truman":democraticPartyID, "Dewey":republicanPartyID, "Thurmond":independent1948SMPartyID, "Wallace":independent1948GWPartyID, "Other":independentGenericPartyID},
    1952: {"Stevenson":democraticPartyID, "Eisenhower":republicanPartyID, "Other":independentGenericPartyID},
    1956: {"Stevenson":democraticPartyID, "Eisenhower":republicanPartyID, "Other":independentGenericPartyID},
    1960: {"Kennedy":democraticPartyID, "Nixon":republicanPartyID, "Other":independentGenericPartyID},
    1964: {"Johnson":democraticPartyID, "Goldwater":republicanPartyID, "Other":independentGenericPartyID},
    1968: {"Humphrey":democraticPartyID, "Nixon":republicanPartyID, "Wallace":independent1968GWPartyID, "Other":independentGenericPartyID},
    1972: {"McGovern":democraticPartyID, "Nixon":republicanPartyID, "Other":independentGenericPartyID},
    1976: {"Carter":democraticPartyID, "Ford":republicanPartyID, "McCarthy":independent1976EMPartyID},
    1980: {"Carter":democraticPartyID, "Reagan":republicanPartyID, "Anderson":independent1980JAPartyID, "Clark":libertarianPartyID},
    1984: {"Mondale":democraticPartyID, "Reagan":republicanPartyID, "Bergland":libertarianPartyID},
    1988: {"Dukakis":democraticPartyID, "Bush":republicanPartyID, "Paul":libertarianPartyID},
    1992: {"Clinton":democraticPartyID, "Bush":republicanPartyID, "Perot":reformPartyID, "Marrou":libertarianPartyID},
    1996: {"Clinton":democraticPartyID, "Dole":republicanPartyID, "Perot":reformPartyID, "Nader":greenPartyID, "Browne":libertarianPartyID},
    2000: {"Gore":democraticPartyID, "Bush":republicanPartyID, "Nader":greenPartyID, "Buchanan":reformPartyID, "Browne":libertarianPartyID},
    2004: {"Kerry":democraticPartyID, "Bush":republicanPartyID, "Nader":independentRNPartyID, "Badnarik":libertarianPartyID},
    2008: {"Obama":democraticPartyID, "McCain":republicanPartyID, "Nader":independentRNPartyID, "Barr":libertarianPartyID},
    2012: {"Obama":democraticPartyID, "Romney":republicanPartyID, "Johnson":libertarianPartyID, "Stein":greenPartyID},
    2016: {"Clinton":democraticPartyID, "Trump":republicanPartyID, "Johnson":libertarianPartyID, "Stein":greenPartyID, "McMullin":independent2016EMPartyID},
    2020: {"Biden":democraticPartyID, "Trump":republicanPartyID, "Jorgensen":libertarianPartyID, "Hawkins":greenPartyID}
  }

  const ev2016 = {"AL":republicanPartyID, "AK":republicanPartyID, "AZ":republicanPartyID, "AR":republicanPartyID, "CA":democraticPartyID, "CO":democraticPartyID, "CT":democraticPartyID, "DE":democraticPartyID, "DC":democraticPartyID, "FL":republicanPartyID, "GA":republicanPartyID, "HI":democraticPartyID, "ID":republicanPartyID, "IL":democraticPartyID, "IN":republicanPartyID, "IA":republicanPartyID, "KS":republicanPartyID, "KY":republicanPartyID, "LA":republicanPartyID, "ME-D1":democraticPartyID, "ME-D2":republicanPartyID, "ME-AL":democraticPartyID, "MD":democraticPartyID, "MA":democraticPartyID, "MI":republicanPartyID, "MN":democraticPartyID, "MS":republicanPartyID, "MO":republicanPartyID, "MT":republicanPartyID, "NE-DrepublicanPartyID":republicanPartyID, "NE-D2":republicanPartyID, "NE-D3":republicanPartyID, "NE-AL":republicanPartyID, "NV":democraticPartyID, "NH":democraticPartyID, "NJ":democraticPartyID, "NM":democraticPartyID, "NY":democraticPartyID, "NC":republicanPartyID, "ND":republicanPartyID, "OH":republicanPartyID, "OK":republicanPartyID, "OR":democraticPartyID, "PA":republicanPartyID, "RI":democraticPartyID, "SC":republicanPartyID, "SD":republicanPartyID, "TN":republicanPartyID, "TX":republicanPartyID, "UT":republicanPartyID, "VT":democraticPartyID, "VA":democraticPartyID, "WA":democraticPartyID, "WV":republicanPartyID, "WI":republicanPartyID, "WY":republicanPartyID}

  const regionNameToIDFiveThirtyEight = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
  const regionNameToIDJHK = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine CD-1":"ME-D1", "Maine CD-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska CD-1":"NE-D1", "Nebraska CD-2":"NE-D2", "Nebraska CD-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
  const regionNameToIDCook = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Washington DC":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD":"NE-D2", "Nebraska 3rd CD":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
  const regionNameToIDHistorical = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME-AL", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE-AL", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD": "NE-D2", "Nebraska 3rd CD":"NE-D3", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
  const regionNameToIDCustom = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}

  var FiveThirtyEightPollAverageMapSource = new MapSource(
    "538-2020-Presidential-PollAvg",
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
    2020,
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
    "538-2020-Presidential-Projection",
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
    2020,
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
    "JHK-2020-Presidential",
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
    2020,
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
    "Cook-2020-Presidential",
    "Cook Political",
    "https://map.jacksonjude.com/csv-sources/cook-pres-2020/cook-latest.csv",
    "https://map.jacksonjude.com/csv-sources/cook-pres-2020/",
    "./assets/cookpolitical-large.png",
    {
      date: "date",
      region: "region",
      margin: "margin"
    },
    2020,
    partyCandiateLastNames,
    partyIDToCandidateLastNames,
    incumbentChallengerPartyIDs,
    regionNameToIDCook,
    ev2016,
    null,
    false,
    false,
    singleLineMarginFilterFunction,
    function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
    {
      if (mapDate == null) { return }
      window.open(homepageURL + mapDate.getFullYear() + zeroPadding(mapDate.getMonth()+1) + mapDate.getDate() + ".pdf")
    }
  )

  var PastElectionResultMapSource = new MapSource(
    "Past-Presidential-Elections",
    "Past Elections",
    "https://map.jacksonjude.com/csv-sources/past-president.csv",
    //"./csv-sources/past-president.csv",
    "https://en.wikipedia.org/wiki/",
    "./assets/wikipedia-large.png",
    {
      date: "date",
      region: "region",
      percentAdjusted: "voteshare",
      partyCandidateName: "candidate",
      candidateName: "candidate"
    },
    null,
    electionYearToCandidateData,
    null,
    incumbentChallengerPartyIDs,
    regionNameToIDHistorical,
    ev2016,
    {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "DC":"the_District_of_Columbia", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME-D1":"Maine", "ME-D2":"Maine", "ME-AL":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE-D1":"Nebraska", "NE-D2":"Nebraska", "NE-D3":"Nebraska", "NE-AL":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"},
    false,
    true,
    doubleLinePercentFilterFunction,
    function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
    {
      if (mapDate == null) { return }

      var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_presidential_election"
      if (!shouldOpenHomepage)
      {
        linkToOpen += "_in_" + regionIDToLinkMap[regionID]
      }
      window.open(linkToOpen)
    },
    null,
    null,
    null,
    true
  )

  var HistoricalElectionResultMapSource = new MapSource(
    "Historical-Presidential-Elections",
    "Older Elections",
    "https://map.jacksonjude.com/csv-sources/historical-president.csv",
    //"./csv-sources/historical-president.csv",
    "https://en.wikipedia.org/wiki/",
    "./assets/wikipedia-large.png",
    {
      date: "date",
      region: "region",
      percentAdjusted: "voteshare",
      partyCandidateName: "candidate",
      candidateName: "candidate"
    },
    null,
    electionYearToCandidateData,
    null,
    incumbentChallengerPartyIDs,
    regionNameToIDHistorical,
    ev2016,
    {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "DC":"the_District_of_Columbia", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME-D1":"Maine", "ME-D2":"Maine", "ME-AL":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE-D1":"Nebraska", "NE-D2":"Nebraska", "NE-D3":"Nebraska", "NE-AL":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"},
    false,
    true,
    doubleLinePercentFilterFunction,
    function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
    {
      if (mapDate == null) { return }

      var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_presidential_election"
      if (!shouldOpenHomepage)
      {
        linkToOpen += "_in_" + regionIDToLinkMap[regionID]
      }
      window.open(linkToOpen)
    },
    null,
    null,
    null,
    true,
    null,
    "svg-sources/usa-presidential-historical-map.svg"
  )

  var NYTElectionResultsMapSource = new MapSource(
    "2020-Presidential-Results",
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
    2020,
    partyCandiateLastNames,
    partyIDToCandidateLastNames,
    incumbentChallengerPartyIDs,
    regionNameToIDCustom,
    null,
    {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine", "ME-D2":"maine", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska", "NE-D2":"nebraska", "NE-D3":"nebraska", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"},
    false,
    false,
    doubleLinePercentFilterFunction,
    function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
    {
      if (mapDate == null) { return }

      var linkToOpen = homepageURL
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
    "Custom-Presidential",
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
    currentCycleYear, // Needs to be here until all previous presidential candidate names are listed in "partyCandidate/ID" constants
    partyCandiateLastNames,
    partyIDToCandidateLastNames,
    incumbentChallengerPartyIDs,
    regionNameToIDCustom, //null,
    null,
    null,
    false,
    true,
    doubleLinePercentFilterFunction, //doubleLinePercentCopyFunction,
    null,
    customMapConvertMapDataToCSVFunction
  )

  var todayDate = new Date()
  CustomMapSource.setTextMapData("date\n" + (todayDate.getMonth()+1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear())

  var presidentialMapSources = {}
  presidentialMapSources[FiveThirtyEightPollAverageMapSource.getID()] = FiveThirtyEightPollAverageMapSource
  presidentialMapSources[FiveThirtyEightProjectionMapSource.getID()] = FiveThirtyEightProjectionMapSource
  presidentialMapSources[JHKProjectionMapSource.getID()] = JHKProjectionMapSource
  presidentialMapSources[CookProjectionMapSource.getID()] = CookProjectionMapSource
  presidentialMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
  presidentialMapSources[HistoricalElectionResultMapSource.getID()] = HistoricalElectionResultMapSource
  presidentialMapSources[NYTElectionResultsMapSource.getID()] = NYTElectionResultsMapSource
  presidentialMapSources[CustomMapSource.getID()] = CustomMapSource

  var presidentialMapSourceIDs = [FiveThirtyEightPollAverageMapSource.getID(), FiveThirtyEightProjectionMapSource.getID(), CookProjectionMapSource.getID(), PastElectionResultMapSource.getID(), HistoricalElectionResultMapSource.getID()]
  if (USAPresidentialMapType.getCustomMapEnabled())
  {
    presidentialMapSourceIDs.push(CustomMapSource.getID())
  }

  const kPastElectionsVsPastElections = 1
  const kPastElectionsVs538Projection = 2
  const kPastElectionsVs538PollAvg = 3

  var defaultPresidentialCompareSourceIDs = {}
  defaultPresidentialCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
  defaultPresidentialCompareSourceIDs[kPastElectionsVs538Projection] = [PastElectionResultMapSource.getID(), FiveThirtyEightProjectionMapSource.getID()]
  defaultPresidentialCompareSourceIDs[kPastElectionsVs538PollAvg] = [PastElectionResultMapSource.getID(), FiveThirtyEightPollAverageMapSource.getID()]

  USAPresidentialMapType.setMapSources(presidentialMapSources)
  USAPresidentialMapType.setMapSourceIDs(presidentialMapSourceIDs)
  USAPresidentialMapType.setDefaultCompareSourceIDs(defaultPresidentialCompareSourceIDs)
  USAPresidentialMapType.setCustomSourceID(CustomMapSource.getID())
}

function createSenateMapSources()
{
  const regionNameToIDHistorical = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}

  const stateClasses = {
    /* Class 1/2 */ "MT": [1, 2], "WY": [1, 2], "NM": [1, 2], "NE": [1, 2], "TX": [1, 2], "MN": [1, 2], "MI": [1, 2], "TN": [1, 2], "MS": [1, 2], "WV": [1, 2], "VA": [1, 2], "DE": [1, 2], "NJ": [1, 2], "MA": [1, 2], "RI": [1, 2], "ME": [1, 2],
    /* Class 1/3 */ "HI": [1, 3], "CA": [1, 3], "WA": [1, 3], "NV": [1, 3], "UT": [1, 3], "AZ": [1, 3], "ND": [1, 3], "MO": [1, 3], "WI": [1, 3], "IN": [1, 3], "OH": [1, 3], "FL": [1, 3], "PA": [1, 3], "MD": [1, 3], "NY": [1, 3], "CT": [1, 3], "VT": [1, 3],
    /* Class 2/3 */ "AK": [2, 3], "OR": [2, 3], "ID": [2, 3], "CO": [2, 3], "SD": [2, 3], "KS": [2, 3], "OK": [2, 3], "IA": [2, 3], "AR": [2, 3], "LA": [2, 3], "IL": [2, 3], "KY": [2, 3], "AL": [2, 3], "GA": [2, 3], "SC": [2, 3], "NC": [2, 3], "NH": [2, 3]
  }

  const classModulo6 = [2, 4, 0]

  var doubleLineClassSeparatedFilterFunction = function(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, partyIDs, regionNameToID, _, __, isCustomMap, voteshareCutoffMargin)
  {
    var filteredMapData = {}
    var partyNameData = {}

    var regionNames = Object.keys(regionNameToID)
    var regionIDs = Object.values(regionNameToID)

    for (var dateNum in mapDates)
    {
      var rawDateData = rawMapData[mapDates[dateNum]]
      var filteredDateData = {}

      var currentMapDate = new Date(mapDates[dateNum])
      var currentDatePartyNameArray = {}

      var isOffyear = rawDateData[0][columnMap.isOffyear] == "TRUE"

      for (var regionNum in regionNames)
      {
        var regionToFind = regionNames[regionNum]

        for (var classNumIndex in stateClasses[regionNameToID[regionToFind]])
        {
          var classNum = stateClasses[regionNameToID[regionToFind]][classNumIndex]

          var mapDataRows = rawDateData.filter(row => {
            return row[columnMap.region] == regionToFind && row[columnMap.seatClass] == classNum
          })

          if (mapDataRows.length == 0)
          {
            if (isCustomMap)
            {
              let partyIDToCandidateNames = {}
              for (var partyCandidateName in candidateNameToPartyIDMap)
              {
                partyIDToCandidateNames[candidateNameToPartyIDMap[partyCandidateName]] = partyCandidateName
              }

              filteredDateData[regionNameToID[regionToFind] + (classNumIndex == 1 ? "-S" : "")] = {region: regionNameToID[regionToFind] + (classNumIndex == 1 ? "-S" : ""), seatClass: classNum, offYear: false, runoff: false, isSpecial: classNumIndex == 1, margin: 0, partyID: TossupParty.getID(), candidateMap: partyIDToCandidateNames}
            }
            continue
          }

          var isSpecialElection = mapDataRows[0][columnMap.isSpecial] == "TRUE"
          var shouldBeSpecialRegion = currentMapType.getMapSettings().seatArrangement == "election-type" ? isSpecialElection : (stateClasses[regionNameToID[regionToFind]].indexOf(classNum) == 1)

          var isRunoffElection = mapDataRows[0][columnMap.isRunoff] == "TRUE"

          var partyVotesharePercentages = null

          var candidateData = {}

          for (var rowNum in mapDataRows)
          {
            var row = mapDataRows[rowNum]

            var candidateName = row[columnMap.candidateName]
            var currentVoteshare = parseFloat(row[columnMap.voteshare])*100

            var currentPartyName = row[columnMap.partyID]
            var foundParty = Object.values(politicalParties).find(party => {
              var partyNames = cloneObject(party.getNames())
              for (var nameNum in partyNames)
              {
                partyNames[nameNum] = partyNames[nameNum].toLowerCase()
              }
              return partyNames.includes(currentPartyName)
            })

            if (!foundParty && Object.keys(politicalParties).includes(currentPartyName))
            {
              foundParty = politicalParties[currentPartyName]
            }

            var currentPartyID
            if (foundParty)
            {
              currentPartyID = foundParty.getID()
            }
            else
            {
              currentPartyID = IndependentGenericParty.getID()
            }

            if (Object.keys(candidateData).includes(candidateName))
            {
              if (currentVoteshare > candidateData[candidateName].voteshare)
              {
                candidateData[candidateName].partyID = currentPartyID
              }

              candidateData[candidateName].voteshare += currentVoteshare
            }
            else
            {
              candidateData[candidateName] = {candidate: candidateName, partyID: currentPartyID, voteshare: currentVoteshare}
            }
          }

          var voteshareSortedCandidateData = Object.values(candidateData).sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          if (!isCustomMap && voteshareCutoffMargin != null)
          {
            voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= voteshareCutoffMargin)
          }

          if (voteshareSortedCandidateData.length == 0)
          {
            console.log("No candidate data!", currentMapDate.getFullYear().toString(), regionToFind)
            continue
          }

          var greatestMarginPartyID
          var greatestMarginCandidateName
          var topTwoMargin

          if (voteshareSortedCandidateData[0].voteshare > 0)
          {
            greatestMarginPartyID = voteshareSortedCandidateData[0].partyID
            greatestMarginCandidateName = voteshareSortedCandidateData[0].candidate
            topTwoMargin = voteshareSortedCandidateData[0].voteshare - (voteshareSortedCandidateData[1] ? voteshareSortedCandidateData[1].voteshare : 0)
          }
          else
          {
            greatestMarginPartyID = TossupParty.getID()
            greatestMarginCandidateName = null
            topTwoMargin = 0
          }

          for (var candidateDataNum in voteshareSortedCandidateData)
          {
            var mainPartyID = voteshareSortedCandidateData[candidateDataNum].partyID
            if (!Object.keys(partyNameData).includes(mainPartyID))
            {
              currentDatePartyNameArray[mainPartyID] = politicalParties[mainPartyID].getNames()[0]
            }
          }

          var partyIDToCandidateNames = {}
          for (let partyCandidateName in candidateData)
          {
            partyIDToCandidateNames[candidateData[partyCandidateName].partyID] = partyCandidateName
          }

          filteredDateData[regionNameToID[regionToFind] + (shouldBeSpecialRegion ? "-S" : "")] = {region: regionNameToID[regionToFind] + (shouldBeSpecialRegion ? "-S" : ""), seatClass: classNum, offYear: isOffyear, runoff: isRunoffElection, isSpecial: isSpecialElection, disabled: mapDataRows[0][columnMap.isDisabled] == "TRUE", margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: !isCustomMap ? voteshareSortedCandidateData : null}
        }
      }

      filteredMapData[mapDates[dateNum]] = filteredDateData
      partyNameData[mapDates[dateNum]] = currentDatePartyNameArray
    }

    var fullFilteredMapData = cloneObject(filteredMapData)
    for (var mapDate in fullFilteredMapData)
    {
      let filteredDateData = fullFilteredMapData[mapDate]

      if (Object.values(filteredDateData).length == 0) { continue }

      let isOffyear = Object.values(filteredDateData)[0].offYear
      var isRunoff = Object.values(filteredDateData)[0].isRunoff

      var regionIDsInFilteredDateData = Object.keys(filteredDateData)
      for (let regionNum in regionIDs)
      {
        if (!regionIDsInFilteredDateData.includes(regionIDs[regionNum]))
        {
          var seatIndexToUse
          if (currentMapType.getMapSettings().seatArrangement == "seat-class" || !regionIDsInFilteredDateData.includes(regionIDs[regionNum] + "-S"))
          {
            seatIndexToUse = 0
          }
          else
          {
            var usedSeatClass = filteredDateData[regionIDs[regionNum] + "-S"].seatClass
            var seatIndex = stateClasses[regionIDs[regionNum]].indexOf(usedSeatClass)
            seatIndexToUse = Math.abs(seatIndex-1)
          }
          filteredDateData[regionIDs[regionNum]] = {region: regionIDs[regionNum], margin: 101, partyID: mostRecentWinner(filteredMapData, mapDate, regionIDs[regionNum], stateClasses[regionIDs[regionNum]][seatIndexToUse]), disabled: true, offYear: isOffyear, runoff: isRunoff, seatClass: stateClasses[regionIDs[regionNum]][seatIndexToUse]}
        }
        if (!regionIDsInFilteredDateData.includes(regionIDs[regionNum] + "-S"))
        {
          let seatIndexToUse
          if (currentMapType.getMapSettings().seatArrangement == "seat-class" || !regionIDsInFilteredDateData.includes(regionIDs[regionNum]))
          {
            seatIndexToUse = 1
          }
          else
          {
            let usedSeatClass = filteredDateData[regionIDs[regionNum]].seatClass
            let seatIndex = stateClasses[regionIDs[regionNum]].indexOf(usedSeatClass)
            seatIndexToUse = Math.abs(seatIndex-1)
          }
          filteredDateData[regionIDs[regionNum] + "-S"] = {region: regionIDs[regionNum] + "-S", margin: 101, partyID: mostRecentWinner(filteredMapData, mapDate, regionIDs[regionNum], stateClasses[regionIDs[regionNum]][seatIndexToUse]), disabled: true, offYear: isOffyear, runoff: isRunoff, seatClass: stateClasses[regionIDs[regionNum]][seatIndexToUse]}
        }
      }

      fullFilteredMapData[mapDate] = filteredDateData
    }

    if (!currentMapType.getMapSettingValue("offYear"))
    {
      var filteredMapDates = []
      for (mapDate in fullFilteredMapData)
      {
        if (Object.values(fullFilteredMapData[mapDate]).length == 0) { continue }

        var offYear = Object.values(fullFilteredMapData[mapDate])[0].offYear
        var runoff = Object.values(fullFilteredMapData[mapDate])[0].runoff

        if (!offYear && !runoff)
        {
          filteredMapDates.push(parseInt(mapDate))
        }
        if (runoff)
        {
          for (var regionID in fullFilteredMapData[mapDate])
          {
            if (fullFilteredMapData[mapDate][regionID].runoff)
            {
              fullFilteredMapData[filteredMapDates[filteredMapDates.length-1]][regionID] = fullFilteredMapData[mapDate][regionID]
            }
          }
        }
      }

      mapDates = filteredMapDates
    }

    return {mapData: fullFilteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
  }

  function mostRecentWinner(mapData, dateToStart, regionID, seatClass)
  {
    var reversedMapDates = cloneObject(Object.keys(mapData)).reverse()

    var startYear = (new Date(parseInt(dateToStart))).getFullYear()

    var startYearMod6 = startYear%6
    var electionYearMod6 = classModulo6[seatClass-1]

    if (startYearMod6 < electionYearMod6)
    {
      startYearMod6 += 6
    }
    var earliestYear = startYear-(startYearMod6-electionYearMod6)

    for (var dateNum in reversedMapDates)
    {
      if (reversedMapDates[dateNum] >= parseInt(dateToStart)) { continue }

      var currentYear = (new Date(parseInt(reversedMapDates[dateNum]))).getFullYear()

      if (startYear-currentYear > 6)
      {
        return TossupParty.getID()
      }

      var mapDataFromDate = mapData[reversedMapDates[dateNum]]
      if (regionID in mapDataFromDate && mapDataFromDate[regionID].seatClass == seatClass)
      {
        return mapDataFromDate[regionID].partyID
      }
      else if ((regionID + "-S") in mapDataFromDate && mapDataFromDate[regionID + "-S"].seatClass == seatClass)
      {
        return mapDataFromDate[regionID + "-S"].partyID
      }
    }

    return TossupParty.getID()
  }

  function customMapConvertMapDataToCSVFunction(columnMap, columnTitle, mapDateString, candidateName, candidateNameToPartyIDs, regionData, regionID, regionNameToID)
  {
    var columnKey = getKeyByValue(columnMap, columnTitle)
    switch (columnKey)
    {
      case "date":
      return mapDateString

      case "candidateName":
      return candidateName

      case "voteshare":
      if (candidateNameToPartyIDs[candidateName] == regionData.partyID)
      {
        return regionData.margin/100.0
      }
      return 0

      case "region":
      var trimmedRegionID = regionID.replace("-S", "")
      return getKeyByValue(regionNameToID, trimmedRegionID)

      case "seatClass":
      return regionData.seatClass

      case "partyID":
      return candidateNameToPartyIDs[candidateName]

      case "isSpecial":
      return (regionData.isSpecial || regionID.includes("-S")).toString().toUpperCase()

      case "isRunoff":
      return (regionData.runoff == null ? false : regionData.runoff).toString().toUpperCase()

      case "isOffyear":
      return (regionData.offYear == null ? false : regionData.offYear).toString().toUpperCase()

      case "isDisabled":
      return (regionData.disabled == null ? false : regionData.disabled).toString().toUpperCase()
    }
  }

  const LTE2022SenateYouTubeIDs = {
    1608364800000: "Wk-T-lXa5-g",
    1612080000000: "yifvg3uHips",
    1614412800000: "wtYw6nmWgQ0",
    1617087600000: "TNHmvLFzD7U",
    1619852400000: "RbpHQboaeWM",
    1622876400000: "DsLq1N8YEkc",
    1625295600000: "AU_GCaD594k"
  }

  var LTESenateProjectionMapSource = new MapSource(
    "LTE-2022-Senate-Projection",
    "LTE Projection",
    "https://map.jacksonjude.com/csv-sources/lte-2022-senate.csv",
    // "./csv-sources/lte-2022-senate.csv",
    "https://www.youtube.com/watch?v=",
    "./assets/lte-large.png",
    {
      date: "date",
      region: "region",
      seatClass: "class",
      isSpecial: "special",
      isRunoff: "runoff",
      isOffyear: "offyear",
      isDisabled: "disabled",
      candidateName: "candidate",
      partyID: "party",
      voteshare: "voteshare"
    },
    null,
    null,
    null,
    incumbentChallengerPartyIDs,
    regionNameToIDHistorical,
    null,
    null,
    false,
    false,
    doubleLineClassSeparatedFilterFunction,
    function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage, mapData)
    {
      if (mapDate == null) { return }

      var linkToOpen = homepageURL
      linkToOpen += LTE2022SenateYouTubeIDs[mapDate.getTime()]
      window.open(linkToOpen)
    },
    null,
    null,
    null,
    false
  )

  const PA2022SenateYouTubeIDs = {
    1614240000000: "Tbsy6XZ_e-Q",
    1615449600000: "xGtBqaMiAU4",
    1616742000000: "KJtDSRW3I7Q",
    1617778800000: "_cZ8OvgwN18",
    1619161200000: "_nWQxmYO2iA"
  }

  var PASenateProjectionMapSource = new MapSource(
    "PA-2022-Senate-Projection",
    "PA Projection",
    "https://map.jacksonjude.com/csv-sources/pa-2022-senate.csv",
    // "./csv-sources/pa-2022-senate.csv",
    "https://www.youtube.com/watch?v=",
    "./assets/pa-large.png",
    {
      date: "date",
      region: "region",
      seatClass: "class",
      isSpecial: "special",
      isRunoff: "runoff",
      isOffyear: "offyear",
      isDisabled: "disabled",
      candidateName: "candidate",
      partyID: "party",
      voteshare: "voteshare"
    },
    null,
    null,
    null,
    incumbentChallengerPartyIDs,
    regionNameToIDHistorical,
    null,
    null,
    false,
    false,
    doubleLineClassSeparatedFilterFunction,
    function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage, mapData)
    {
      if (mapDate == null) { return }

      var linkToOpen = homepageURL
      linkToOpen += PA2022SenateYouTubeIDs[mapDate.getTime()]
      window.open(linkToOpen)
    },
    null,
    null,
    null,
    false
  )

  var CookSenateProjectionMapSource = new MapSource(
    "Cook-2022-Senate",
    "Cook Political",
    "https://map.jacksonjude.com/csv-sources/cook-senate-2022/cook-latest.csv",
    "https://map.jacksonjude.com/csv-sources/cook-senate-2022/",
    "./assets/cookpolitical-large.png",
    {
      date: "date",
      region: "region",
      seatClass: "class",
      isSpecial: "special",
      isRunoff: "runoff",
      isOffyear: "offyear",
      isDisabled: "disabled",
      candidateName: "candidate",
      partyID: "party",
      voteshare: "voteshare"
    },
    null,
    null,
    null,
    incumbentChallengerPartyIDs,
    regionNameToIDHistorical,
    null,
    null,
    false,
    false,
    doubleLineClassSeparatedFilterFunction,
    function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
    {
      if (mapDate == null) { return }
      window.open(homepageURL + mapDate.getFullYear() + zeroPadding(mapDate.getMonth()+1) + mapDate.getDate() + ".html")
    }
  )

  var PastElectionResultMapSource = new MapSource(
    "Past-Senate-Elections",
    "Past Elections",
    "https://map.jacksonjude.com/csv-sources/past-senate.csv",
    //"./csv-sources/past-senate.csv",
    "https://en.wikipedia.org/wiki/",
    "./assets/wikipedia-large.png",
    {
      date: "date",
      region: "region",
      seatClass: "class",
      isSpecial: "special",
      isRunoff: "runoff",
      isOffyear: "offyear",
      candidateName: "candidate",
      partyID: "party",
      voteshare: "voteshare"
    },
    null,
    null,
    null,
    incumbentChallengerPartyIDs,
    regionNameToIDHistorical,
    null,
    {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"},
    false,
    true,
    doubleLineClassSeparatedFilterFunction,
    function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage, mapData)
    {
      if (mapDate == null) { return }

      var isSpecial = false
      if (regionID != null && mapDate != null)
      {
        isSpecial = mapData[mapDate.getTime()][regionID].isSpecial
      }

      var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_Senate_"
      if (!shouldOpenHomepage)
      {
        var baseRegionID = regionID
        if (isSpecial)
        {
          linkToOpen += "special_"
        }
        if (regionID.endsWith("-S"))
        {
          baseRegionID = regionID.slice(0, regionID.length-2)
        }
        linkToOpen += "election"
        linkToOpen += "_in_" + regionIDToLinkMap[baseRegionID]
      }
      else
      {
        linkToOpen += "election"
      }
      window.open(linkToOpen)
    },
    null,
    null,
    null,
    true,
    1.0
  )

  var idsToPartyNames = {}
  var partyNamesToIDs = {}
  for (var partyNum in mainPoliticalPartyIDs)
  {
    if (mainPoliticalPartyIDs[partyNum] == TossupParty.getID()) { continue }

    partyNamesToIDs[politicalParties[mainPoliticalPartyIDs[partyNum]].getNames()[0]] = mainPoliticalPartyIDs[partyNum]
    idsToPartyNames[mainPoliticalPartyIDs[partyNum]] = politicalParties[mainPoliticalPartyIDs[partyNum]].getNames()[0]
  }

  var CustomMapSource = new MapSource(
    "Custom-Senate",
    "Custom",
    null,
    null,
    null,
    {
      date: "date",
      region: "region",
      seatClass: "class",
      isSpecial: "special",
      isRunoff: "runoff",
      isOffyear: "offyear",
      isDisabled: "disabled",
      candidateName: "candidate",
      partyID: "party",
      voteshare: "voteshare"
    },
    null,
    partyNamesToIDs,
    idsToPartyNames,
    incumbentChallengerPartyIDs,
    regionNameToIDHistorical,
    null,
    null,
    false,
    true,
    doubleLineClassSeparatedFilterFunction,
    null,
    customMapConvertMapDataToCSVFunction,
    true,
    false
  )

  var todayDate = new Date()
  CustomMapSource.setTextMapData("date\n" + (todayDate.getMonth()+1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear())

  var senateMapSources = {}
  senateMapSources[LTESenateProjectionMapSource.getID()] = LTESenateProjectionMapSource
  senateMapSources[PASenateProjectionMapSource.getID()] = PASenateProjectionMapSource
  senateMapSources[CookSenateProjectionMapSource.getID()] = CookSenateProjectionMapSource
  senateMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
  senateMapSources[CustomMapSource.getID()] = CustomMapSource

  var senateMapSourceIDs = [LTESenateProjectionMapSource.getID(), PASenateProjectionMapSource.getID(), CookSenateProjectionMapSource.getID(), PastElectionResultMapSource.getID()]
  if (USASenateMapType.getCustomMapEnabled())
  {
    senateMapSourceIDs.push(CustomMapSource.getID())
  }

  const kPastElectionsVsPastElections = 1

  var defaultSenateCompareSourceIDs = {}
  defaultSenateCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]

  USASenateMapType.setMapSources(senateMapSources)
  USASenateMapType.setMapSourceIDs(senateMapSourceIDs)
  USASenateMapType.setDefaultCompareSourceIDs(defaultSenateCompareSourceIDs)
  USASenateMapType.setCustomSourceID(CustomMapSource.getID())
}

var NullMapSource = new MapSource(
  "None",
  "None",
  null,
  null,
  null,
  null,
  null,
  partyCandiateLastNames,
  partyIDToCandidateLastNames
)

createPresidentialMapSources()
createSenateMapSources()

/*
var CountyPastElectionMapSource = new MapSource(
  "County Election",
  "./csv-sources/county-president.csv",
  null,
  null,
  {
    date: "date",
    region: "region",
    candidateName: "candidate",
    percentAdjusted: "voteshare"
  },
  electionYearToCandidateData,
  null,
  incumbentChallengerPartyIDs,
  null,
  null,
  null,
  false,
  true,
  doubleLinePercentCopyFunction
)
*/
