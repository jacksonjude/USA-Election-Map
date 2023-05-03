var USASenateMapType = new MapType(
  "USA-Senate",
  "Senate",
  "S",
  "assets/usa-senate.png",
  "svg-sources/usa-senate-map.svg",
  100,
  function()
  {
    return 1
  },
  false,
  3,
  true,
  true,
  {"AL":"Alabama","AL-S":"Alabama Special","AK":"Alaska","AK-S":"Alaska Special","AZ":"Arizona","AZ-S":"Arizona Special","AR":"Arkansas","AR-S":"Arkansas Special","CA":"California","CA-S":"California Special","CO":"Colorado","CO-S":"Colorado Special","CT":"Connecticut","CT-S":"Connecticut Special","DE":"Delaware","DE-S":"Delaware Special","FL":"Florida","FL-S":"Florida Special","GA":"Georgia","GA-S":"Georgia Special","HI":"Hawaii","HI-S":"Hawaii Special","ID":"Idaho","ID-S":"Idaho Special","IL":"Illinois","IL-S":"Illinois Special","IN":"Indiana","IN-S":"Indiana Special","IA":"Iowa","IA-S":"Iowa Special","KS":"Kansas","KS-S":"Kansas Special","KY":"Kentucky","KY-S":"Kentucky Special","LA":"Louisiana","LA-S":"Louisiana Special","ME":"Maine","ME-S":"Maine Special","MD":"Maryland","MD-S":"Maryland Special","MA":"Massachusetts","MA-S":"Massachusetts Special","MI":"Michigan","MI-S":"Michigan Special","MN":"Minnesota","MN-S":"Minnesota Special","MS":"Mississippi","MS-S":"Mississippi Special","MO":"Missouri","MO-S":"Missouri Special","MT":"Montana","MT-S":"Montana Special","NE":"Nebraska","NE-S":"Nebraska Special","NV":"Nevada","NV-S":"Nevada Special","NH":"New Hampshire","NH-S":"New Hampshire Special","NJ":"New Jersey","NJ-S":"New Jersey Special","NM":"New Mexico","NM-S":"New Mexico Special","NY":"New York","NY-S":"New York Special","NC":"North Carolina","NC-S":"North Carolina Special","ND":"North Dakota","ND-S":"North Dakota Special","OH":"Ohio","OH-S":"Ohio Special","OK":"Oklahoma","OK-S":"Oklahoma Special","OR":"Oregon","OR-S":"Oregon Special","PA":"Pennsylvania","PA-S":"Pennsylvania Special","RI":"Rhode Island","RI-S":"Rhode Island Special","SC":"South Carolina","SC-S":"South Carolina Special","SD":"South Dakota","SD-S":"South Dakota Special","TN":"Tennessee","TN-S":"Tennessee Special","TX":"Texas","TX-S":"Texas Special","UT":"Utah","UT-S":"Utah Special","VT":"Vermont","VT-S":"Vermont Special","VA":"Virginia","VA-S":"Virginia Special","WA":"Washington","WA-S":"Washington Special","WV":"West Virginia","WV-S":"West Virginia Special","WI":"Wisconsin","WI-S":"Wisconsin Special","WY":"Wyoming","WY-S":"Wyoming Special"},
  [/.+-S/],
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
    {id: "seatArrangement", title: "Seat Arrangement", type: MapSettingType.optionCycle, options:
      [
        {id: "election-type", title: "Election", value: 0},
        {id: "seat-class", title: "Class", value: 1}
      ],
      shouldShowActive: (value) => {
        return value == 1
      },
    defaultValue: "election-type", reloadType: MapSettingReloadType.data},
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

    const stateClasses = {
      /* Class 1/2 */ "MT": [1, 2], "WY": [1, 2], "NM": [1, 2], "NE": [1, 2], "TX": [1, 2], "MN": [1, 2], "MI": [1, 2], "TN": [1, 2], "MS": [1, 2], "WV": [1, 2], "VA": [1, 2], "DE": [1, 2], "NJ": [1, 2], "MA": [1, 2], "RI": [1, 2], "ME": [1, 2],
      /* Class 1/3 */ "HI": [1, 3], "CA": [1, 3], "WA": [1, 3], "NV": [1, 3], "UT": [1, 3], "AZ": [1, 3], "ND": [1, 3], "MO": [1, 3], "WI": [1, 3], "IN": [1, 3], "OH": [1, 3], "FL": [1, 3], "PA": [1, 3], "MD": [1, 3], "NY": [1, 3], "CT": [1, 3], "VT": [1, 3],
      /* Class 2/3 */ "AK": [2, 3], "OR": [2, 3], "ID": [2, 3], "CO": [2, 3], "SD": [2, 3], "KS": [2, 3], "OK": [2, 3], "IA": [2, 3], "AR": [2, 3], "LA": [2, 3], "IL": [2, 3], "KY": [2, 3], "AL": [2, 3], "GA": [2, 3], "SC": [2, 3], "NC": [2, 3], "NH": [2, 3],
      /* National Popular Vote */ [nationalPopularVoteID]: [1]
    }

    const heldSeatPartyIDs2022 = {"AK-2": RepublicanParty.getID(), "HI-1": DemocraticParty.getID(), "AL-2": RepublicanParty.getID(), "AR-2": RepublicanParty.getID(), "AZ-1": DemocraticParty.getID(), "CA-1": DemocraticParty.getID(), "CO-2": DemocraticParty.getID(), "CT-1": DemocraticParty.getID(), "DE-2": DemocraticParty.getID(), "FL-1": RepublicanParty.getID(), "GA-2": DemocraticParty.getID(), "IA-2": RepublicanParty.getID(), "ID-2": RepublicanParty.getID(), "IL-2": DemocraticParty.getID(), "IN-1": RepublicanParty.getID(), "KS-2": RepublicanParty.getID(), "KY-2": RepublicanParty.getID(), "LA-2": RepublicanParty.getID(), "MA-2": DemocraticParty.getID(), "MD-1": DemocraticParty.getID(), "ME-2": RepublicanParty.getID(), "MI-2": DemocraticParty.getID(), "MN-2": DemocraticParty.getID(), "MO-1": RepublicanParty.getID(), "MS-2": RepublicanParty.getID(), "MT-2": RepublicanParty.getID(), "NC-2": RepublicanParty.getID(), "ND-1": RepublicanParty.getID(), "NH-2": DemocraticParty.getID(), "NJ-2": DemocraticParty.getID(), "NM-2": DemocraticParty.getID(), "NV-1": DemocraticParty.getID(), "NY-1": DemocraticParty.getID(), "OH-1": DemocraticParty.getID(), "OK-2": RepublicanParty.getID(), "OR-2": DemocraticParty.getID(), "PA-1": DemocraticParty.getID(), "RI-2": DemocraticParty.getID(), "SC-2": RepublicanParty.getID(), "SD-2": RepublicanParty.getID(), "TN-2": RepublicanParty.getID(), "TX-2": RepublicanParty.getID(), "UT-1": RepublicanParty.getID(), "VA-2": DemocraticParty.getID(), "VT-1": DemocraticParty.getID(), "WA-1": DemocraticParty.getID(), "WI-1": DemocraticParty.getID(), "WV-2": RepublicanParty.getID(), "WY-2": RepublicanParty.getID(), "NE-2": RepublicanParty.getID(), "WA-3": DemocraticParty.getID(), "OR-3": DemocraticParty.getID(), "CA-3": DemocraticParty.getID(), "NV-3": DemocraticParty.getID(), "UT-3": RepublicanParty.getID(), "AZ-3": DemocraticParty.getID(), "NM-1": DemocraticParty.getID(), "AK-3": RepublicanParty.getID(), "HI-3": DemocraticParty.getID(), "TX-1": RepublicanParty.getID(), "OK-3": RepublicanParty.getID(), "KS-3": RepublicanParty.getID(), "CO-3": DemocraticParty.getID(), "NE-1": RepublicanParty.getID(), "WY-1": RepublicanParty.getID(), "MT-1": DemocraticParty.getID(), "ID-3": RepublicanParty.getID(), "ND-3": RepublicanParty.getID(), "SD-3": RepublicanParty.getID(), "MN-1": DemocraticParty.getID(), "WI-3": RepublicanParty.getID(), "IA-3": RepublicanParty.getID(), "IL-3": DemocraticParty.getID(), "MO-3": RepublicanParty.getID(), "AR-3": RepublicanParty.getID(), "LA-3": RepublicanParty.getID(), "MS-1": RepublicanParty.getID(), "AL-3": RepublicanParty.getID(), "GA-3": DemocraticParty.getID(), "FL-3": RepublicanParty.getID(), "SC-3": RepublicanParty.getID(), "NC-3": RepublicanParty.getID(), "TN-1": RepublicanParty.getID(), "KY-3": RepublicanParty.getID(), "WV-1": DemocraticParty.getID(), "VA-1": DemocraticParty.getID(), "OH-3": RepublicanParty.getID(), "IN-3": RepublicanParty.getID(), "MI-1": DemocraticParty.getID(), "PA-3": RepublicanParty.getID(), "NY-3": DemocraticParty.getID(), "ME-1": DemocraticParty.getID(), "NH-3": DemocraticParty.getID(), "VT-3": DemocraticParty.getID(), "MA-1": DemocraticParty.getID(), "RI-1": DemocraticParty.getID(), "CT-3": DemocraticParty.getID(), "NJ-1": DemocraticParty.getID(), "DE-1": DemocraticParty.getID(), "MD-3": DemocraticParty.getID(), "NPV-1": RepublicanParty.getID()}

    var jsonVoteshareFilterFunction = function(rawMapData, _, columnMap, cycleYear, __, regionNameToID, heldRegionMap, ____, _____, voteshareCutoffMargin)
    {
      let onCycleClass = ((cycleYear-2)%6)/2+1

      let racesToIgnore = ["2022-S2P-CA"]
      let candidateExceptions = {"None of these candidates": "None"}

      let mapDate = new Date(rawMapData[0][columnMap.date]).getTime()

      let mapData = {[mapDate]: {}}
      let partyNameArray = {[mapDate]: {}}

      for (let raceData of rawMapData)
      {
        let raceKey = raceData[columnMap.raceKey]
        if (racesToIgnore.includes(raceKey)) continue

        let regionID = raceData[columnMap.region]
        let special = raceData[columnMap.special] == "S2"

        let totalVotes = raceData[columnMap.totalVotes]
        let reportingPercent = raceData[columnMap.reportingPercent]

        let regionClass = !special ? onCycleClass : stateClasses[regionID].filter(classNum => classNum != onCycleClass)[0]

        let fullRegionID = regionID + (special ? "-S" : "")

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

        mapData[mapDate][fullRegionID] = {region: fullRegionID, seatClass: regionClass, offYear: false, runoff: false, isSpecial: special, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[regionID + "-" + regionClass] != greatestMarginPartyID, reportingPercent: reportingPercent}
      }

      for (let regionID of Object.values(regionNameToID))
      {
        if (regionID == nationalPopularVoteID) continue

        let placeholderRegionData = {offYear: false, runoff: false, margin: 101, disabled: true}

        let seatClassesToUse = [stateClasses[regionID][0] != onCycleClass ? stateClasses[regionID][0] : stateClasses[regionID][1], stateClasses[regionID][1] != onCycleClass ? stateClasses[regionID][1] : stateClasses[regionID][0]]

        if (!mapData[mapDate][regionID])
        {
          mapData[mapDate][regionID] = {region: regionID, seatClass: seatClassesToUse[0], isSpecial: false, partyID: heldRegionMap[regionID + "-" + seatClassesToUse[0]], ...placeholderRegionData}
        }
        if (!mapData[mapDate][regionID + "-S"])
        {
          mapData[mapDate][regionID + "-S"] = {region: regionID + "-S", seatClass: seatClassesToUse[1], isSpecial: true, partyID: heldRegionMap[regionID + "-" + seatClassesToUse[1]], ...placeholderRegionData}
        }
      }

      return {mapData: mapData, candidateNameData: partyNameArray, mapDates: [mapDate]}
    }

    var singleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, cycleYear, _, regionNameToID, heldRegionMap, ___, ____, voteshareCutoffMargin)
    {
      let mapData = {}
      let partyNameData = {}

      const deluxeProjectionType = "_deluxe"
      const candidateColumns = {[DemocraticParty.getID()]: ["D1", "D2", "D3", "D4"], [RepublicanParty.getID()]: ["R1", "R2", "R3", "R4"], [IndependentGenericParty.getID()]: ["I1", "O1"]}
      const candidateNameColumnPrefix = "name_"
      const candidateVoteshareColumnPrefix = "voteshare_mean_"
      const candidateWinColumnPrefix = "winner_"

      let onCycleClass = ((cycleYear-2)%6)/2+1
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
          let [_, regionID, regionClass] = /(\w\w)-S(\d)/.exec(mapRow[columnMap.region])

          let shouldBeSpecialRegion = regionClass != onCycleClass
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

          dateData[regionID + (shouldBeSpecialRegion ? "-S" : "")] = {region: regionID + (shouldBeSpecialRegion ? "-S" : ""), seatClass: regionClass, offYear: false, runoff: false, isSpecial: shouldBeSpecialRegion, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[regionID + "-" + regionClass] != greatestMarginPartyID}
        }

        for (let regionID of Object.values(regionNameToID))
        {
          if (regionID == nationalPopularVoteID) continue

          let placeholderRegionData = {offYear: false, runoff: false, margin: 101, disabled: true}

          let seatClassesToUse = [stateClasses[regionID][0] != onCycleClass ? stateClasses[regionID][0] : stateClasses[regionID][1], stateClasses[regionID][1] != onCycleClass ? stateClasses[regionID][1] : stateClasses[regionID][0]]

          if (!dateData[regionID])
          {
            dateData[regionID] = {region: regionID, seatClass: seatClassesToUse[0], isSpecial: false, partyID: heldRegionMap[regionID + "-" + seatClassesToUse[0]], ...placeholderRegionData}
          }
          if (!dateData[regionID + "-S"])
          {
            dateData[regionID + "-S"] = {region: regionID + "-S", seatClass: seatClassesToUse[1], isSpecial: true, partyID: heldRegionMap[regionID + "-" + seatClassesToUse[1]], ...placeholderRegionData}
          }
        }

        mapData[mapDate] = dateData
        partyNameData[mapDate] = partyNames
      }

      return {mapData: mapData, candidateNameData: partyNameData, mapDates: mapDates}
    }

    var doubleLineClassSeparatedFilterFunction = function(rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, heldRegionMap, ____, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare)
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
            // var totalStateVotes = countyRows[0][columnMap.totalVotes] ? parseFloat(countyRows[0][columnMap.totalVotes]) : null

            var candidateData = {}

            for (var rowNum in mapDataRows)
            {
              var row = mapDataRows[rowNum]

              var candidateName = row[columnMap.candidateName]
              var candidateVotes = row[columnMap.candidateVotes] ? Math.round(parseFloat(row[columnMap.candidateVotes])) : null
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
                candidateData[candidateName] = {candidate: candidateName, partyID: currentPartyID, voteshare: currentVoteshare, order: currentOrder, votes: candidateVotes}
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

            var mostRecentParty = heldRegionMap ? heldRegionMap[regionNameToID[regionToFind] + "-" + classNum] : mostRecentWinner(filteredMapData, currentMapDate.getTime(), regionNameToID[regionToFind], classNum, isRunoffElection)
            filteredDateData[regionNameToID[regionToFind] + (shouldBeSpecialRegion ? "-S" : "")] = {region: regionNameToID[regionToFind] + (shouldBeSpecialRegion ? "-S" : ""), seatClass: classNum, offYear: isOffyear, runoff: isRunoffElection, isSpecial: isSpecialElection, disabled: mapDataRows[0][columnMap.isDisabled] == "TRUE", margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: shouldIncludeVoteshare ? voteshareSortedCandidateData : null, flip: mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID()}
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
          if (regionIDs[regionNum] == nationalPopularVoteID) { continue }

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
                var originalMapData = cloneObject(fullFilteredMapData[filteredMapDates[filteredMapDates.length-1]][regionID])
                originalMapData.altText = "general"
                fullFilteredMapData[mapDate][regionID].altData = originalMapData
                fullFilteredMapData[filteredMapDates[filteredMapDates.length-1]][regionID] = fullFilteredMapData[mapDate][regionID]
              }
            }
          }
        }

        mapDates = filteredMapDates
      }

      return {mapData: fullFilteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
    }

    function mostRecentWinner(mapData, dateToStart, regionID, seatClass, isRunoffElection)
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
        if (regionID in mapDataFromDate && mapDataFromDate[regionID].seatClass == seatClass)
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
        else if ((regionID + "-S") in mapDataFromDate && mapDataFromDate[regionID + "-S"].seatClass == seatClass)
        {
          if (shouldSkipNext)
          {
            shouldSkipNext = false
          }
          else
          {
            return mapDataFromDate[regionID + "-S"].partyID
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

        case "seatClass":
        return regionData.seatClass

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
        return (regionData.isSpecial || regionID.includes("-S")).toString().toUpperCase()

        case "isRunoff":
        return (regionData.runoff == null ? false : regionData.runoff).toString().toUpperCase()

        case "isOffyear":
        return (regionData.offYear == null ? false : regionData.offYear).toString().toUpperCase()

        case "isDisabled":
        return (regionData.disabled == null ? false : regionData.disabled).toString().toUpperCase()
      }
    }

    var CNNSenateResultsMapSource = new MapSource(
      "CNN-2022-Senate-Results", // id
      "CNN Results", // name
      {url: "https://politics.api.cnn.io/results/national-races/2022-SG.json", type: jsonSourceType}, // dataURL
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
          homepageURL += "senate"
        }
        else
        {
          linkToOpen += regionIDToLinkMap[regionID.replace("-S", "")] + "/" + "senate" + (regionID.endsWith("-S") ? "-2" : "")
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

    var FiveThirtyEightSenateProjectionMapSource = new MapSource(
      "538-2022-Senate-Projection", // id
      "538 Projection", // name
      "https://projects.fivethirtyeight.com/2022-general-election-forecast-data/senate_state_toplines_2022.csv", // dataURL
      "https://projects.fivethirtyeight.com/2022-election-forecast/senate/", // homepageURL
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
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage, mapData)
      {
        if (!shouldOpenHomepage && (!mapData || !regionID || !mapDate || !mapData[mapDate.getTime()][regionID])) return

        let isSpecial = false
        if (regionID != null && mapDate != null && mapData != null)
        {
          isSpecial = mapData[mapDate.getTime()][regionID].isSpecial
        }

        let linkToOpen = homepageURL
        if (!shouldOpenHomepage)
        {
          linkToOpen += regionIDToLinkMap[regionID.replace("-S", "")] + (isSpecial ? "-special" : "")
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

    const LTE2022SenateYouTubeIDs = {
      1608336000000: "Wk-T-lXa5-g",
      1612051200000: "yifvg3uHips",
      1614384000000: "wtYw6nmWgQ0",
      1617062400000: "TNHmvLFzD7U",
      1619827200000: "RbpHQboaeWM",
      1622851200000: "DsLq1N8YEkc",
      1625270400000: "AU_GCaD594k",
      1628294400000: "zlC6UzT2xCQ",
      1630627200000: "hY5HsIqfSyQ",
      1633132800000: "SDfCEZF1uH8",
      1635984000000: "rTEnS6Jy9oM",
      1638403200000: "skPfbpMb_g8",
      1640995200000: "BX9mEKXnBEg",
      1643673600000: "nIp2KnNLQUA",
      1646092800000: "oGzo4mVU-w8",
      1649116800000: "i58TKDsXX-Q",
      1651536000000: "a7zKYQbpt2Y",
      1652918400000: "KVLw0DhkJXA",
      1654128000000: "irPIXtfBqCc",
      1655510400000: "gVozPu2PobM",
      1656720000000: "hjJEtK5ZXw4",
      1658102400000: "gKZaNGE1dbM",
      1659830400000: "d9ij_Fh_TWU",
      1662076800000: "r0GEgtLmDk4",
      1663545600000: "oh5hbMGPW2U",
      1664582400000: "BZcjWDI5vVk",
      1665360000000: "Ti9k4SnWmKQ",
      1665964800000: "yZjsiz8y_aQ",
      1666742400000: "yce1GwhrkJk",
      1667347200000: "w-0NoHGXK9E",
      1667779200000: "kMzwdTAF1xM"
    }

    var LTESenateProjectionMapSource = new MapSource(
      "LTE-2022-Senate-Projection", // id
      "LTE Projection", // name
      "./csv-sources/lte-2022-senate.csv", // dataURL
      "https://www.youtube.com/watch?v=", // homepageURL
      {regular: "./assets/lte-large.png", mini: "./assets/lte.png"}, // iconURL
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
      }, // columnMap
      2022, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      null, // regionIDToLinkMap
      heldSeatPartyIDs2022, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      false, // addDecimalPadding
      doubleLineClassSeparatedFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, _, __, mapDate, ___, ____)
      {
        if (mapDate == null) { return }

        var linkToOpen = homepageURL
        linkToOpen += LTE2022SenateYouTubeIDs[mapDate.getUTCAdjustedTime()]
        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      false // shouldShowVoteshare
    )

    const PA2022SenateYouTubeIDs = {
      1614211200000: "Tbsy6XZ_e-Q",
      1615420800000: "xGtBqaMiAU4",
      1616716800000: "KJtDSRW3I7Q",
      1617753600000: "_cZ8OvgwN18",
      1619136000000: "_nWQxmYO2iA",
      1628985600000: "eZGs7_uZ1YM",
      1633824000000: "R9WqiO-j2lY",
      1636156800000: "kAsztlIJm64",
      1639267200000: "Elasgd8mVLE",
      1644624000000: "njSkvysshes",
      1646524800000: "QU_mIwNflqI",
      1651190400000: "D3j334-rfNE"
    }

    var PASenateProjectionMapSource = new MapSource(
      "PA-2022-Senate-Projection", // id
      "PA Projection", // name
      "./csv-sources/pa-2022-senate.csv", // dataURL
      "https://www.youtube.com/watch?v=", // homepageURL
      {regular: "./assets/pa.png", mini: "./assets/pa.png"}, // iconURL
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
      }, // columnMap
      2022, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      null, // regionIDToLinkMap
      heldSeatPartyIDs2022, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      false, // addDecimalPadding
      doubleLineClassSeparatedFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, _, __, mapDate, ___, ____)
      {
        if (mapDate == null) { return }

        var linkToOpen = homepageURL
        linkToOpen += PA2022SenateYouTubeIDs[mapDate.getUTCAdjustedTime()]
        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      false // shouldShowVoteshare
    )

    const Cook2022SenateRatingIDs = {
      1610582400000: "231206",
      1611532800000: "231216",
      1626393600000: "231871",
      1637280000000: "236591",
      1645747200000: "252446",
      1646352000000: "252501",
      1660780800000: "304251",
      1663804800000: "305116",
      1664841600000: "305281",
      1666051200000: "305496",
      1666828800000: "305606",
      1667520000000: "305696",
      1667779200000: ""
    }

    var CookSenateProjectionMapSource = new MapSource(
      "Cook-2022-Senate", // id
      "Cook Political", // name
      "./csv-sources/cook-senate-2022/cook-latest.csv", // dataURL
      "https://cookpolitical.com/ratings/senate-race-ratings/", // homepageURL
      {regular: "./assets/cookpolitical-large.png", mini: "./assets/cookpolitical.png"}, // iconURL
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
      }, // columnMap
      2022, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      null, // regionIDToLinkMap
      heldSeatPartyIDs2022, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      false, // addDecimalPadding
      doubleLineClassSeparatedFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, _, __, mapDate, ____)
      {
        if (mapDate == null) { return }
        window.open(homepageURL + (Cook2022SenateRatingIDs[mapDate.getUTCAdjustedTime()] || ""))
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      false // shouldShowVoteshare
    )

    var SCBSenateProjectionMapSource = new MapSource(
      "SCB-2022-Senate", // id
      "Sabato's CB", // name
      "./csv-sources/scb-2022-senate.csv", // dataURL
      "https://centerforpolitics.org/crystalball/2022-senate/", // homepageURL
      {regular: "./assets/scb.png", mini: "./assets/scb.png"}, // iconURL
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
      }, // columnMap
      2022, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      null, // regionIDToLinkMap
      heldSeatPartyIDs2022, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      false, // addDecimalPadding
      doubleLineClassSeparatedFilterFunction, // organizeMapDataFunction
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
      false // shouldShowVoteshare
    )

    var PastElectionResultMapSource = new MapSource(
      "Past-Senate-Elections", // id
      "Past Elections", // name
      "./csv-sources/past-senate.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      "./assets/wikipedia-large.png", // iconURL
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
      regionNameToIDHistorical, // regionNameToIDMap
      {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"}, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineClassSeparatedFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
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
      "Custom-Senate", // id
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
      doubleLineClassSeparatedFilterFunction, // organizeMapDataFunction
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

    var senateMapSources = {}
    senateMapSources[FiveThirtyEightSenateProjectionMapSource.getID()] = FiveThirtyEightSenateProjectionMapSource
    senateMapSources[LTESenateProjectionMapSource.getID()] = LTESenateProjectionMapSource
    senateMapSources[PASenateProjectionMapSource.getID()] = PASenateProjectionMapSource
    senateMapSources[CookSenateProjectionMapSource.getID()] = CookSenateProjectionMapSource
    senateMapSources[SCBSenateProjectionMapSource.getID()] = SCBSenateProjectionMapSource
    senateMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
    senateMapSources[CustomMapSource.getID()] = CustomMapSource

    var senateMapSourceIDs = [FiveThirtyEightSenateProjectionMapSource.getID(), LTESenateProjectionMapSource.getID(), PASenateProjectionMapSource.getID(), CookSenateProjectionMapSource.getID(), PastElectionResultMapSource.getID()]
    if (customMapEnabled)
    {
      senateMapSourceIDs.push(CustomMapSource.getID())
    }

    const kPastElectionsVsPastElections = 1
    const k538ProjectionVsPastElections = 2

    var defaultSenateCompareSourceIDs = {}
    defaultSenateCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
    defaultSenateCompareSourceIDs[k538ProjectionVsPastElections] = [FiveThirtyEightSenateProjectionMapSource.getID(), PastElectionResultMapSource.getID()]

    return {mapSources: senateMapSources, mapSourceIDs: senateMapSourceIDs, defaultCompareSourceIDs: defaultSenateCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)
