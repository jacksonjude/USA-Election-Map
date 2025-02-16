var JJUHouseMapType = new MapType(
  "JJU-House",
  "House",
  "H",
  "assets/usa-house.png",
  "svg-sources/jju-districts-map.svg",
  8,
  function()
  {
	return 1
  },
  false,
  3,
  true,
  true,
  true,
  {"BI": "Brunix Islands", "EX": "Emix", "DM": "Dalminica", "TR": "Trunoe", "AV": "Alvana", "QU": "Quintin", "DT": "Dentone", "GV": "Garvor", "N": "North", "S": "South", "E": "East", "W": "West", "L1": "List Seat 1", "L2": "List Seat 2", "L3": "List Seat 3", "L4": "List Seat 4", "L5": "List Seat 5", "L6": "List Seat 6", "L7": "List Seat 7", "L8": "List Seat 8", "L9": "List Seat 9"},
  [/.+-S/],
  [
	{id: "mapCurrentSeats", title: "🗺️ Map Held Seats", type: MapSettingType.optionCycle, options:
	  [
		{id: "show", title: "Shown", value: true},
		{id: "hide", title: "Hidden", value: false}
	  ],
	  shouldShowActive: (value) => {
		return value
	  },
	defaultValue: "hide", reloadType: MapSettingReloadType.display},
	{id: "pieCurrentSeats", title: "🥧 Pie Held Seats", type: MapSettingType.optionCycle, options:
	  [
		{id: "show", title: "Shown", value: true},
		{id: "hide", title: "Hidden", value: false}
	  ],
	  shouldShowActive: (value) => {
		return !value
	  },
	defaultValue: "show", reloadType: MapSettingReloadType.display},
	{id: "offYear", title: "🔄 Off Cycle Elections", type: MapSettingType.optionCycle, options:
	  [
		{id: "show", title: "Shown", value: true},
		{id: "hide", title: "Hidden", value: false}
	  ],
	  shouldShowActive: (value) => {
		return value
	  },
	defaultValue: "hide", reloadType: MapSettingReloadType.data}
  ],
  () => {
	const regionNameToID = {"Brunix Islands": "BI", "Emix": "EX", "Dalminica": "DM", "Trunoe": "TR", "Alvana": "AV", "Quintin": "QU", "Dentone": "DT", "Garvor": "GV", "North": "N", "South": "S", "East": "E", "West": "W", "List Seat 1": "L1", "List Seat 2": "L2", "List Seat 3": "L3", "List Seat 4": "L4", "List Seat 5": "L5", "List Seat 6": "L6", "List Seat 7": "L7", "List Seat 8": "L8", "List Seat 9": "L9", "National Popular Vote": nationalPopularVoteID}

	let doubleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, heldRegionMap, ____, isCustomMap, voteshareCutoffMargin)
	{
	  let filteredMapData = {}
	  let partyNameData = {}

	  let regionNames = Object.keys(regionNameToID)
    
    const regionRetireExceptions = {
      "L9": new Date(2024, 9-1, 21+1).getTime(),
      "N": new Date(2025, 1-1, 20+1).getTime(),
      "S": new Date(2025, 1-1, 20+1).getTime(),
      "E": new Date(2025, 1-1, 20+1).getTime(),
      "W": new Date(2025, 1-1, 20+1).getTime()
    }

	  for (let dateNum in mapDates)
	  {
		  let rawDateData = rawMapData[mapDates[dateNum]]
		  let filteredDateData = {}
  
		  let currentMapDate = new Date(mapDates[dateNum])
		  let currentDatePartyNameArray = {}
  
		  let isOffyear = rawDateData[0][columnMap.isOffyear] == "TRUE"
  
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
  
			  let isSpecialElection = mapDataRows[0][columnMap.isSpecial] == "TRUE"
			  let isRunoffElection = mapDataRows[0][columnMap.isRunoff] == "TRUE"
  
			  let candidateData = {}
  
			  for (let rowNum in mapDataRows)
			  {
			    let row = mapDataRows[rowNum]
  
			    let candidateName = row[columnMap.candidateName]
			    let candidateVotes = row[columnMap.candidateVotes] ? Math.round(parseFloat(row[columnMap.candidateVotes])) : null
			    let currentVoteshare = parseFloat(row[columnMap.voteshare])
  
			    let currentPartyName = row[columnMap.partyID]
			    let foundParty = Object.values(politicalParties).find(party => {
				    let partyNames = cloneObject(party.getNames())
				    for (let nameNum in partyNames)
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
			    console.log("No candidate data!", currentMapDate.getFullYear().toString(), regionToFind)
			    continue
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
  
			  let mostRecentParty = heldRegionMap ? heldRegionMap[regionNameToID[regionToFind]] : mostRecentWinner(filteredMapData, currentMapDate.getTime(), regionNameToID[regionToFind], isRunoffElection)
			  filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], offYear: isOffyear, runoff: isRunoffElection, isSpecial: isSpecialElection, disabled: mapDataRows[0][columnMap.isDisabled] == "TRUE", margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: mapDataRows[0][columnMap.flip] == "TRUE" || (mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID())}
	    }
  
		  filteredMapData[mapDates[dateNum]] = filteredDateData
		  partyNameData[mapDates[dateNum]] = currentDatePartyNameArray
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
        if (mapDate > regionRetireExceptions[regionID]) { continue }
  
		    if (!currentRegionIDs.includes(regionID))
		    {
			    filteredDateData[regionID] = {region: regionID, margin: 101, partyID: mostRecentWinner(filteredMapData, mapDate, regionID), disabled: true, offYear: isOffyear, runoff: isRunoff}
		    }
		  }
  
		  fullFilteredMapData[mapDate] = filteredDateData
      
      previousMapDate = mapDate
	  }

	  if (!currentMapType.getMapSettingValue("offYear"))
	  {
		  let filteredMapDates = []
		  for (let mapDate in fullFilteredMapData)
		  {
		    if (Object.values(fullFilteredMapData[mapDate]).length == 0) { continue }
  
		    let offYear = Object.values(fullFilteredMapData[mapDate])[0].offYear
		    let runoff = Object.values(fullFilteredMapData[mapDate])[0].runoff
  
		    if (!offYear && !runoff)
		    {
          filteredMapDates.push(parseInt(mapDate))
		    }
		    // if (runoff)
		    // {
			  //   for (let regionID in fullFilteredMapData[mapDate])
			  //   {
			  //     if (fullFilteredMapData[mapDate][regionID].runoff)
			  //     {
				//       let originalMapData = cloneObject(fullFilteredMapData[filteredMapDates[filteredMapDates.length-1]][regionID])
				//       originalMapData.altText = "general"
				//       fullFilteredMapData[mapDate][regionID].altData = originalMapData
				//       fullFilteredMapData[filteredMapDates[filteredMapDates.length-1]][regionID] = fullFilteredMapData[mapDate][regionID]
			  //     }
			  //   }
		    // }
		  }
  
		  mapDates = filteredMapDates
	  }

	  return {mapData: fullFilteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
	}

	function mostRecentWinner(mapData, dateToStart, regionID, isRunoffElection)
	{
	  var reversedMapDates = cloneObject(Object.keys(mapData)).reverse()

	  var startYear = (new Date(parseInt(dateToStart))).getFullYear()

	  var shouldSkipNext = isRunoffElection || false // Skip first result if runoff (which should be primary)

	  for (var dateNum in reversedMapDates)
	  {
		  if (reversedMapDates[dateNum] >= parseInt(dateToStart)) { continue }
  
		  var currentYear = (new Date(parseInt(reversedMapDates[dateNum]))).getFullYear()
  
		  if (startYear-currentYear > 7) // Need to include runoffs, which may take place as late as January
		  {
		    return TossupParty.getID()
		  }
  
		  var mapDataFromDate = mapData[reversedMapDates[dateNum]]
		  if (regionID in mapDataFromDate)
		  {
        if (shouldSkipNext)
        {
          shouldSkipNext = false
        }
        else
        {
          return mapDataFromDate[regionID].partyID
        }
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

		case "isSpecial":
		return (regionData.isSpecial || regionID.includes("-S")).toString().toUpperCase()

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

	var PastElectionResultMapSource = new MapSource(
	  "Past-House-Elections", // id
	  "Past Elections", // name
	  "./csv-sources/jju-past-house.csv", // dataURL
	  null, // homepageURL
	  {regular: "./assets/wikipedia-large.png", mini: "./assets/wikipedia-large.png", getOverlayText: () => {
		let currentYear = currentSliderDate.getFullYear()
		return currentYear
	  }}, // iconURL
	  {
		  date: "date",
		  region: "region",
		  seatClass: "class",
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
	  null, // getFormattedRegionName
	  null, // customOpenRegionLinkFunction
	  null, // updateCustomMapFunction
	  null, // convertMapDataRowToCSVFunction
	  null, // isCustomMap
	  null, // shouldClearDisabled
	  true, // shouldShowVoteshare
	  1.0, // voteshareCutoffMargin
    async function(dateTime)
    {
      let mapDate = new Date(dateTime)
      
      if (mapDate < new Date(2025, 2-1, 1))
      {
        return "svg-sources/jju-regions-list-map.svg"
      }
      else
      {
        return "svg-sources/jju-districts-list-map.svg"
      }
    }, // overrideSVGPath,
    null, // shouldSetDisabledWorthToZero
    null, // shouldUseOriginalMapDataForTotalsPieChart
    null, // shouldForcePopularVoteDisplayOnZoom
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
	  "Custom-House", // id
	  "Custom", // name
	  null, // dataURL
	  null, // homepageURL
	  null, // iconURL
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
