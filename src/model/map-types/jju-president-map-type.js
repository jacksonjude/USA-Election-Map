var JJUPresidentMapType = new MapType(
  "JJU-President",
  "President",
  "P",
  "assets/usa-pres.png",
  "svg-sources/jju-districts-map.svg",
  8,
  function()
  {
    return 1
  },
  false,
  2,
  false,
  false,
  true,
  {"BI": "Brunix Islands", "EX": "Emix", "DM": "Dalminica", "TR": "Trunoe", "AV": "Alvana", "QU": "Quintin", "DT": "Dentone", "GV": "Garvor"},
  [/.+-S/],
  [
    {id: "firstRound", title: "☝️ First Rounds", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "hide", reloadType: MapSettingReloadType.data},
  ],
  () => {
    const regionNameToID = {"Brunix Islands": "BI", "Emix": "EX", "Dalminica": "DM", "Trunoe": "TR", "Alvana": "AV", "Quintin": "QU", "Dentone": "DT", "Garvor": "GV", "National Popular Vote": nationalPopularVoteID}
  
    let doubleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, heldRegionMap, ____, isCustomMap, voteshareCutoffMargin)
    {
      let filteredMapData = {}
      let partyNameData = {}
  
      let regionNames = Object.keys(regionNameToID)
      
      const processMapDataRows = (mapDataRows, currentMapDate, regionID, currentDatePartyNameArray) => {
        let isSpecialElection = mapDataRows[0][columnMap.isSpecial] == "TRUE"
        let isRunoffElection = mapDataRows[0][columnMap.isRunoff] == "TRUE"
        let isOffyear = mapDataRows[0][columnMap.isOffyear] == "TRUE"
        
        let candidateData = {}
        
        for (let rowNum in mapDataRows)
        {
          let row = mapDataRows[rowNum]
        
          let candidateName = row[columnMap.candidateName]
          let candidateVotes = row[columnMap.candidateVotes] ? Math.round(parseFloat(row[columnMap.candidateVotes])) : null
          let currentVoteshare = parseFloat(row[columnMap.voteshare])
        
          let currentPartyName = row[columnMap.partyID]
          
          let foundParty = Object.values(politicalParties).find(party => {
            let partyNames = cloneObject(party.getNames()).map(partyName => partyName.toLowerCase())
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
            if (candidateData[candidateName].votes && candidateVotes)
            {
              candidateData[candidateName].votes += candidateVotes
            }
          }
          else
          {
            candidateData[candidateName] = {candidate: candidateName, partyID: currentPartyID, voteshare: currentVoteshare, votes: candidateVotes}
          }
        }
        
        let voteshareSortedCandidateData = Object.values(candidateData)
        voteshareSortedCandidateData = voteshareSortedCandidateData.filter((candData) => !isNaN(candData.voteshare))
        voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
        if (!isCustomMap && voteshareCutoffMargin != null)
        {
          voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= voteshareCutoffMargin)
        }
        
        if (voteshareSortedCandidateData.length == 0)
        {
          console.log("No candidate data!", currentMapDate.getFullYear().toString(), regionID)
          return
        }
        
        let greatestMarginPartyID
        let greatestMarginCandidateName
        let topTwoMargin
        
        if (voteshareSortedCandidateData[0].voteshare != 0)
        {
          let topCandidateData = voteshareSortedCandidateData.filter(candidateData => candidateData.order == 0 || candidateData.order == 1).sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          if (topCandidateData.length == 0)
          {
            topCandidateData = [voteshareSortedCandidateData[0]]
            if (voteshareSortedCandidateData[1])
            {
              topCandidateData.push(voteshareSortedCandidateData[1])
            }
          }
        
          greatestMarginPartyID = topCandidateData[0].partyID
          greatestMarginCandidateName = topCandidateData[0].candidate
          topTwoMargin = topCandidateData[0].voteshare - (topCandidateData[1] ? topCandidateData[1].voteshare : 0)
        }
        else
        {
          greatestMarginPartyID = TossupParty.getID()
          greatestMarginCandidateName = null
          topTwoMargin = 0
        }
        
        for (let candidateDataNum in voteshareSortedCandidateData)
        {
          let mainPartyID = voteshareSortedCandidateData[candidateDataNum].partyID
          if (mainPartyID.startsWith(customPartyIDPrefix))
          {
            currentDatePartyNameArray[mainPartyID] = politicalParties[mainPartyID].getCandidateName()
          }
          else
          {
            currentDatePartyNameArray[mainPartyID] = politicalParties[mainPartyID].getNames()[0]
          }
        }
        
        let partyIDToCandidateNames = {}
        for (let partyCandidateName in candidateData)
        {
          partyIDToCandidateNames[candidateData[partyCandidateName].partyID] = partyCandidateName
        }
        
        let mostRecentParty = heldRegionMap ? heldRegionMap[regionID] : mostRecentWinner(filteredMapData, currentMapDate.getTime(), regionID)
        return {region: regionID, offYear: isOffyear, runoff: isRunoffElection, isSpecial: isSpecialElection, disabled: mapDataRows[0][columnMap.isDisabled] == "TRUE", margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: mapDataRows[0][columnMap.flip] == "TRUE" || (mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID())}
      }
  
      for (let dateNum in mapDates)
      {
        let rawDateData = rawMapData[mapDates[dateNum]]
        let filteredDateData = filteredMapData[mapDates[dateNum]] ?? {}
    
        let currentMapDate = new Date(mapDates[dateNum])
        let currentDatePartyNameArray = {}
    
        for (let regionNum in regionNames)
        {
          let regionToFind = regionNames[regionNum]
          
          let mapDataRows = rawDateData.filter(row => {
            return row[columnMap.region] == regionToFind
          })
    
          if (mapDataRows.length == 0)
          {
            if (isCustomMap)
            {
              let partyIDToCandidateNames = {}
              for (let partyCandidateName in candidateNameToPartyIDMap)
              {
                partyIDToCandidateNames[candidateNameToPartyIDMap[partyCandidateName]] = partyCandidateName
              }
        
              filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], offYear: false, runoff: false, isSpecial: false, margin: 0, partyID: TossupParty.getID(), candidateMap: partyIDToCandidateNames}
            }
            continue
          }
          
          if (mapDataRows.find(row => row[columnMap.isRunoff] == "TRUE") && mapDataRows.find(row => row[columnMap.isRunoff] != "TRUE"))
          {
            let originalMapData = processMapDataRows(mapDataRows.filter(row => row[columnMap.isRunoff] != "TRUE"), currentMapDate, regionNameToID[regionToFind], currentDatePartyNameArray)
            // originalMapData.altText = "first round"
            originalMapData.isFirstRound = true
            filteredDateData[regionNameToID[regionToFind]] = originalMapData
            
            let runoffMapData = processMapDataRows(mapDataRows.filter(row => row[columnMap.isRunoff] == "TRUE"), currentMapDate, regionNameToID[regionToFind], currentDatePartyNameArray)
            // runoffMapData.altData = originalMapData
            
            let instantRunoffDate = mapDates[dateNum]+1
            if (!filteredMapData[instantRunoffDate]) filteredMapData[instantRunoffDate] = {}
            filteredMapData[instantRunoffDate][regionNameToID[regionToFind]] = runoffMapData
            
            if (!mapDates.includes(instantRunoffDate)) mapDates.push(instantRunoffDate)
          }
          else
          {
            filteredDateData[regionNameToID[regionToFind]] = processMapDataRows(mapDataRows, currentMapDate, regionNameToID[regionToFind], currentDatePartyNameArray)
          }
        }
    
        filteredMapData[mapDates[dateNum]] = filteredDateData
        partyNameData[mapDates[dateNum]] = currentDatePartyNameArray
      }
      
      let firstRoundEnabled = currentMapType.getMapSettingValue("firstRound")
      let filteredMapDates = []
      for (let mapDate in filteredMapData)
      {
        if (Object.values(filteredMapData[mapDate]).length == 0) { continue }
      
        let isFirstRound = Object.values(filteredMapData[mapDate])[0].isFirstRound
        if (isFirstRound && !firstRoundEnabled) { continue }
        
        filteredMapDates.push(parseInt(mapDate))
      }
      filteredMapDates.sort()
  
      return {mapData: filteredMapData, candidateNameData: partyNameData, mapDates: filteredMapDates}
    }
  
    function mostRecentWinner(mapData, dateToStart, regionID)
    {
      let reversedMapDates = cloneObject(Object.keys(mapData)).reverse()
  
      for (let dateNum in reversedMapDates)
      {
        if (reversedMapDates[dateNum] >= parseInt(dateToStart)) { continue }
    
        let mapDataFromDate = mapData[reversedMapDates[dateNum]]
        if (regionID in mapDataFromDate)
        {
          return mapDataFromDate[regionID].partyID
        }
      }
  
      return TossupParty.getID()
    }
  
    function customMapConvertMapDataToCSVFunction(columnKey, mapDateString, regionID, regionNameToID, candidateName, partyID, regionData, shouldUseVoteshare)
    {
      let voteshareData
      switch (columnKey)
      {
        case "date":
        return mapDateString
    
        case "candidateName":
        return candidateName
    
        case "voteshare":
        voteshareData = shouldUseVoteshare && regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.voteshare/100.0
        }
        else if (regionData.partyID == partyID)
        {
          return regionData.margin/100.0
        }
        return 0
    
        case "region":
        var trimmedRegionID = regionID.replace("-S", "")
        return getKeyByValue(regionNameToID, trimmedRegionID)
    
        case "partyID":
        return partyID
    
        case "isRunoff":
        return (regionData.runoff ?? false).toString().toUpperCase()
        
        case "flip":
        return (regionData.flip ?? false).toString().toUpperCase()
      }
    }
    
    var electionDateToSpreadsheetData = {
      1724223600000: {
        id: "1fFJ8Y_KS2iy6qOupil1F-qC8wrKDjpJECRHIVjWHUzY",
        regions: {
          "BI": "1501672328",
          "EX": "1501672328",
          "QU": "370122789",
          "AV": "370122789",
          "DM": "1011441980",
          "TR": "1011441980",
          "DT": "402739737",
          "GV": "402739737"
        }
      },
      1724223600001: {
        id: "1fFJ8Y_KS2iy6qOupil1F-qC8wrKDjpJECRHIVjWHUzY",
        regions: {
          "BI": "1501672328",
          "EX": "1501672328",
          "QU": "370122789",
          "AV": "370122789",
          "DM": "1011441980",
          "TR": "1011441980",
          "DT": "402739737",
          "GV": "402739737"
        }
      },
      1729407600000: {
        id: "18T8S_JLndBFFlCOoUxoqDFIxlEczNq4YFK2BNXpGRVc",
        regions: {
          "BI": "1501672328",
          "EX": "1501672328",
          "QU": "370122789",
          "AV": "370122789",
          "DM": "1011441980",
          "TR": "1011441980",
          "DT": "402739737",
          "GV": "402739737"
        }
      },
      1729407600001: {
        id: "18T8S_JLndBFFlCOoUxoqDFIxlEczNq4YFK2BNXpGRVc",
        regions: {
          "BI": "1501672328",
          "EX": "1501672328",
          "QU": "370122789",
          "AV": "370122789",
          "DM": "1011441980",
          "TR": "1011441980",
          "DT": "402739737",
          "GV": "402739737"
        }
      },
      1734249600000: {
        id: "1Us3ATy8e5FpsO7tjNTLTasGqiKPcHJg-hh2h0S9a80I",
        gid: "160285118"
      },
      1739088000000: {
        id: "1WNpCjaDoAUzKZ0dESvw8rL3wIMSiXYmEphFwwxV2R8U",
        gid: "129029341"
      },
      1739088000001: {
        id: "1WNpCjaDoAUzKZ0dESvw8rL3wIMSiXYmEphFwwxV2R8U",
        gid: "129029341"
      }
    }
  
    var PastElectionResultMapSource = new MapSource(
      "JJU-Past-Presidential-Elections", // id
      "Past Elections", // name
      "./csv-sources/jju-past-president.csv", // dataURL
      "https://docs.google.com/spreadsheets/d", // homepageURL
      {regular: "./assets/wikipedia-large.png", mini: "./assets/wikipedia-large.png", getOverlayText: () => {
      let currentYear = currentSliderDate.getFullYear()
      return currentYear
      }}, // iconURL
      {
        date: "date",
        region: "region",
        isRunoff: "runoff",
        candidateName: "candidate",
        partyID: "party",
        voteshare: "voteshare",
        candidateVotes: "candidatevotes",
        totalVotes: "totalvotes"
      }, // columnMap
      null, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToID, // regionNameToIDMap
      null, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, regionID, _, mapDate)
      {
        let spreadsheetLinkData = electionDateToSpreadsheetData[mapDate.getTime()]
        if (!spreadsheetLinkData) return null
        
        let linkToOpen = `${homepageURL}/${spreadsheetLinkData.id}/edit?gid=${spreadsheetLinkData.regions?.[regionID] ?? spreadsheetLinkData.gid ?? 0}`
      
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      null, // overrideSVGPath,
      null, // shouldSetDisabledWorthToZero
      null, // shouldUseOriginalMapDataForTotalsPieChart
      true, // shouldForcePopularVoteDisplay
      {safe: 30, likely: 20, lean: 10, tilt: Number.MIN_VALUE}, // customDefaultMargins
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
      "JJU-Custom-President", // id
      "Custom", // name
      null, // dataURL
      null, // homepageURL
      null, // iconURL
      {
        date: "date",
        region: "region",
        isRunoff: "runoff",
        candidateName: "candidate",
        partyID: "party",
        voteshare: "voteshare",
        order: "order",
        flip: "flip"
      }, // columnMap
      null, // cycleYear
      partyNamesToIDs, // candidateNameToPartyIDMap
      idsToPartyNames, // shortCandidateNameOverride
      regionNameToID, // regionNameToIDMap
      null, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      customMapConvertMapDataToCSVFunction, // convertMapDataRowToCSVFunction
      true, // isCustomMap
      false, // shouldClearDisabled
      null // shouldShowVoteshare
    )
  
    var todayDate = new Date()
    CustomMapSource.setTextMapData("date\n" + (todayDate.getMonth()+1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear())
  
    var presidentialMapSources = {}
    presidentialMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
    presidentialMapSources[CustomMapSource.getID()] = CustomMapSource
  
    const presidentialMapSourceIDs = {
      [allYearsCycle]: [PastElectionResultMapSource.getID()]
    }
    
    const kPastElectionsVsPastElections = 1
  
    var defaultPresidentCompareSourceIDs = {}
    defaultPresidentCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
  
    return {mapSources: presidentialMapSources, mapSourceIDs: presidentialMapSourceIDs, mapCycles: [], defaultCompareSourceIDs: defaultPresidentCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)
