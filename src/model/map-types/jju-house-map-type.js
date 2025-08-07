var JJUHouseMapType = new MapType(
  "JJU-House",
  "House",
  "H",
  "assets/usa-house.png",
  "svg-sources/jju-districts-list-map.svg",
  8,
  function()
  {
    return 1
  },
  false,
  2,
  true,
  true,
  false,
  true,
  {"BI": "Brunix Islands", "EX": "Emix", "DM": "Dalminica", "TR": "Trunoe", "AV": "Alvana", "QU": "Quintin", "DT": "Dentone", "GV": "Garvor", "N": "North", "S": "South", "E": "East", "W": "West", "L1": "List Seat 1", "L2": "List Seat 2", "L3": "List Seat 3", "L4": "List Seat 4", "L5": "List Seat 5", "L6": "List Seat 6", "L7": "List Seat 7", "L8": "List Seat 8", "L9": "List Seat 9", "L10": "List Seat 10", "L11": "List Seat 11", "L12": "List Seat 12", "L13": "List Seat 13", "N-1": "North 1st", "S-1": "South 1st", "E-1": "East 1st", "W-1": "West 1st", "N-2": "North 2nd", "S-2": "South 2nd", "E-2": "East 2nd", "W-2": "West 2nd"},
  [/.+-S/],
  [
    {id: "coalitions", title: "🤝 Coalitions", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "hide", reloadType: MapSettingReloadType.data},
	  {id: "offYear", title: "🔄 Off Cycle Elections", type: MapSettingType.optionCycle, options:
	    [
		    {id: "show", title: "Shown", value: true},
		    {id: "hide", title: "Hidden", value: false}
	    ],
	    shouldShowActive: (value) => {
		    return value
	    },
	  defaultValue: "hide", reloadType: MapSettingReloadType.data},
    {id: "mapCurrentSeats", title: "🗺️ Map Held Seats", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "hide", reloadType: MapSettingReloadType.display}
  ],
  () => {
	  const regionNameToID = {"Brunix Islands": "BI", "Emix": "EX", "Dalminica": "DM", "Trunoe": "TR", "Alvana": "AV", "Quintin": "QU", "Dentone": "DT", "Garvor": "GV", "North": "N", "South": "S", "East": "E", "West": "W", "List Seat 1": "L1", "List Seat 2": "L2", "List Seat 3": "L3", "List Seat 4": "L4", "List Seat 5": "L5", "List Seat 6": "L6", "List Seat 7": "L7", "List Seat 8": "L8", "List Seat 9": "L9", "List Seat 10": "L10", "List Seat 11": "L11", "List Seat 12": "L12", "List Seat 13": "L13", "North 1st": "N-1", "South 1st": "S-1", "East 1st": "E-1", "West 1st": "W-1", "North 2nd": "N-2", "South 2nd": "S-2", "East 2nd": "E-2", "West 2nd": "W-2", "National Popular Vote": nationalPopularVoteID}
  
	  let doubleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, heldRegionMap, ____, isCustomMap, voteshareCutoffMargin)
	  {
	    let filteredMapData = {}
	    let partyNameData = {}
  
	    let regionNames = Object.keys(regionNameToID)
      
      const regionRetireExceptions = {
        "L9": [new Date(2024, 9-1, 21+1).getTime(), new Date(2025, 6-1, 1).getTime()],
        "N": new Date(2025, 1-1, 1).getTime(),
        "S": new Date(2025, 1-1, 1).getTime(),
        "E": new Date(2025, 1-1, 1).getTime(),
        "W": new Date(2025, 1-1, 1).getTime(),
        "N-1": new Date(2025, 1-1, 22+1).getTime(),
        "S-1": new Date(2025, 1-1, 22+1).getTime(),
        "E-1": new Date(2025, 1-1, 22+1).getTime(),
        "W-1": new Date(2025, 1-1, 22+1).getTime(),
        "N-2": new Date(2025, 1-1, 22+1).getTime(),
        "S-2": new Date(2025, 1-1, 22+1).getTime(),
        "E-2": new Date(2025, 1-1, 22+1).getTime(),
        "W-2": new Date(2025, 1-1, 22+1).getTime(),
        "L13": new Date(2025, 7-1, 20-1).getTime(),
      }
      
      const coalitionRegionID = "Coalition"
      
      const processMapDataRows = (mapDataRows, currentMapDate, regionID, currentDatePartyNameArray, coalitionPartyMap) => {
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
          if (currentMapType.getMapSettingValue("coalitions") && coalitionPartyMap[currentPartyName])
          {
            currentPartyName = coalitionPartyMap[currentPartyName]
            if (regionID == nationalPopularVoteID) candidateName = currentPartyName
          }
          
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
        
        // todo: fix list seat flips
        // list seat should only be flip if it is a gained list seat for that party
        
        let mostRecentParty = heldRegionMap ? heldRegionMap[regionID] : mostRecentWinner(filteredMapData, currentMapDate.getTime(), regionID).partyID
        return {region: regionID, offYear: isOffyear, runoff: isRunoffElection, isSpecial: isSpecialElection, disabled: mapDataRows[0][columnMap.isDisabled] == "TRUE", margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: mapDataRows[0][columnMap.flip] == "TRUE" || (mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID())}
      }
  
	    for (let mapDateTime of mapDates)
	    {
		    let rawDateData = rawMapData[mapDateTime]
		    let filteredDateData = {}
    
		    let currentMapDate = new Date(mapDateTime)
		    let currentDatePartyNameArray = {}
        
        let coalitionDataRows = rawDateData.filter(row => {
          return row[columnMap.region] == coalitionRegionID
        })
        let coalitionPartyMap = {}
        for (let coalitionPartyMapping of coalitionDataRows)
        {
          coalitionPartyMap[coalitionPartyMapping[columnMap.candidateName]] = coalitionPartyMapping[columnMap.partyID]
        }
    
		    for (let regionName of regionNames)
		    {
          let regionID = regionNameToID[regionName]
		      
			    let mapDataRows = rawDateData.filter(row => {
			      return row[columnMap.region] == regionName
			    })
    
			    if (mapDataRows.length == 0)
			    {
			      if (isCustomMap && !(regionRetireExceptions[regionID] && regionRetireExceptions[regionID] instanceof Array
              ? currentMapDate > regionRetireExceptions[regionID][0] && currentMapDate < regionRetireExceptions[regionID][1]
              : currentMapDate > regionRetireExceptions[regionID]))
			      {
			        let partyIDToCandidateNames = {}
			        for (let partyCandidateName in candidateNameToPartyIDMap)
			        {
			          partyIDToCandidateNames[candidateNameToPartyIDMap[partyCandidateName]] = partyCandidateName
			        }
        
			        filteredDateData[regionID] = {region: regionID, offYear: false, runoff: false, isSpecial: false, margin: 0, partyID: TossupParty.getID(), candidateMap: partyIDToCandidateNames}
			      }
			      continue
			    }
          
          if (mapDataRows.find(row => row[columnMap.isRunoff] == "TRUE") && mapDataRows.find(row => row[columnMap.isRunoff] != "TRUE"))
          {
            let originalMapData = processMapDataRows(mapDataRows.filter(row => row[columnMap.isRunoff] != "TRUE"), currentMapDate, regionID, currentDatePartyNameArray, coalitionPartyMap)
            originalMapData.altText = "first round"
            
            let runoffMapData = processMapDataRows(mapDataRows.filter(row => row[columnMap.isRunoff] == "TRUE"), currentMapDate, regionID, currentDatePartyNameArray, coalitionPartyMap)
            runoffMapData.altData = originalMapData
            
            filteredDateData[regionID] = runoffMapData
          }
          else
          {
            filteredDateData[regionID] = processMapDataRows(mapDataRows, currentMapDate, regionID, currentDatePartyNameArray, coalitionPartyMap)
          }
	      }
    
		    filteredMapData[mapDateTime] = filteredDateData
		    partyNameData[mapDateTime] = currentDatePartyNameArray
	    }
  
	    let fullFilteredMapData = cloneObject(filteredMapData)
      let previousMapDate = null
	    for (let mapDate in fullFilteredMapData)
	    {
		    let filteredDateData = fullFilteredMapData[mapDate]
    
		    if (Object.values(filteredDateData).length == 0) { continue }
        
        let previousDateRegionIDs = Object.keys(fullFilteredMapData[previousMapDate] ?? {})
		    let currentRegionIDs = Object.keys(filteredDateData)
    
		    let isOffyear = Object.values(filteredDateData)[0].offYear
		    let isRunoff = Object.values(filteredDateData)[0].isRunoff
    
		    for (let regionID of previousDateRegionIDs)
		    {
		      if (regionID == nationalPopularVoteID) { continue }
          if (regionRetireExceptions[regionID] instanceof Array
            ? mapDate > regionRetireExceptions[regionID][0] && mapDate < regionRetireExceptions[regionID][1]
            : mapDate > regionRetireExceptions[regionID]) { continue }
    
		      if (!currentRegionIDs.includes(regionID))
		      {
			      filteredDateData[regionID] = {region: regionID, ...mostRecentWinner(filteredMapData, mapDate, regionID), isHold: true, disabled: true, offYear: isOffyear, runoff: isRunoff}
		      }
		    }
    
		    fullFilteredMapData[mapDate] = filteredDateData
        
        previousMapDate = mapDate
	    }
      
      let offYearEnabled = currentMapType.getMapSettingValue("offYear")
	    let filteredMapDates = []
      for (let mapDate in fullFilteredMapData)
      {
        if (Object.values(fullFilteredMapData[mapDate]).length == 0) { continue }
      
        let offYear = Object.values(fullFilteredMapData[mapDate])[0].offYear
        if (offYear && !offYearEnabled) { continue }
        
        filteredMapDates.push(parseInt(mapDate))
      }
      
      mapDates = filteredMapDates
  
	    return {mapData: fullFilteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
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
          return {margin: mapDataFromDate[regionID].margin, partyID: mapDataFromDate[regionID].partyID, candidateName: mapDataFromDate[regionID].candidateName, candidateMap: mapDataFromDate[regionID].candidateMap, partyVotesharePercentages: mapDataFromDate[regionID].partyVotesharePercentages, electionDate: parseInt(reversedMapDates[dateNum])}
		    }
	    }
  
	    return {margin: 0, partyID: TossupParty.getID()}
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
		      return voteshareData.voteshare
		    }
		    else if (regionData.partyID == partyID)
		    {
		      return regionData.margin
		    }
		    return 0
    
		    case "region":
		    return getKeyByValue(regionNameToID, regionID)
    
		    case "partyID":
		    return partyID
    
		    case "isRunoff":
		    return (regionData.runoff ?? false).toString().toUpperCase()
    
		    case "isOffyear":
		    return (regionData.offYear ?? false).toString().toUpperCase()
    
		    case "isDisabled":
		    return (regionData.disabled ?? false).toString().toUpperCase()
		    
		    case "flip":
		    return (regionData.flip ?? false).toString().toUpperCase()
	    }
	  }
    
    function getHouseSVGByDate(dateTime)
    {
      let mapDate = new Date(dateTime)
      
      if (mapDate < new Date(2024, 10-1, 1))
      {
        return "svg-sources/jju-regions-list-9-map.svg"
      }
      else if (mapDate < new Date(2025, 1-1, 1))
      {
        return "svg-sources/jju-regions-list-map.svg"
      }
      else if (mapDate < new Date(2025, 2-1, 1))
      {
        return "svg-sources/jju-regions-list-stv-map.svg"
      }
      else if (mapDate < new Date(2025, 6-1, 1))
      {
        return "svg-sources/jju-districts-list-map.svg"
      }
      else if (mapDate < new Date(2025, 7-1, 20-1))
      {
        return "svg-sources/jju-districts-list-13-map.svg"
      }
      else
      {
        return "svg-sources/jju-districts-list-12-map.svg"
      }
    }
    
    function getFormattedRegionName(regionName, regionData)
    {
      if (!regionData) return regionName
      
      if (regionData.isHold && regionData.electionDate)
      {
        const electionDate = new Date(regionData.electionDate)
        regionName += ` (${getMonthPrefix(electionDate.getMonth())} ${electionDate.getFullYear()})`
      }
      
      return regionName
    }
    
    var electionDateToSpreadsheetData = {
      1724223600000: {
        id: "1fFJ8Y_KS2iy6qOupil1F-qC8wrKDjpJECRHIVjWHUzY",
        regions: {
          "N": "1501672328",
          "S": "370122789",
          "E": "1011441980",
          "W": "402739737"
        }
      },
      1726902000000: {
        id: "1dxk8_7ij62LiDzpZiS0XENsGFybg0MQ67vjt55JdLeo",
        regions: {
          "N": "1501672328",
          "S": "370122789",
          "E": "1011441980",
          "W": "402739737"
        }
      },
      1729407600000: {
        id: "18T8S_JLndBFFlCOoUxoqDFIxlEczNq4YFK2BNXpGRVc",
        regions: {
          "N": "1501672328",
          "S": "370122789",
          "E": "1011441980",
          "W": "402739737"
        }
      },
      1734249600000: {
        id: "1Us3ATy8e5FpsO7tjNTLTasGqiKPcHJg-hh2h0S9a80I",
        regions: {
          "L1": "441625624",
          "L2": "441625624",
          "L3": "441625624",
          "L4": "441625624",
          "L5": "441625624",
          "L6": "441625624",
          "L7": "441625624",
          "L8": "441625624",
          "N": "419628180",
          "S": "1586359503",
          "E": "486563209",
          "W": "1482060989"
        }
      },
      1736582400000: {
        id: "16kSr6XBqbKJSA4665rN7OzdP_tYo17o0A6jlUyLUuWE",
        regions: {
          "L1": "441625624",
          "L2": "441625624",
          "L3": "441625624",
          "L4": "441625624",
          "L5": "441625624",
          "L6": "441625624",
          "L7": "441625624",
          "L8": "441625624",
          "N": "419628180",
          "S": "1586359503",
          "E": "486563209",
          "W": "1482060989"
        }
      },
      1739088000000: {
        id: "1WNpCjaDoAUzKZ0dESvw8rL3wIMSiXYmEphFwwxV2R8U",
        regions: {
          "L1": "441625624",
          "L2": "441625624",
          "L3": "441625624",
          "L4": "441625624",
          "L5": "441625624",
          "L6": "441625624",
          "L7": "441625624",
          "L8": "441625624",
          "BI": "419628180",
          "EX": "419628180",
          "QU": "1586359503",
          "AV": "1586359503",
          "DM": "486563209",
          "TR": "486563209",
          "DT": "1482060989",
          "GV": "1482060989"
        }
      },
      1741507200000: {
        id: "1NrI9tRg4GtJxBy1hng0fMC3wdtby5LCsqMBXQUvffZ4",
        regions: {
          "L1": "441625624",
          "L2": "441625624",
          "L3": "441625624",
          "L4": "441625624",
          "L5": "441625624",
          "L6": "441625624",
          "L7": "441625624",
          "L8": "441625624",
          "BI": "419628180",
          "EX": "419628180",
          "QU": "1586359503",
          "AV": "1586359503",
          "DM": "486563209",
          "TR": "486563209",
          "DT": "1482060989",
          "GV": "1482060989"
        }
      },
      1743922800000: {
        id: "1YI8gO_ajh3b9Et7wAH5A6kBLdPHM8LAz5XYhUpe9DRc",
        regions: {
          "L1": "441625624",
          "L2": "441625624",
          "L3": "441625624",
          "L4": "441625624",
          "L5": "441625624",
          "L6": "441625624",
          "L7": "441625624",
          "L8": "441625624",
          "BI": "419628180",
          "EX": "419628180",
          "QU": "1586359503",
          "AV": "1586359503",
          "DM": "486563209",
          "TR": "486563209",
          "DT": "1482060989",
          "GV": "1482060989"
        }
      },
      1746946800000: {
        id: "1OR3INfqexRBxjpFRJpMCICZNZDaXbnkvDM23rgYAwOs",
        regions: {
          "L1": "441625624",
          "L2": "441625624",
          "L3": "441625624",
          "L4": "441625624",
          "L5": "441625624",
          "L6": "441625624",
          "L7": "441625624",
          "L8": "441625624",
          "BI": "419628180",
          "EX": "419628180",
          "QU": "1586359503",
          "AV": "1586359503",
          "DM": "486563209",
          "TR": "486563209",
          "DT": "1482060989",
          "GV": "1482060989"
        }
      },
      1749970800000: {
        id: "1nI_EfYD42esRP0z-gS5GwMlDdY6RLelvBSFkKewM7pE",
        regions: {
          "L1": "441625624",
          "L2": "441625624",
          "L3": "441625624",
          "L4": "441625624",
          "L5": "441625624",
          "L6": "441625624",
          "L7": "441625624",
          "L8": "441625624",
          "L9": "441625624",
          "L10": "441625624",
          "L11": "441625624",
          "L12": "441625624",
          "L13": "441625624",
          "BI": "419628180",
          "EX": "419628180",
          "QU": "1586359503",
          "AV": "1586359503",
          "DM": "486563209",
          "TR": "486563209",
          "DT": "1482060989",
          "GV": "1482060989"
        }
      }
    }
  
	  var PastElectionResultMapSource = new MapSource(
	    "JJU-Past-House-Elections", // id
	    "Past Elections", // name
	    "./csv-sources/jju-past-house.csv", // dataURL
	    "https://docs.google.com/spreadsheets/d", // homepageURL
	    {regular: "./assets/wikipedia-large.png", mini: "./assets/wikipedia-large.png", getOverlayText: () => {
		  let currentYear = currentSliderDate.getFullYear()
		  return currentYear
	    }}, // iconURL
	    {
		    date: "date",
		    region: "region",
		    isSpecial: "special",
		    isRunoff: "runoff",
		    isOffyear: "offyear",
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
	    getFormattedRegionName, // getFormattedRegionName
	    function(homepageURL, regionID, _, mapDate, __, mapData)
      {
        const regionData = mapData[mapDate.getTime()][regionID]
        if (regionData && regionData.isHold && regionData.electionDate)
        {
          mapDate = new Date(regionData.electionDate)
        }
        
        let spreadsheetLinkData = electionDateToSpreadsheetData[mapDate.getTime()]
        if (!spreadsheetLinkData) return null
        
        let linkToOpen = `${homepageURL}/${spreadsheetLinkData.id}/edit?gid=${spreadsheetLinkData.regions[regionID] ?? 0}`
      
        return linkToOpen
      }, // customOpenRegionLinkFunction
	    null, // updateCustomMapFunction
	    null, // convertMapDataRowToCSVFunction
	    null, // isCustomMap
	    null, // shouldClearDisabled
	    true, // shouldShowVoteshare
	    1.0, // voteshareCutoffMargin
      getHouseSVGByDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      null, // shouldUseOriginalMapDataForTotalsPieChart
      null, // shouldForcePopularVoteDisplay
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
	    "JJU-Custom-House", // id
	    "Custom", // name
	    null, // dataURL
	    null, // homepageURL
	    null, // iconURL
	    {
		    date: "date",
		    region: "region",
		    isSpecial: "special",
		    isRunoff: "runoff",
		    isOffyear: "offyear",
		    isDisabled: "disabled",
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
	    getFormattedRegionName, // getFormattedRegionName
	    null, // customOpenRegionLinkFunction
	    null, // updateCustomMapFunction
	    customMapConvertMapDataToCSVFunction, // convertMapDataRowToCSVFunction
	    true, // isCustomMap
	    false, // shouldClearDisabled
	    null, // shouldShowVoteshare
      null, // voteshareCutoffMargin
      getHouseSVGByDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      null, // shouldUseOriginalMapDataForTotalsPieChart
      null, // shouldForcePopularVoteDisplay
      {safe: 30, likely: 20, lean: 10, tilt: Number.MIN_VALUE}, // customDefaultMargins
	  )
  
	  var todayDate = new Date()
	  CustomMapSource.setTextMapData("date\n" + (todayDate.getMonth()+1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear())
  
	  var houseMapSources = {}
	  houseMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
	  houseMapSources[CustomMapSource.getID()] = CustomMapSource
  
	  const houseMapSourceIDs = {
	    [allYearsCycle]: [PastElectionResultMapSource.getID(), CustomMapSource.getID()]
	  }
	  
	  const kPastElectionsVsPastElections = 1
  
	  var defaultHouseCompareSourceIDs = {}
	  defaultHouseCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
  
	  return {mapSources: houseMapSources, mapSourceIDs: houseMapSourceIDs, mapCycles: [], defaultCompareSourceIDs: defaultHouseCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)
