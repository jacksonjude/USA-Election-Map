var USAGovernorMapType = new MapType(
  "USA-Governor",
  "Governor",
  "G",
  "assets/usa-governor.png",
  "svg-sources/usa-governor-map.svg",
  50,
  function()
  {
    return 1
  },
  false,
  4,
  true,
  true,
  {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"},
  [],
  [
    {id: "mapCurrentSeats", title: "Map Current Seats", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "hide", reloadType: MapSettingReloadType.display},
    {id: "pieCurrentSeats", title: "Pie Current Seats", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return !value
      },
    defaultValue: "show", reloadType: MapSettingReloadType.display},
    {id: "offYear", title: "Off Cycle Elections", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "hide", reloadType: MapSettingReloadType.data}
  ],
  (customMapEnabled) => {
    const regionNameToIDHistorical = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "National Popular Vote":nationalPopularVoteID}

    const heldSeatPartyIDs2022 = {"AK": RepublicanParty.getID(), "HI": DemocraticParty.getID(), "AL": RepublicanParty.getID(), "AR": RepublicanParty.getID(), "AZ": RepublicanParty.getID(), "CA": DemocraticParty.getID(), "CO": DemocraticParty.getID(), "CT": DemocraticParty.getID(), "DE": DemocraticParty.getID(), "FL": RepublicanParty.getID(), "GA": RepublicanParty.getID(), "IA": RepublicanParty.getID(), "ID": RepublicanParty.getID(), "IL": DemocraticParty.getID(), "IN": RepublicanParty.getID(), "KS": DemocraticParty.getID(), "KY": DemocraticParty.getID(), "LA": DemocraticParty.getID(), "MA": RepublicanParty.getID(), "MD": RepublicanParty.getID(), "ME": DemocraticParty.getID(), "MI": DemocraticParty.getID(), "MN": DemocraticParty.getID(), "MO": RepublicanParty.getID(), "MS": RepublicanParty.getID(), "MT": RepublicanParty.getID(), "NC": DemocraticParty.getID(), "ND": RepublicanParty.getID(), "NH": RepublicanParty.getID(), "NJ": DemocraticParty.getID(), "NM": DemocraticParty.getID(), "NV": DemocraticParty.getID(), "NY": DemocraticParty.getID(), "OH": RepublicanParty.getID(), "OK": RepublicanParty.getID(), "OR": DemocraticParty.getID(), "PA": DemocraticParty.getID(), "RI": DemocraticParty.getID(), "SC": RepublicanParty.getID(), "SD": RepublicanParty.getID(), "TN": RepublicanParty.getID(), "TX": RepublicanParty.getID(), "UT": RepublicanParty.getID(), "VA": RepublicanParty.getID(), "VT": RepublicanParty.getID(), "WA": DemocraticParty.getID(), "WI": DemocraticParty.getID(), "WV": RepublicanParty.getID(), "WY": RepublicanParty.getID(), "NE": RepublicanParty.getID()}

    var jsonVoteshareFilterFunction = function(rawMapData, _, columnMap, __, ___, regionNameToID, heldRegionMap, ____, _____, voteshareCutoffMargin)
    {
      let racesToIgnore = []
      let candidateExceptions = {"None of these candidates": "None"}

      let mapDate = new Date(rawMapData[0][columnMap.date]).getTime()

      let mapData = {[mapDate]: {}}
      let partyNameArray = {[mapDate]: {}}

      for (let raceData of rawMapData)
      {
        let raceKey = raceData[columnMap.raceKey]
        if (racesToIgnore.includes(raceKey)) continue

        let regionID = raceData[columnMap.region]
        let special = raceData[columnMap.special] == "G2"

        let totalVotes = raceData[columnMap.totalVotes]
        let reportingPercent = raceData[columnMap.reportingPercent]

        let formattedCandidatesArray = []

        let candiatesArray = raceData[columnMap.candidates]
        for (let candidateData of candiatesArray)
        {
          let candidateName = candidateData[columnMap.candidateName]
          let partyID = candidateData[columnMap.partyID]
          let candidateVotes = candidateData[columnMap.candidateVotes]

          if (candidateExceptions[candidateName])
          {
            candidateName = candidateExceptions[candidateName]
          }
          if (!politicalParties[partyID])
          {
            partyID = IndependentGenericParty.getID()
          }

          formattedCandidatesArray.push({candidate: candidateName, partyID: partyID, voteshare: candidateVotes/totalVotes*100, votes: candidateVotes})
        }

        let voteshareSortedCandidateData = formattedCandidatesArray.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
        voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= voteshareCutoffMargin)

        if (voteshareSortedCandidateData.length == 0)
        {
          console.log("No candidate data!", new Date(mapDate).getFullYear().toString(), regionID)
          continue
        }

        let greatestMarginPartyID
        let greatestMarginCandidateName
        let topTwoMargin

        if (voteshareSortedCandidateData[0].voteshare != 0)
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

        let partyIDToCandidateNames = {}
        for (let candidateData of voteshareSortedCandidateData)
        {
          partyIDToCandidateNames[candidateData.partyID] = candidateData.candidate
        }

        for (let candidateData of voteshareSortedCandidateData)
        {
          let mainPartyID = candidateData.partyID
          partyNameArray[mapDate][mainPartyID] = (politicalParties[mainPartyID] ?? IndependentGenericParty).getNames()[0]
        }

        mapData[mapDate][regionID] = {region: regionID, offYear: false, runoff: false, isSpecial: special, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[regionID] != greatestMarginPartyID, reportingPercent: reportingPercent}
      }

      for (let regionID of Object.values(regionNameToID))
      {
        if (regionID == nationalPopularVoteID) continue

        if (!mapData[mapDate][regionID])
        {
          mapData[mapDate][regionID] = {region: regionID, isSpecial: false, offYear: false, runoff: false, margin: 101, disabled: true, partyID: heldRegionMap[regionID]}
        }
      }

      return {mapData: mapData, candidateNameData: partyNameArray, mapDates: [mapDate]}
    }

    var singleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, __, regionNameToID, heldRegionMap, ___, ____, voteshareCutoffMargin)
    {
      let mapData = {}
      let partyNameData = {}

      const deluxeProjectionType = "_deluxe"
      const candidateColumns = {[DemocraticParty.getID()]: ["D1", "D2", "D3", "D4"], [RepublicanParty.getID()]: ["R1", "R2", "R3", "R4"], [IndependentGenericParty.getID()]: ["I1", "O1"]}
      const candidateNameColumnPrefix = "name_"
      const candidateVoteshareColumnPrefix = "voteshare_mean_"
      const candidateWinColumnPrefix = "winner_"

      let partyNames = Object.keys(candidateColumns).reduce((partyMap, partyID) => {
        partyMap[partyID] = politicalParties[partyID].getNames()[0]
        return partyMap
      }, {})

      for (let mapDate of mapDates)
      {
        let rawDateData = rawMapData[mapDate].filter(mapRow => mapRow[columnMap.pollType] == deluxeProjectionType)
        let dateData = {}

        for (let mapRow of rawDateData)
        {
          let [_, regionID] = /(\w\w)-G1/.exec(mapRow[columnMap.region])

          let candidateArray = []

          for (let partyID in candidateColumns)
          {
            for (let candidateID of candidateColumns[partyID])
            {
              let candidateName = mapRow[candidateNameColumnPrefix + candidateID]
              if (candidateName == "") break

              let candidateLastName = capitalize(candidateName.replaceAll(",", "").replaceAll(/ III?$/g, "").replaceAll(/ Jr\.?/g, "").replaceAll(/ Sr\.?/g, "").split(" ").reverse()[0])

              candidateArray.push({candidate: candidateLastName, partyID: partyID, voteshare: parseFloat(mapRow[candidateVoteshareColumnPrefix + candidateID]), winPercentage: parseFloat(mapRow[candidateWinColumnPrefix + candidateID])*100})
            }
          }

          let voteshareSortedCandidateData = candidateArray.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= voteshareCutoffMargin)

          if (voteshareSortedCandidateData.length == 0)
          {
            console.log("No candidate data!", new Date(mapDate).getFullYear().toString(), regionID)
            continue
          }

          let greatestMarginPartyID
          let greatestMarginCandidateName
          let topTwoMargin

          if (voteshareSortedCandidateData[0].voteshare != 0)
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

          let partyIDToCandidateNames = {}
          for (let candidateData of voteshareSortedCandidateData)
          {
            partyIDToCandidateNames[candidateData.partyID] = candidateData.candidate
          }

          dateData[regionID] = {region: regionID, offYear: false, runoff: false, isSpecial: false, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[regionID] != greatestMarginPartyID}
        }

        for (let regionID of Object.values(regionNameToID))
        {
          if (regionID == nationalPopularVoteID) continue

          if (!dateData[regionID])
          {
            dateData[regionID] = {region: regionID, isSpecial: false, offYear: false, runoff: false, margin: 101, disabled: true, partyID: heldRegionMap[regionID]}
          }
        }

        mapData[mapDate] = dateData
        partyNameData[mapDate] = partyNames
      }

      return {mapData: mapData, candidateNameData: partyNameData, mapDates: mapDates}
    }

    var doubleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, heldRegionMap, ____, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare)
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

          var mapDataRows = rawDateData.filter(row => {
            return row[columnMap.region] == regionToFind
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

              filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], offYear: false, runoff: false, isSpecial: false, margin: 0, partyID: TossupParty.getID(), candidateMap: partyIDToCandidateNames}
            }
            continue
          }

          var isSpecialElection = mapDataRows[0][columnMap.isSpecial] == "TRUE"
          var isRunoffElection = mapDataRows[0][columnMap.isRunoff] == "TRUE"

          var candidateData = {}

          for (var rowNum in mapDataRows)
          {
            var row = mapDataRows[rowNum]

            var candidateName = row[columnMap.candidateName]
            var currentVoteshare = parseFloat(row[columnMap.voteshare])*100
            var currentOrder = row[columnMap.order] ? parseInt(row[columnMap.order]) : null

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
              candidateData[candidateName] = {candidate: candidateName, partyID: currentPartyID, voteshare: currentVoteshare, order: currentOrder}
            }
          }

          var voteshareSortedCandidateData = Object.values(candidateData)
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

          var greatestMarginPartyID
          var greatestMarginCandidateName
          var topTwoMargin

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

          for (var candidateDataNum in voteshareSortedCandidateData)
          {
            var mainPartyID = voteshareSortedCandidateData[candidateDataNum].partyID
            if (mainPartyID.startsWith(customPartyIDPrefix))
            {
              currentDatePartyNameArray[mainPartyID] = politicalParties[mainPartyID].getCandidateName()
            }
            else
            {
              currentDatePartyNameArray[mainPartyID] = politicalParties[mainPartyID].getNames()[0]
            }
          }

          var partyIDToCandidateNames = {}
          for (let partyCandidateName in candidateData)
          {
            partyIDToCandidateNames[candidateData[partyCandidateName].partyID] = partyCandidateName
          }

          var mostRecentParty = heldRegionMap ? heldRegionMap[regionNameToID[regionToFind]] :  mostRecentWinner(filteredMapData, currentMapDate.getTime(), regionNameToID[regionToFind])
          filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], offYear: isOffyear, runoff: isRunoffElection, isSpecial: isSpecialElection, disabled: mapDataRows[0][columnMap.isDisabled] == "TRUE", margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: shouldIncludeVoteshare ? voteshareSortedCandidateData : null, flip: mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID()}
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
          if (regionIDs[regionNum] == nationalPopularVoteID) { continue }

          if (!regionIDsInFilteredDateData.includes(regionIDs[regionNum]))
          {
            filteredDateData[regionIDs[regionNum]] = {region: regionIDs[regionNum], margin: 101, partyID: mostRecentWinner(filteredMapData, mapDate, regionIDs[regionNum]), disabled: true, offYear: isOffyear, runoff: isRunoff}
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
              if (regionIDs[regionNum] == nationalPopularVoteID) { continue }

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

    function mostRecentWinner(mapData, dateToStart, regionID)
    {
      var reversedMapDates = cloneObject(Object.keys(mapData)).reverse()

      var startYear = (new Date(parseInt(dateToStart))).getFullYear()

      for (var dateNum in reversedMapDates)
      {
        if (reversedMapDates[dateNum] >= parseInt(dateToStart)) { continue }

        var currentYear = (new Date(parseInt(reversedMapDates[dateNum]))).getFullYear()

        if (startYear-currentYear > 4)
        {
          return TossupParty.getID()
        }

        var mapDataFromDate = mapData[reversedMapDates[dateNum]]
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
        return getKeyByValue(regionNameToID, regionID)

        case "partyID":
        return partyID

        case "order":
        voteshareData = regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.order
        }
        return ""

        case "isSpecial":
        return (regionData.isSpecial == null ? false : regionData.isSpecial).toString().toUpperCase()

        case "isRunoff":
        return (regionData.runoff == null ? false : regionData.runoff).toString().toUpperCase()

        case "isOffyear":
        return (regionData.offYear == null ? false : regionData.offYear).toString().toUpperCase()

        case "isDisabled":
        return (regionData.disabled == null ? false : regionData.disabled).toString().toUpperCase()
      }
    }

    var CNNGovernorResultsMapSource = new MapSource(
      "CNN-2022-Governor-Results", // id
      "CNN Results", // name
      {url: "https://politics.api.cnn.io/results/national-races/2022-GG.json", type: jsonSourceType}, // dataURL
      "https://www.cnn.com/election/2022/results/", // homepageURL
      {regular: "./assets/cnn-large.png", mini: "./assets/cnn.png"}, // iconURL
      {
        date: "extractedAt",
        raceKey: "ecKey",
        region: "stateAbbreviation",
        special: "raceType",
        totalVotes: "totalVote",
        reportingPercent: "percentReporting",
        candidates: "candidates",
        candidateName: "lastName",
        partyID: "majorParty",
        candidateVotes: "voteNum"
      }, // columnMap
      2022, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}, // regionIDToLinkMap
      heldSeatPartyIDs2022, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshareFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, _, shouldOpenHomepage, __)
      {
        if (!shouldOpenHomepage && !regionID) return

        let linkToOpen = homepageURL
        if (shouldOpenHomepage)
        {
          homepageURL += "governor"
        }
        else
        {
          linkToOpen += regionIDToLinkMap[regionID] + "/" + "governor"
        }

        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0 // voteshareCutoffMargin
    )

    var FiveThirtyEightGovernorProjectionMapSource = new MapSource(
      "538-2022-Governor-Projection", // id
      "538 Projection", // name
      "https://projects.fivethirtyeight.com/2022-general-election-forecast-data/governor_state_toplines_2022.csv", // dataURL
      "https://projects.fivethirtyeight.com/2022-election-forecast/governor/", // homepageURL
      {regular: "./assets/fivethirtyeight-large.png", mini: "./assets/fivethirtyeight.png"}, // iconURL
      {
        date: "forecastdate",
        region: "district",
        pollType: "expression"
      }, // columnMap
      2022, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}, // regionIDToLinkMap
      heldSeatPartyIDs2022, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      singleLineVoteshareFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, _, shouldOpenHomepage)
      {
        if (!shouldOpenHomepage && !regionID) return

        let linkToOpen = homepageURL
        if (!shouldOpenHomepage)
        {
          linkToOpen += regionIDToLinkMap[regionID]
        }

        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0 // voteshareCutoffMargin
    )

    const LTE2022GovernorYouTubeIDs = {
      1628380800000: "XXjRhuaFWuc",
      1630886400000: "QCN0K03rmRI",
      1636416000000: "rG30Fokvs5E",
      1641081600000: "Cei7ecOeqrU",
      1643760000000: "b4QU6eTz-dM",
      1646611200000: "NtnH-tK_IVU",
      1650153600000: "qpdq8r_pKuI",
      1654041600000: "Ps24mzQlaXM",
      1658188800000: "RrRscvpmwEY",
      1660176000000: "d9bZ6IQBrHI",
      1662336000000: "LlpgR8l-b7g",
      1666224000000: "Fre640zYHC4",
      1667779200000: "kMzwdTAF1xM"
    }

    var LTEGovernorProjectionMapSource = new MapSource(
      "LTE-2022-Governor-Projection", // id
      "LTE Projection", // name
      "./csv-sources/lte-2022-governor.csv", // dataURL
      "https://www.youtube.com/watch?v=", // homepageURL
      {regular: "./assets/lte-large.png", mini: "./assets/lte.png"}, // iconURL
      {
        date: "date",
        region: "region",
        isSpecial: "special",
        isRunoff: "runoff",
        isOffyear: "offyear",
        isDisabled: "disabled",
        candidateName: "candidate",
        partyID: "party",
        voteshare: "voteshare"
      }, // columnMap
      null, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      null, // regionIDToLinkMap
      heldSeatPartyIDs2022, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      false, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, _, __, mapDate, ___, ____)
      {
        if (mapDate == null) { return }

        var linkToOpen = homepageURL
        linkToOpen += LTE2022GovernorYouTubeIDs[mapDate.getUTCAdjustedTime()]
        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      false // shouldShowVoteshare
    )

    const Cook2022GovernorRatingIDs = {
      1612137600000: "231801",
      1618272000000: "231816",
      1619740800000: "231826",
      1624579200000: "231836",
      1625788800000: "231846",
      1628208000000: "231881",
      1630368000000: "231906",
      1631491200000: "231916",
      1631664000000: "231936",
      1632441600000: "231946",
      1633392000000: "232571",
      1638489600000: "238396",
      1644883200000: "248216",
      1646352000000: "252481",
      1652832000000: "288881",
      1654646400000: "297341",
      1658275200000: "303771",
      1658448000000: "303781",
      1658793600000: "304101",
      1663286400000: "304646",
      1664409600000: "305141",
      1666915200000: ""
    }

    var CookGovernorProjectionMapSource = new MapSource(
      "Cook-2022-Governor", // id
      "Cook Political", // name
      "./csv-sources/cook-governor-2022.csv", // dataURL
      "https://cookpolitical.com/ratings/governor-race-ratings/", // homepageURL
      {regular: "./assets/cookpolitical-large.png", mini: "./assets/cookpolitical.png"}, // iconURL
      {
        date: "date",
        region: "region",
        isSpecial: "special",
        isRunoff: "runoff",
        isOffyear: "offyear",
        isDisabled: "disabled",
        candidateName: "candidate",
        partyID: "party",
        voteshare: "voteshare"
      }, // columnMap
      null, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      null, // regionIDToLinkMap
      heldSeatPartyIDs2022, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      false, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, _, __, mapDate, ___)
      {
        if (mapDate == null) { return }
        window.open(homepageURL + (Cook2022GovernorRatingIDs[mapDate.getUTCAdjustedTime()] || ""))
      }, // customOpenRegionLinkFunction
      null // updateCustomMapFunction
    )

    var PastElectionResultMapSource = new MapSource(
      "Past-Governor-Elections", // id
      "Past Elections", // name
      "./csv-sources/past-governor.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      "./assets/wikipedia-large.png", // iconURL
      {
        date: "date",
        region: "region",
        isSpecial: "special",
        isRunoff: "runoff",
        isOffyear: "offyear",
        candidateName: "candidate",
        partyID: "party",
        voteshare: "voteshare"
      }, // columnMap
      null, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToID
      {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"}, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage, _)
      {
        if (mapDate == null) { return }

        // var isSpecial = false
        // if (regionID != null && mapDate != null)
        // {
        //   isSpecial = mapData[mapDate.getTime()][regionID].isSpecial
        // }

        var linkToOpen = homepageURL + mapDate.getFullYear()
        if (!shouldOpenHomepage)
        {
          linkToOpen += "_" + regionIDToLinkMap[regionID] + "_gubernatorial_election"
        }
        else
        {
          linkToOpen += "_United_States_gubernatorial_elections"
        }
        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0 // voteshareCutoffMargin
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
      "Custom-Governor", // id
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
        order: "order"
      }, // columnMap
      null, // cycleYear
      partyNamesToIDs, // candidateNameToPartyIDMap
      idsToPartyNames, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
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

    var governorMapSources = {}
    governorMapSources[CNNGovernorResultsMapSource.getID()] = CNNGovernorResultsMapSource
    governorMapSources[FiveThirtyEightGovernorProjectionMapSource.getID()] = FiveThirtyEightGovernorProjectionMapSource
    governorMapSources[LTEGovernorProjectionMapSource.getID()] = LTEGovernorProjectionMapSource
    governorMapSources[CookGovernorProjectionMapSource.getID()] = CookGovernorProjectionMapSource
    governorMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
    governorMapSources[CustomMapSource.getID()] = CustomMapSource

    var governorMapSourceIDs = [CNNGovernorResultsMapSource.getID(), FiveThirtyEightGovernorProjectionMapSource.getID(), LTEGovernorProjectionMapSource.getID(), CookGovernorProjectionMapSource.getID(), PastElectionResultMapSource.getID()]
    if (customMapEnabled)
    {
      governorMapSourceIDs.push(CustomMapSource.getID())
    }

    const kCNNResultsVS538Projection = 1
    const kPastElectionsVsPastElections = 2
    const k538ProjectionVsPastElections = 3

    var defaultGovernorCompareSourceIDs = {}
    defaultGovernorCompareSourceIDs[kCNNResultsVS538Projection] = [CNNGovernorResultsMapSource.getID(), FiveThirtyEightGovernorProjectionMapSource.getID()]
    defaultGovernorCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
    defaultGovernorCompareSourceIDs[k538ProjectionVsPastElections] = [FiveThirtyEightGovernorProjectionMapSource.getID(), PastElectionResultMapSource.getID()]

    return {mapSources: governorMapSources, mapSourceIDs: governorMapSourceIDs, defaultCompareSourceIDs: defaultGovernorCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)
