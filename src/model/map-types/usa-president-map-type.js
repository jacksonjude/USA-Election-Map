var USAPresidentMapType = new MapType(
  "USA-President",
  "President",
  "P",
  "assets/usa-pres.png",
  "svg-sources/usa-presidential-map.svg",
  538,
  function(decade, regionID, regionData)
  {
    const splitStates = {"ME": ["ME-AL", "ME-D1", "ME-D2"], "NE": ["NE-AL", "NE-D1", "NE-D2", "NE-D3"]}
    if (splitStates[regionID]) return splitStates[regionID].reduce((total, regionID) => total + this.getEV(decade, regionID, displayRegionDataArray[regionID]), 0)
    if (currentMapSource.isCustom() && regionID in overrideRegionEVs) return overrideRegionEVs[regionID]
    if (currentMapSource.getShouldSetDisabledWorthToZero() && regionData && regionData.disabled) return 0
    return (regionEVArray[decade] || regionEVArray[2020])[regionID]
  },
  true,
  5,
  true,
  true,
  {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District of Columbia","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME-D1":"ME-1","ME-D2":"ME-2","ME-AL":"Maine","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE-D1":"NE-1","NE-D2":"NE-2","NE-D3":"NE-3","NE-AL":"Nebraska","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"},
  [],
  [
    {id: "presViewingType", title: "👁️ Viewing Type", type: MapSettingType.optionCycle, options:
      [
        {id: "popularVotes", title: "State Votes", value: false},
        {id: "electoralVotes", title: "Official EVs", value: true}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "popularVotes", reloadType: MapSettingReloadType.custom, customReloadFunction: (value) => {
      currentViewingState = value ? ViewingState.splitVote : ViewingState.viewing
      if (showingDataMap)
      {
        displayDataMap()
      }
    }},
    {id: "evDecadeOverrideSelection", title: "🕰️ EV Decade", type: MapSettingType.optionCycle, options:
    Object.keys(regionEVArray).map((decade) => {
      return {id: decade, title: decade, value: parseInt(decade)}
    }),
    defaultValue: Object.keys(regionEVArray).reverse()[0], reloadType: MapSettingReloadType.display},
    {id: "evDecadeOverrideToggle", title: "☑️ Override Decade", type: MapSettingType.optionCycle, options:
      [
        {id: "enabled", title: "Enabled", value: true},
        {id: "disabled", title: "Disabled", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "disabled", reloadType: MapSettingReloadType.display}
  ],
  (customMapEnabled) => {
    const partyCandiateLastNames = {2020: {"Biden":DemocraticParty.getID(), "Trump":RepublicanParty.getID()}, 2024: {"Harris":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Kennedy":Independent2024RFKParty.getID()}}
    const partyCandiateFullNames = {2020: {"Joseph R. Biden Jr.":DemocraticParty.getID(), "Donald Trump":RepublicanParty.getID()}, 2024: {"Harris":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Kennedy":Independent2024RFKParty.getID()}}

    const partyIDToCandidateLastNames = {2020: {}, 2024: {}}
    partyIDToCandidateLastNames[2020][DemocraticParty.getID()] = "Biden"
    partyIDToCandidateLastNames[2020][RepublicanParty.getID()] = "Trump"
    partyIDToCandidateLastNames[2024][DemocraticParty.getID()] = "Harris"
    partyIDToCandidateLastNames[2024][RepublicanParty.getID()] = "Trump"
    partyIDToCandidateLastNames[2024][Independent2024RFKParty.getID()] = "Kennedy"

    const currentCycleYear = 2024

    var singleLineMarginFilterFunction = function(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, regionNameToID)
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

          var greaterMarginPartyID = (Math.sign(margin) == 0 ? null : (Math.sign(margin) == -1 ? incumbentChallengerPartyIDs.challenger : incumbentChallengerPartyIDs.incumbent))

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

    var doubleLineMarginFilterFunction = function(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, regionNameToID, heldRegionMap, shouldFilterOutDuplicateRows)
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
          if (mapDataRows.length <= 0 && heldRegionMap)
          {
            marginSum = heldRegionMap[regionNameToID[regionToFind]] == incumbentChallengerPartyIDs.challenger ? -100 : 100
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

            if (mapDataRows[rowNum][columnMap.percentAdjusted] >= 1)
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

            if (partyID == incumbentChallengerPartyIDs.incumbent)
            {
              marginSum += parseFloat(mapDataRows[rowNum][columnMap.percentAdjusted])
              incumbentWinChance = columnMap.winChance ? mapDataRows[rowNum][columnMap.winChance] : null
            }
            else if (partyID == incumbentChallengerPartyIDs.challenger)
            {
              marginSum -= parseFloat(mapDataRows[rowNum][columnMap.percentAdjusted])
              challengerWinChance = columnMap.winChance ? mapDataRows[rowNum][columnMap.winChance] : null
            }
          }

          // if (marginSum == 0 && heldRegionMap) //cuz JHK is stupid and made pollAvg = 0 if there are no polls with no any other indication of such fact
          // {
          //   marginSum = heldRegionMap[regionNameToID[regionToFind]] == partyIDs.challenger ? -100 : 100
          // }

          //cuz JHK is stupid again and used % chances as 100x the size they should be instead of putting them in decimal form like everyone else does it
          challengerWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? challengerWinChance/100 : challengerWinChance
          incumbentWinChance = (incumbentWinChance > 1 || challengerWinChance > 1) ? incumbentWinChance/100 : incumbentWinChance

          var greaterMarginPartyID = incumbentChallengerPartyIDs.tossup
          if (Math.sign(marginSum) == -1)
          {
            greaterMarginPartyID = incumbentChallengerPartyIDs.challenger
          }
          else if (Math.sign(marginSum) == 1)
          {
            greaterMarginPartyID = incumbentChallengerPartyIDs.incumbent
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

          var thisElectionCandidateNameToPartyIDMap = isMultipleElections ? candidateNameToPartyIDMap[currentMapDate.getFullYear()] : candidateNameToPartyIDMap
          var partyIDToCandidateNames = {}
          for (var partyCandidateName in thisElectionCandidateNameToPartyIDMap)
          {
            partyIDToCandidateNames[thisElectionCandidateNameToPartyIDMap[partyCandidateName]] = partyCandidateName
          }

          filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: Math.abs(marginSum), partyID: greaterMarginPartyID, candidateName: candidateName, candidateMap: partyIDToCandidateNames, chanceIncumbent: incumbentWinChance, chanceChallenger: challengerWinChance, partyVotesharePercentages: compactPartyVotesharePercentages}
        }

        filteredMapData[mapDates[dateNum]] = filteredDateData
      }

      return {mapData: filteredMapData, candidateNameData: candidateNameData}
    }

    var doubleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, __, ____, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare)
    {
      var filteredMapData = {}
      var partyNameData = {}

      var regionNames = Object.keys(regionNameToID)

      for (var dateNum in mapDates)
      {
        var rawDateData = rawMapData[mapDates[dateNum]]
        var filteredDateData = {}

        var currentMapDate = new Date(mapDates[dateNum])
        var currentDatePartyNameArray = {}

        for (var regionNum in regionNames)
        {
          var regionToFind = regionNames[regionNum]

          var mapDataRows = rawDateData.filter(row => {
            return row[columnMap.region] == regionToFind
          })

          if (mapDataRows.length == 0)
          {
            let partyIDToCandidateNames = invertObject(candidateNameToPartyIDMap)
            if (isCustomMap)
            {
              filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: 0, partyID: TossupParty.getID(), candidateMap: partyIDToCandidateNames}
            }
            else
            {
              filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: 0, partyID: TossupParty.getID(), disabled: true, candidateMap: partyIDToCandidateNames}
            }
            continue
          }

          var candidateData = {}

          var currentCandidateToPartyIDMap = candidateNameToPartyIDMap
          if (Object.keys(currentCandidateToPartyIDMap).includes(currentMapDate.getFullYear().toString()))
          {
            currentCandidateToPartyIDMap = currentCandidateToPartyIDMap[currentMapDate.getFullYear()]
          }

          for (var rowNum in mapDataRows)
          {
            var row = mapDataRows[rowNum]

            var candidateName = row[columnMap.candidateName]
            var currentPartyName = row[columnMap.partyID]
            var currentVoteshare = parseFloat(row[columnMap.percentAdjusted])
            var currentElectoralVotes = row[columnMap.electoralVotes] ? parseInt(row[columnMap.electoralVotes]) : null
            var currentOrder = row[columnMap.order] ? parseInt(row[columnMap.order]) : null

            var foundParty = currentCandidateToPartyIDMap[candidateName] ? politicalParties[currentCandidateToPartyIDMap[candidateName]] : null

            if (!foundParty)
            {
              foundParty = Object.values(politicalParties).find(party => {
                var partyNames = cloneObject(party.getNames())
                for (var nameNum in partyNames)
                {
                  partyNames[nameNum] = partyNames[nameNum].toLowerCase()
                }
                return partyNames.includes(currentPartyName)
              })
            }

            if (!foundParty && Object.keys(politicalParties).includes(currentPartyName))
            {
              foundParty = politicalParties[currentPartyName]
            }

            if (!foundParty || foundParty.getID() == IndependentGenericParty.getID())
            {
              var foundPartyID = majorThirdPartyCandidates.find(partyID => {
                return politicalParties[partyID].getDefaultCandidateName() == candidateName
              })
              foundParty = politicalParties[foundPartyID]
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
              if (candidateData[candidateName].electoralVotes != null)
              {
                candidateData[candidateName].electoralVotes += currentElectoralVotes ? currentElectoralVotes : 0
              }
            }
            else
            {
              candidateData[candidateName] = {candidate: candidateName, partyID: currentPartyID, voteshare: currentVoteshare, electoralVotes: currentElectoralVotes, order: currentOrder}
            }
          }

          var voteshareSortedCandidateData = Object.values(candidateData).map(singleCandidateData => {
            return {candidate: singleCandidateData.candidate, partyID: singleCandidateData.partyID, voteshare: singleCandidateData.voteshare, order: singleCandidateData.order}
          })
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

          var electoralVoteSortedCandidateData = Object.values(candidateData).map(singleCandidateData => {
            return {candidate: singleCandidateData.candidate, partyID: singleCandidateData.partyID, votes: singleCandidateData.electoralVotes}
          }).filter(candVotes => candVotes.votes != null)
          electoralVoteSortedCandidateData.sort((cand1, cand2) => cand2.votes - cand1.votes)

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
            if (!Object.keys(partyNameData).includes(mainPartyID) && mainPartyID != IndependentGenericParty.getID())
            {
              currentDatePartyNameArray[mainPartyID] = voteshareSortedCandidateData[candidateDataNum].candidate
            }
          }

          var partyIDToCandidateNames = {}
          for (let partyCandidateName in candidateData)
          {
            partyIDToCandidateNames[candidateData[partyCandidateName].partyID] = partyCandidateName
          }

          for (let candidateElectoralVote of electoralVoteSortedCandidateData)
          {
            if (!currentDatePartyNameArray[candidateElectoralVote.partyID] || candidateElectoralVote.partyID == IndependentGenericParty.getID()) { continue }
            currentDatePartyNameArray[candidateElectoralVote.partyID] = candidateElectoralVote.candidate
          }

          var mostRecentParty = mostRecentWinner(filteredMapData, currentMapDate.getTime(), regionNameToID[regionToFind])
          filteredDateData[regionNameToID[regionToFind]] = {region: regionNameToID[regionToFind], margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, disabled: mapDataRows[0][columnMap.disabled] == "true", candidateMap: partyIDToCandidateNames, partyVotesharePercentages: shouldIncludeVoteshare ? voteshareSortedCandidateData : null, voteSplits: electoralVoteSortedCandidateData, flip: mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID()}
        }

        filteredMapData[mapDates[dateNum]] = filteredDateData
        partyNameData[mapDates[dateNum]] = currentDatePartyNameArray
      }

      return {mapData: filteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
    }
    
    var jsonVoteshareFilterFunction = function(rawMapData, _, columnMap, __, candidateNameToPartyIDMap, regionIDMap, heldRegionMap)
    {
      let filteredMapData = {}
      let mapDates = []
    
      let partyIDToCandidateNames = invertObject(candidateNameToPartyIDMap)
      let partyObjects = Object.keys(partyIDToCandidateNames).map(partyID => politicalParties[partyID])
    
      for (let regionData of rawMapData)
      {
        let latestData = regionData.latest
        for (let party in latestData.pv)
        {
          latestData[party] = latestData.pv[party]
        }
        
        let region = regionIDMap[regionData.latest[columnMap.region]]
        
        for (let dateData of [...regionData.timeseries, latestData])
        {
          let date = new Date(dateData[columnMap.date]).getTime()
          if (!mapDates.includes(date))
          {
            mapDates.push(date)
          }
          
          if (!filteredMapData[date])
          {
            filteredMapData[date] = {}
          }
          
          let voteshareSortedCandidateData = []
          
          for (let party of partyObjects)
          {
            voteshareSortedCandidateData.push({candidate: partyIDToCandidateNames[party.getID()], partyID: party.getID(), voteshare: dateData[party.getShortName().toLowerCase()]?.[columnMap.voteshare], winPercentage: dateData[columnMap.winprob]?.[party.getShortName().toLowerCase()]})
          }
          
          let blankCandidateData = voteshareSortedCandidateData.filter((candData) => isNaN(candData.voteshare))
          voteshareSortedCandidateData = voteshareSortedCandidateData.filter((candData) => !isNaN(candData.voteshare))
          
          if (blankCandidateData.length == 1)
          {
            blankCandidateData[0].voteshare = 100-voteshareSortedCandidateData.reduce((agg, curr) => agg += curr.voteshare, 0)
            voteshareSortedCandidateData.push(blankCandidateData[0])
          }
          
          voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          
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
          
          filteredMapData[date][region] = {region: region, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[region] != greatestMarginPartyID}
        }
      }
      
      return {mapData: filteredMapData, mapDates: mapDates.sort()}
    }
    
    var jsonPricesFilterFunction = function(rawMapData, _, columnMap, __, candidateNameToPartyIDMap, regionNameToIDMap, heldRegionMap)
    {
      let filteredMapData = {}
      let mapDates = []
      
      const relativePositiveParty = DemocraticParty.getID()
      const relativeNegativeParty = RepublicanParty.getID()
    
      let partyIDToCandidateNames = invertObject(candidateNameToPartyIDMap)
      let partyObjects = Object.keys(partyIDToCandidateNames).map(partyID => politicalParties[partyID])
    
      for (let regionName in rawMapData)
      {
        let region = regionNameToIDMap[regionName]
        
        for (let dateData of rawMapData[regionName])
        {
          let date = dateData[columnMap.time]*1000
          date -= date % (1000*60*60)
          if (!mapDates.includes(date))
          {
            mapDates.push(date)
          }
          
          if (!filteredMapData[date])
          {
            filteredMapData[date] = {}
          }
          
          let voteshareSortedCandidateData = []
          
          for (let party of partyObjects)
          {
            const partyID = party.getID()
            if (partyID != relativePositiveParty && partyID != relativeNegativeParty) { continue }
            
            const voteshare = dateData[columnMap.price]*100*(partyID == relativeNegativeParty ? -1 : 1)+(partyID == relativeNegativeParty ? 100 : 0)
            voteshareSortedCandidateData.push({candidate: partyIDToCandidateNames[partyID], partyID: partyID, voteshare: voteshare, winPercentage: voteshare})
          }
          
          voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
          
          let greatestValuePartyID
          let greatestValueCandidateName
          let topValue
          
          if (voteshareSortedCandidateData[0].voteshare != 0)
          {
            greatestValuePartyID = voteshareSortedCandidateData[0].partyID
            greatestValueCandidateName = voteshareSortedCandidateData[0].candidate
            topValue = voteshareSortedCandidateData[0].voteshare
          }
          else
          {
            greatestValuePartyID = TossupParty.getID()
            greatestValueCandidateName = null
            topValue = 50
          }
          
          if ((voteshareSortedCandidateData[0].voteshare*2)%2 == 1)
          {
            voteshareSortedCandidateData[1].voteshare -= 0.00001
          }
          
          filteredMapData[date][region] = {region: region, margin: topValue, partyID: greatestValuePartyID, candidateName: greatestValueCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[region] != greatestValuePartyID}
        }
      }
      
      const totalRegions = Object.keys(filteredMapData).reduce((prev, curr) => Math.max(Object.keys(filteredMapData[curr]).length, prev), 0)
      for (const date in filteredMapData)
      {
        if (Object.keys(filteredMapData[date]).length < totalRegions)
        {
          delete filteredMapData[date]
          
          const dateIndex = mapDates.indexOf(parseInt(date))
          if (dateIndex > -1)
          {
            mapDates.splice(dateIndex, 1)
          }
        }
      }
      
      return {mapData: filteredMapData, mapDates: mapDates.sort()}
    }

    var countyFilterFunction = function(rawMapData, mapDates, columnMap, _, __, regionNameToID)
    {
      var filteredMapData = {}
      var partyNameData = {}

      var regionIDs = Object.keys(regionNameToID)

      for (let currentMapDate of mapDates)
      {
        let rawDateData = rawMapData[currentMapDate]
        let filteredDateData = {}

        let currentDatePartyNameArray = {}

        for (let regionID of regionIDs)
        {
          let fullStateRows = rawDateData.filter(row => {
            return row[columnMap.region] == regionID
          })

          if (fullStateRows.length == 0)
          {
            continue
          }

          let stateCountyMap = {}

          for (let countyRow of fullStateRows)
          {
            let countyID = countyRow[columnMap.county]
            if (!stateCountyMap[countyID])
            {
              stateCountyMap[countyID] = []
            }
            stateCountyMap[countyID].push(countyRow)
          }

          filteredDateData[regionID] = stateCountyMap
        }

        filteredMapData[currentMapDate] = filteredDateData
        partyNameData[currentMapDate] = currentDatePartyNameArray
      }

      return {mapData: filteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
    }

    var stateCountyVoteshareFilterFunction = function(stateID, stateCountyRows, currentMapDate, previousMapDateData, columnMap, isCustomMap, voteshareCutoffMargin)
    {
      let filteredStateData = {}

      for (let stateCounty in stateCountyRows)
      {
        let countyRows = stateCountyRows[stateCounty]
        let fullRegionName = stateID + (stateID != nationalPopularVoteID ? "__" + stateCounty : "")

        var candidateData = {}
        var totalVoteshare = 0

        var totalCountyVotes = parseFloat(countyRows[0][columnMap.totalVotes])

        for (var rowNum in countyRows)
        {
          var row = countyRows[rowNum]

          var candidateName = row[columnMap.candidateName]
          var candidateVotes = Math.round(parseFloat(row[columnMap.candidateVotes]))
          var currentVoteshare = candidateVotes/totalCountyVotes*100
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
            candidateData[candidateName].votes += candidateVotes
          }
          else
          {
            candidateData[candidateName] = {candidate: candidateName, partyID: currentPartyID, voteshare: currentVoteshare, votes: candidateVotes, order: currentOrder}
          }

          totalVoteshare += currentVoteshare
        }

        if (totalVoteshare > 100.1)
        {
          console.log("Overflow voteshare!", currentMapDate?.getFullYear()?.toString(), fullRegionName)
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
          console.log("No candidate data!", currentMapDate?.getFullYear()?.toString(), fullRegionName)
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

        var partyIDToCandidateNames = {}
        for (let partyCandidateName in candidateData)
        {
          partyIDToCandidateNames[candidateData[partyCandidateName].partyID] = partyCandidateName
        }

        var mostRecentParty = previousMapDateData?.[fullRegionName]?.partyID
        filteredStateData[fullRegionName] = {region: fullRegionName, state: stateID, county: stateCounty, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, totalVotes: totalCountyVotes, flip: mostRecentParty != null && mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID()}
      }

      return filteredStateData
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

        case "partyID":
        return partyID || electionYearToCandidateData[currentCycleYear || 2020][candidateName]

        case "percentAdjusted":
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

        case "order":
        voteshareData = regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.order
        }
        return ""

        case "region":
        if (regionNameToID)
        {
          return getKeyByValue(regionNameToID, regionID) ?? regionID
        }
        else
        {
          return regionID
        }

        case "disabled":
        return regionData.disabled || false
      }
    }
    
    function customCountyMapConvertMapDataToCSVFunction(columnKey, mapDateString, regionID, _, candidateName, partyID, regionData, shouldUseVoteshare)
    {
      switch (columnKey)
      {
        case "date":
        return mapDateString
    
        case "candidateName":
        return candidateName
    
        case "partyID":
        return partyID || electionYearToCandidateData[currentCycleYear || 2020][candidateName]
    
        case "candidateVotes":
        voteshareData = shouldUseVoteshare && regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.voteshare*100
        }
        else if (regionData.partyID == partyID)
        {
          return regionData.margin
        }
        return 0
        
        case "totalVotes":
        return 100*100
        
        case "order":
        voteshareData = regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.order
        }
        return ""
    
        case "county":
        return regionID.split(subregionSeparator)[1]
        
        case "region": // state
        return regionID.split(subregionSeparator)[0]
    
        case "disabled":
        return regionData.disabled || false
      }
    }

    const electionYearToCandidateData = {
      1788: {"Washington":IndependentGWParty.getID()},
      1792: {"Washington":IndependentGWParty.getID()},
      1796: {"Jefferson":DemocraticRepublicanParty.getID(), "Adams":FederalistParty.getID()},
      1800: {"Jefferson":DemocraticRepublicanParty.getID(), "Adams":FederalistParty.getID()},
      1804: {"Jefferson":DemocraticRepublicanParty.getID(), "Pinckney":FederalistParty.getID()},
      1808: {"Madison":DemocraticRepublicanParty.getID(), "Pinckney":FederalistParty.getID(), "Clinton":Independent1808GCParty.getID()},
      1812: {"Madison":DemocraticRepublicanParty.getID(), "Clinton":FederalistParty.getID()},
      1816: {"Monroe":DemocraticRepublicanParty.getID(), "King":FederalistParty.getID()},
      1820: {"Monroe":DemocraticRepublicanParty.getID(), "Adams":Independent1820JAParty.getID()},
      1824: {"Adams":DemocraticRepublicanParty.getID(), "Jackson":Independent1824AJParty.getID(), "Crawford":Independent1824WCParty.getID(), "Clay":Independent1824HCParty.getID(), "Other":IndependentGenericParty.getID()},
      1828: {"Jackson":DemocraticParty.getID(), "Adams":NationalRepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1832: {"Jackson":DemocraticParty.getID(), "Clay":NationalRepublicanParty.getID(), "Wirt":Independent1832WWParty.getID(), "Floyd":Independent1832JFParty.getID(), "Other":IndependentGenericParty.getID()},
      1836: {"Van Buren":DemocraticParty.getID(), "Harrison":WhigParty.getID(), "White":Independent1836HWParty.getID(), "Webster":Independent1836DWParty.getID(), "Magnum":Independent1836WMParty.getID(), "Other":IndependentGenericParty.getID()},
      1840: {"Van Buren":DemocraticParty.getID(), "Harrison":WhigParty.getID(), "Other":IndependentGenericParty.getID()},
      1844: {"Polk":DemocraticParty.getID(), "Clay":WhigParty.getID(), "Birney":Independent1844JBParty.getID(), "Other":IndependentGenericParty.getID()},
      1848: {"Cass":DemocraticParty.getID(), "Taylor":WhigParty.getID(), "Van Buren":FreeSoilParty.getID(), "Other":IndependentGenericParty.getID()},
      1852: {"Pierce":DemocraticParty.getID(), "Scott":WhigParty.getID(), "Hale":FreeSoilParty.getID(), "Other":IndependentGenericParty.getID()},
      1856: {"Buchanan":DemocraticParty.getID(), "Fremont":RepublicanParty.getID(), "Fillmore":Independent1856MFParty.getID(), "Other":IndependentGenericParty.getID()},
      1860: {"Douglas":DemocraticParty.getID(), "Lincoln":RepublicanParty.getID(), "Breckenridge":Independent1860JohnBreckenridgeParty.getID(), "Bell":Independent1860JohnBellParty.getID(), "Other":IndependentGenericParty.getID()},
      1864: {"McClellan":DemocraticParty.getID(), "Lincoln":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1868: {"Seymour":DemocraticParty.getID(), "Grant":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1872: {"Greeley":DemocraticParty.getID(), "Grant":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1876: {"Tilden":DemocraticParty.getID(), "Hayes":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1880: {"Hancock":DemocraticParty.getID(), "Garfield":RepublicanParty.getID(), "Weaver":Independent1892JWParty.getID(), "Other":IndependentGenericParty.getID()},
      1884: {"Cleveland":DemocraticParty.getID(), "Blaine":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1888: {"Cleveland":DemocraticParty.getID(), "Harrison":RepublicanParty.getID(), "Fisk":Independent1888CFParty.getID(), "Other":IndependentGenericParty.getID()},
      1892: {"Cleveland":DemocraticParty.getID(), "Harrison":RepublicanParty.getID(), "Weaver":Independent1892JWParty.getID(), "Bidwell":Independent1892JBParty.getID(), "Other":IndependentGenericParty.getID()},
      1896: {"Bryan":DemocraticParty.getID(), "McKinley":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1900: {"Bryan":DemocraticParty.getID(), "McKinley":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1904: {"Parker":DemocraticParty.getID(), "Roosevelt":RepublicanParty.getID(), "Debs":Independent1912EDParty.getID(), "Other":IndependentGenericParty.getID()},
      1908: {"Bryan":DemocraticParty.getID(), "Taft":RepublicanParty.getID(), "Debs":Independent1912EDParty.getID(), "Other":IndependentGenericParty.getID()},
      1912: {"Wilson":DemocraticParty.getID(), "Taft":RepublicanParty.getID(), "Roosevelt":Independent1912TRParty.getID(), "Debs":Independent1912EDParty.getID(), "Other":IndependentGenericParty.getID()},
      1916: {"Wilson":DemocraticParty.getID(), "Hughes":RepublicanParty.getID(), "Benson":Independent1916ABParty.getID(), "Other":IndependentGenericParty.getID()},
      1920: {"Cox":DemocraticParty.getID(), "Harding":RepublicanParty.getID(), "Debs":Independent1920EDParty.getID(), "Other":IndependentGenericParty.getID()},
      1924: {"Davis":DemocraticParty.getID(), "Coolidge":RepublicanParty.getID(), "La Follette":Independent1924RLParty.getID(), "Other":IndependentGenericParty.getID()},
      1928: {"Smith":DemocraticParty.getID(), "Hoover":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1932: {"Roosevelt":DemocraticParty.getID(), "Hoover":RepublicanParty.getID(), "Thomas":Independent1932NTParty.getID(), "Other":IndependentGenericParty.getID()},
      1936: {"Roosevelt":DemocraticParty.getID(), "Landon":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1940: {"Roosevelt":DemocraticParty.getID(), "Willkie":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1944: {"Roosevelt":DemocraticParty.getID(), "Dewey":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1948: {"Truman":DemocraticParty.getID(), "Dewey":RepublicanParty.getID(), "Thurmond":Independent1948SMParty.getID(), "Wallace":Independent1948HWParty.getID(), "Other":IndependentGenericParty.getID()},
      1952: {"Stevenson":DemocraticParty.getID(), "Eisenhower":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1956: {"Stevenson":DemocraticParty.getID(), "Eisenhower":RepublicanParty.getID(), "Jones":Independent1956WJParty.getID(), "Other":IndependentGenericParty.getID()},
      1960: {"Kennedy":DemocraticParty.getID(), "Nixon":RepublicanParty.getID(), "Byrd":Independent1960HBParty.getID(), "Other":IndependentGenericParty.getID()},
      1964: {"Johnson":DemocraticParty.getID(), "Goldwater":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1968: {"Humphrey":DemocraticParty.getID(), "Nixon":RepublicanParty.getID(), "Wallace":Independent1968GWParty.getID(), "Other":IndependentGenericParty.getID()},
      1972: {"McGovern":DemocraticParty.getID(), "Nixon":RepublicanParty.getID(), "Other":IndependentGenericParty.getID()},
      1976: {"Carter":DemocraticParty.getID(), "Ford":RepublicanParty.getID(), "McCarthy":Independent1976EMParty.getID(), "Reagan": Independent1976RRParty.getID()},
      1980: {"Carter":DemocraticParty.getID(), "Reagan":RepublicanParty.getID(), "Anderson":Independent1980JAParty.getID(), "Clark":LibertarianParty.getID()},
      1984: {"Mondale":DemocraticParty.getID(), "Reagan":RepublicanParty.getID(), "Bergland":LibertarianParty.getID()},
      1988: {"Dukakis":DemocraticParty.getID(), "Bush":RepublicanParty.getID(), "Paul":LibertarianParty.getID(), "Bentsen": Independent1988LBParty.getID()},
      1992: {"Clinton":DemocraticParty.getID(), "Bush":RepublicanParty.getID(), "Perot":ReformParty.getID(), "Marrou":LibertarianParty.getID()},
      1996: {"Clinton":DemocraticParty.getID(), "Dole":RepublicanParty.getID(), "Perot":ReformParty.getID(), "Nader":GreenParty.getID(), "Browne":LibertarianParty.getID()},
      2000: {"Gore":DemocraticParty.getID(), "Bush":RepublicanParty.getID(), "Nader":GreenParty.getID(), "Buchanan":ReformParty.getID(), "Browne":LibertarianParty.getID()},
      2004: {"Kerry":DemocraticParty.getID(), "Bush":RepublicanParty.getID(), "Nader":IndependentRNParty.getID(), "Badnarik":LibertarianParty.getID(), "Edwards": Independent2004JEParty.getID()},
      2008: {"Obama":DemocraticParty.getID(), "McCain":RepublicanParty.getID(), "Nader":IndependentRNParty.getID(), "Barr":LibertarianParty.getID()},
      2012: {"Obama":DemocraticParty.getID(), "Romney":RepublicanParty.getID(), "Johnson":LibertarianParty.getID(), "Stein":GreenParty.getID()},
      2016: {"Clinton":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Johnson":LibertarianParty.getID(), "Stein":GreenParty.getID(), "McMullin":Independent2016EMParty.getID(), "Powell":Independent2016CPParty.getID(), "Sanders":Independent2016BSParty.getID(), "Paul":Independent2016RPParty.getID(), "Kasich":Independent2016JKParty.getID(), "Spotted Eagle":Independent2016SEParty.getID()},
      2020: {"Biden":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Jorgensen":LibertarianParty.getID(), "Hawkins":GreenParty.getID()},
      2024: {"Harris":DemocraticParty.getID(), "Trump":RepublicanParty.getID(), "Kennedy":Independent2024RFKParty.getID()}
    }
    
    const ev2016Values = {"AL":2, "AK":2, "AZ":2, "AR":2, "CA":1, "CO":1, "CT":1, "DE":1, "DC":1, "FL":2, "GA":2, "HI":1, "ID":2, "IL":1, "IN":2, "IA":2, "KS":2, "KY":2, "LA":2, "ME-D1":1, "ME-D2":2, "ME-AL":1, "MD":1, "MA":1, "MI":2, "MN":1, "MS":2, "MO":2, "MT":2, "NE-D1":2, "NE-D2":2, "NE-D3":2, "NE-AL":2, "NV":1, "NH":1, "NJ":1, "NM":1, "NY":1, "NC":2, "ND":2, "OH":2, "OK":2, "OR":1, "PA":2, "RI":1, "SC":2, "SD":2, "TN":2, "TX":2, "UT":2, "VT":1, "VA":1, "WA":1, "WV":2, "WI":2, "WY":2}
    const ev2016 = {}
    Object.keys(ev2016Values).forEach((state) => {
      ev2016[state] = [DemocraticParty.getID(), RepublicanParty.getID()][ev2016Values[state]-1]
    })
    
    const ev2020Values = {"AL":2, "AK":2, "AZ":1, "AR":2, "CA":1, "CO":1, "CT":1, "DE":1, "DC":1, "FL":2, "GA":1, "HI":1, "ID":2, "IL":1, "IN":2, "IA":2, "KS":2, "KY":2, "LA":2, "ME-D1":1, "ME-D2":2, "ME-AL":1, "MD":1, "MA":1, "MI":1, "MN":1, "MS":2, "MO":2, "MT":2, "NE-D1":2, "NE-D2":1, "NE-D3":2, "NE-AL":2, "NV":1, "NH":1, "NJ":1, "NM":1, "NY":1, "NC":2, "ND":2, "OH":2, "OK":2, "OR":1, "PA":1, "RI":1, "SC":2, "SD":2, "TN":2, "TX":2, "UT":2, "VT":1, "VA":1, "WA":1, "WV":2, "WI":1, "WY":2}
    const ev2020 = {}
    Object.keys(ev2020Values).forEach((state) => {
      ev2020[state] = [DemocraticParty.getID(), RepublicanParty.getID()][ev2020Values[state]-1]
    })

    const regionNameToIDFiveThirtyEight = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
    const regionIDToIDFiveThirtyEight = {"AL":"AL", "AK":"AK", "AZ":"AZ", "AR":"AR", "CA":"CA", "CO":"CO", "CT":"CT", "DE":"DE", "DC":"DC", "FL":"FL", "GA":"GA", "HI":"HI", "ID":"ID", "IL":"IL", "IN":"IN", "IA":"IA", "KS":"KS", "KY":"KY", "LA":"LA", "ME-01":"ME-D1", "ME-02":"ME-D2", "ME":"ME-AL", "MD":"MD", "MA":"MA", "MI":"MI", "MN":"MN", "MS":"MS", "MO":"MO", "MT":"MT", "NE-01":"NE-D1", "NE-02":"NE-D2", "NE-03":"NE-D3", "NE":"NE-AL", "NV":"NV", "NH":"NH", "NJ":"NJ", "NM":"NM", "NY":"NY", "NC":"NC", "ND":"ND", "OH":"OH", "OK":"OK", "OR":"OR", "PA":"PA", "RI":"RI", "SC":"SC", "SD":"SD", "TN":"TN", "TX":"TX", "UT":"UT", "VT":"VT", "VA":"VA", "WA":"WA", "WV":"WV", "WI":"WI", "WY":"WY"}
    const regionNameToIDCook = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Washington DC":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD":"NE-D2", "Nebraska 3rd CD":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"}
    const regionNameToIDPolymarket = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Washington DC":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "National":nationalPopularVoteID}
    const regionNameToIDHistorical = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME-AL", "Maine 1st CD":"ME-D1", "Maine 2nd CD":"ME-D2", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE-AL", "Nebraska 1st CD":"NE-D1", "Nebraska 2nd CD": "NE-D2", "Nebraska 3rd CD":"NE-D3", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "National Popular Vote":nationalPopularVoteID}
    const regionNameToIDCounty = {"AL":"AL", "AK":"AK", "AZ":"AZ", "AR":"AR", "CA":"CA", "CO":"CO", "CT":"CT", "DE":"DE", "DC":"DC", "FL":"FL", "GA":"GA", "HI":"HI", "ID":"ID", "IL":"IL", "IN":"IN", "IA":"IA", "KS":"KS", "KY":"KY", "LA":"LA", "ME":"ME", "MD":"MD", "MA":"MA", "MI":"MI", "MN":"MN", "MS":"MS", "MO":"MO", "MT":"MT", "NE":"NE", "NV":"NV", "NH":"NH", "NJ":"NJ", "NM":"NM", "NY":"NY", "NC":"NC", "ND":"ND", "OH":"OH", "OK":"OK", "OR":"OR", "PA":"PA", "RI":"RI", "SC":"SC", "SD":"SD", "TN":"TN", "TX":"TX", "UT":"UT", "VT":"VT", "VA":"VA", "WA":"WA", "WV":"WV", "WI":"WI", "WY":"WY", [nationalPopularVoteID]:nationalPopularVoteID}
    const regionNameToIDCustom = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "National Popular Vote":nationalPopularVoteID}

    var FiveThirtyEightPollAverageMapSource = new MapSource(
      "538-2020-Presidential-PollAvg", // id
      "538 Poll Avg", // name
      "https://projects.fivethirtyeight.com/polls/data/presidential_general_averages.csv", // dataURL
      "https://projects.fivethirtyeight.com/polls/president-general/", // homepageURL
      {regular: "./assets/fivethirtyeight-large.png", mini: "./assets/fivethirtyeight.png"}, // iconURL
      {
        date: "date",
        region: "state",
        candidateName: "candidate",
        percentAdjusted: "pct_estimate"
      }, // columnMap
      2024, // cycleYear
      partyCandiateFullNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionNameToIDFiveThirtyEight, // regionNameToIDMap
      {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine/1", "ME-D2":"maine/2", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska/1", "NE-D2":"nebraska/2", "NE-D3":"nebraska/3", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}, // regionIDToLinkMap
      ev2020, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineMarginFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      null // updateCustomMapFunction
    )

    var FiveThirtyEightProjectionMapSource = new MapSource(
      "538-2024-Presidential-Projection", // id
      "538 Projection", // name
      {url: "https://projects.fivethirtyeight.com/2024-election-forecast/states_timeseries.json", type: jsonSourceType}, // dataURL
      "https://projects.fivethirtyeight.com/2024-election-forecast/", // homepageURL
      {regular: "./assets/fivethirtyeight-large.png", mini: "./assets/fivethirtyeight.png"}, // iconURL
      {
        date: "date",
        region: "state",
        voteshare: "median",
        winprob: "winprob"
      }, // columnMap
      2024, // cycleYear
      partyCandiateLastNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionIDToIDFiveThirtyEight, // regionNameToIDMap
      {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "DC":"district-of-columbia", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"maine-1", "ME-D2":"maine-2", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"nebraska-1", "NE-D2":"nebraska-2", "NE-D3":"nebraska-3", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}, // regionIDToLinkMap
      ev2020, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshareFilterFunction, // organizeMapDataFunction
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
    )

    var CookProjectionMapSource = new MapSource(
      "Cook-2020-Presidential", // id
      "Cook Political", // name
      "./csv-sources/cook-pres-2020/cook-latest.csv", // dataURL
      "./csv-sources/cook-pres-2020/", // homepageURL
      {regular: "./assets/cookpolitical-large.png", mini: "./assets/cookpolitical.png"}, // iconURL
      {
        date: "date",
        region: "region",
        margin: "margin"
      }, // columnMap
      2020, // cycleYear
      partyCandiateLastNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionNameToIDCook, // regionNameToIDMap
      null, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      false, // addDecimalPadding
      singleLineMarginFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, _, __, mapDate, ___)
      {
        if (mapDate == null) { return }
        window.open(homepageURL + mapDate.getFullYear() + zeroPadding(mapDate.getMonth()+1) + mapDate.getDate() + ".pdf")
      }, // customOpenRegionLinkFunction
      null // updateCustomMapFunction
    )
    
    var PolymarketPricesMapSource = new MapSource(
      "Polymarket-2024-Presidential", // id
      "Polymarket", // name
      {url: "https://jacksonjude.com/USA-Election-Map-Data/data/2024-president-polymarket-prices.json", type: jsonSourceType}, // dataURL
      "https://polymarket.com", // homepageURL
      {regular: "./assets/polymarket-large.png", mini: "./assets/polymarket.png"}, // iconURL
      {
        time: "t",
        price: "p"
      }, // columnMap
      2024, // cycleYear
      partyCandiateLastNames, // candidateNameToPartyIDMap
      partyIDToCandidateLastNames, // shortCandidateNameOverride
      regionNameToIDPolymarket, // regionNameToIDMap
      {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":["delaware", "-2024"], "DC":"washington-dc", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME-D1":"congressional-district-1st-maine", "ME-D2":"congressional-district-2nd-maine", "ME-AL":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE-D1":"congressional-district-1st-nebraska", "NE-D2":"congressional-district-2nd-nebraska", "NE-D3":"congressional-district-3rd-nebraska", "NE-AL":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":["new-mexico", "-2024"], "NY":["new-york", "-2024"], "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}, // regionIDToLinkMap
      ev2020, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonPricesFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      null, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, _, shouldOpenHomepage)
      {
        var linkToOpen = homepageURL
        if (shouldOpenHomepage)
        {
          linkToOpen += "/elections"
        }
        else
        {
          const linkData = regionIDToLinkMap[regionID]
          const dataIsArray = Array.isArray(linkData)
          
          linkToOpen += "/event/" + (dataIsArray ? linkData[0] : linkData) + "-presidential-election-winner" + (dataIsArray && linkData.length > 1 ? linkData[1] : "")
        }
        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      false, // shouldShowVoteshare
      null, // voteshareCutoffMargin,
      null, // overrideSVGPath,
      null, // shouldSetDisabledWorthToZero
      null, // shouldUseOriginalMapDataForTotalsPieChart
      null, // shouldForcePopularVoteDisplayOnZoom
      {safe: 90, likely: 75, lean: 55, tilt: Number.MIN_VALUE}, // customDefaultMargins
      '', // customVotesharePrefix
      '¢', // customVoteshareSuffix
    )

    var getPresidentialSVGFromDate = async function(dateTime)
    {
      var dateYear = (new Date(dateTime)).getFullYear()

      if (currentViewingState == ViewingState.zooming || currentMapType.getMapSettingValue("showAllDistricts"))
      {
        if (currentMapZoomRegion.includes("-"))
        {
          let stateID = currentMapZoomRegion.split("-")[0]
          if (stateID == "NE" || stateID == "ME")
          {
            currentMapZoomRegion = stateID
          }
        }
        if (await PastElectionResultMapSource.canZoom(PastElectionResultMapSource.getMapData(), currentMapZoomRegion))
        {
          return ["svg-sources/usa-counties-map.svg", currentMapZoomRegion]
        }
        else
        {
          return ["svg-sources/usa-governor-map.svg", currentMapZoomRegion]
        }
      }

      if (dateYear < 1820)
      {
        return "svg-sources/usa-presidential-pre-1820-map.svg"
      }
      else if (dateYear < 1864)
      {
        return "svg-sources/usa-presidential-pre-1864-map.svg"
      }
      else if (dateYear < 1960)
      {
        return "svg-sources/usa-presidential-pre-1960-map.svg"
      }
      else if (dateYear < 1972)
      {
        return "svg-sources/usa-presidential-pre-1972-map.svg"
      }
      else  if (dateYear < 1992)
      {
        return "svg-sources/usa-presidential-pre-1992-map.svg"
      }
      else
      {
        return "svg-sources/usa-presidential-map.svg"
      }
    }

    var pastElectoralVoteCounts = async (mapDateData) => {
      if (new Date(getCurrentDateOrToday()).getFullYear() >= 1824 && currentMapType.getMapSettingValue("presViewingType") === false && currentViewingState == ViewingState.splitVote)
      {
        currentViewingState = ViewingState.viewing
        return mapDateData
      }

      let voteSplitMapDateData = {}

      for (let regionID in mapDateData)
      {
        let regionData = cloneObject(mapDateData[regionID])
        voteSplitMapDateData[regionID] = regionData
        if (mapDateData[regionID].disabled) { continue }
        if (!regionData.voteSplits || !regionData.voteSplits[0])
        {
          let currentRegionEV = currentMapType.getEV(getCurrentDecade(), regionID, regionData)
          regionData.voteSplits = [{partyID: regionData.partyID, candidate: regionData.candidateMap && regionData.candidateMap[regionData.partyID], votes: currentRegionEV}]
        }
        regionData.margin = 100
        regionData.partyID = regionData.voteSplits[0].partyID
      }

      if (Object.keys(voteSplitMapDateData).length == 0) { return mapDateData }

      return voteSplitMapDateData
    }

    var countyViewingDataFunction = async (organizedCountyData) => {
      let stateCandidateData = {}
      let stateTotalVotes = {}

      for (let state in organizedCountyData)
      {
        let mapDateData = stateCountyVoteshareFilterFunction(state, organizedCountyData[state], null, null, CountyElectionResultMapSource.columnMap, false, CountyElectionResultMapSource.voteshareCutoffMargin)
        
        stateCandidateData[state] = {}
        stateTotalVotes[state] = 0
        
        for (let regionData of Object.values(mapDateData))
        {
          stateTotalVotes[state] += regionData.totalVotes
          
          regionData.partyVotesharePercentages.forEach(candidateData => {
            if (!stateCandidateData[state][candidateData.candidate])
            {
              stateCandidateData[state][candidateData.candidate] = {...candidateData}
            }
            else
            {
              stateCandidateData[state][candidateData.candidate].votes += candidateData.votes
            }
          })
        }
      }

      let aggregatedMapDateData = {}
      for (let state in stateCandidateData)
      {
        let voteshareSortedCandidateData = Object.values(stateCandidateData[state]).map(candidateData => {
          return {...candidateData, voteshare: candidateData.votes/stateTotalVotes[state]*100}
        })
        
        voteshareSortedCandidateData = voteshareSortedCandidateData.filter((candData) => !isNaN(candData.voteshare))
        voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
        if (CountyElectionResultMapSource.voteshareCutoffMargin != null)
        {
          voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= CountyElectionResultMapSource.voteshareCutoffMargin)
        }
        
        if (voteshareSortedCandidateData.length == 0)
        {
          console.log("No candidate data!", currentMapDate?.getFullYear()?.toString(), fullRegionName)
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
        
        var partyIDToCandidateNames = {}
        for (let candidateData of voteshareSortedCandidateData)
        {
          partyIDToCandidateNames[candidateData.partyID] = candidateData.candidate
        }
        
        aggregatedMapDateData[state] = {region: state, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, totalVotes: stateTotalVotes[state]}
      }

      return aggregatedMapDateData
    }

    var countyZoomingDataFunction = async (presidentialMapDateData, regionID, isZoomCheck, date, mapSource = CountyElectionResultMapSource) => {
      if (!mapSource.getMapData() || (!isZoomCheck && !(await CSVDatabase.isSourceUpdated(mapSource.getID()))))
      {
        if (isZoomCheck) { return false }

        await mapSource.loadMap()
      }
      let organizedCountyData = mapSource.getMapData()[date ?? currentSliderDate.getTime()]

      if (isZoomCheck) { return (organizedCountyData != null && (!regionID || organizedCountyData[regionID] != null) ) || (showingCompareMap && currentMapSource.isCustom()) }

      let previousMapDateIndex = mapSource.getMapDates().findIndex(mapDate => mapDate == date ?? currentSliderDate.getTime())-1
      let previousMapDateData
      if (previousMapDateIndex >= 0)
      {
        let previousDate = mapSource.getMapDates()[previousMapDateIndex]
        let previousOrganizedCountyData = mapSource.getMapData()[previousDate]
        previousMapDateData = stateCountyVoteshareFilterFunction(currentMapZoomRegion, previousOrganizedCountyData[currentMapZoomRegion], new Date(previousDate), null, mapSource.columnMap, false, mapSource.voteshareCutoffMargin)
      }

      let mapDateData = organizedCountyData != null && (!regionID || organizedCountyData[regionID] != null) ? stateCountyVoteshareFilterFunction(currentMapZoomRegion, organizedCountyData[currentMapZoomRegion], new Date(date) ?? currentSliderDate, previousMapDateData, mapSource.columnMap, false, mapSource.voteshareCutoffMargin) : null

      let countyZoomData = {}

      let popularVoteRegionIDToUse = currentMapZoomRegion
      if (popularVoteRegionIDToUse == "NE" || popularVoteRegionIDToUse == "ME")
      {
        popularVoteRegionIDToUse += "-AL"
      }

      if (presidentialMapDateData[popularVoteRegionIDToUse])
      {
        let statePopularVoteID = currentMapZoomRegion + subregionSeparator + statePopularVoteDistrictID
        countyZoomData[statePopularVoteID] = cloneObject(presidentialMapDateData[popularVoteRegionIDToUse])
        countyZoomData[statePopularVoteID].region = statePopularVoteID
      }

      if (mapDateData != null)
      {
        for (let regionID in mapDateData)
        {
          if (mapDateData[regionID].state == currentMapZoomRegion)
          {
            countyZoomData[regionID] = mapDateData[regionID]
            countyZoomData[regionID].voteWorth = 1
          }
        }
      }
      else
      {
        countyZoomData[currentMapZoomRegion] = cloneObject(presidentialMapDateData[popularVoteRegionIDToUse])
        countyZoomData[currentMapZoomRegion].region = currentMapZoomRegion
      }

      return countyZoomData
    }

    var PastElectionResultMapSource = new MapSource(
      "Past-Presidential-Elections", // id
      "Past Elections", // name
      "./csv-sources/past-president.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      {regular: "./assets/wikipedia-large.png", mini: "./assets/wikipedia-large.png", getOverlayText: () => {
        let currentYear = currentSliderDate.getFullYear()
        return currentYear
      }}, // iconURL
      {
        date: "date",
        region: "region",
        percentAdjusted: "voteshare",
        electoralVotes: "ev",
        partyID: "party",
        partyCandidateName: "candidate",
        candidateName: "candidate"
      }, // columnMap
      null, // cycleYear
      electionYearToCandidateData, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "DC":"the_District_of_Columbia", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME-D1":"Maine", "ME-D2":"Maine", "ME-AL":"Maine", "ME":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE-D1":"Nebraska", "NE-D2":"Nebraska", "NE-D3":"Nebraska", "NE-AL":"Nebraska", "NE":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"}, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      (rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, __, ___, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare) => {
        CountyElectionResultMapSource.loadMap()
        return doubleLineVoteshareFilterFunction(rawMapData, mapDates, columnMap, _, candidateNameToPartyIDMap, regionNameToID, __, ___, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare)
      }, // organizeMapDataFunction
      null, // viewingDataFunction
      countyZoomingDataFunction, // zoomingDataFunction
      pastElectoralVoteCounts, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: false, showSplitVoteBoxes: false}, // splitVoteDisplayOptions
      (regionID) => {
        if (!regionID || !regionID.includes(subregionSeparator)) { return regionID }

        let state = regionID.split(subregionSeparator)[0]
        let county = regionID.split(subregionSeparator)[1].replace(/_s$/, "'s").replaceAll("_", " ")

        return county + ", " + state
      }, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
      {
        if (mapDate == null) { return }

        if (regionID && regionID.includes(subregionSeparator))
        {
          regionID = regionID.split(subregionSeparator)[0]
        }

        var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_presidential_election"
        if (!shouldOpenHomepage)
        {
          linkToOpen += "_in_" + regionIDToLinkMap[regionID]
        }
        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      getPresidentialSVGFromDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      null, // shouldUseOriginalMapDataForTotalsPieChart
      true // shouldForcePopularVoteDisplayOnZoom
    )

    var HistoricalElectionResultMapSource = new MapSource(
      "Historical-Presidential-Elections", // id
      "Older Elections", // name
      "./csv-sources/historical-president.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      {regular: "./assets/wikipedia-large.png", mini: "./assets/wikipedia-large.png", getOverlayText: () => {
        let currentYear = currentSliderDate.getFullYear()
        return currentYear
      }}, // iconURL
      {
        date: "date",
        region: "region",
        percentAdjusted: "voteshare",
        electoralVotes: "ev",
        partyCandidateName: "candidate",
        partyID: "party",
        candidateName: "candidate"
      }, // columnMap
      null, // cycleYear
      electionYearToCandidateData, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "DC":"the_District_of_Columbia", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME-D1":"Maine", "ME-D2":"Maine", "ME-AL":"Maine", "ME":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE-D1":"Nebraska", "NE-D2":"Nebraska", "NE-D3":"Nebraska", "NE-AL":"Nebraska", "NE":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"}, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      async (mapDateData) => {
        if (new Date(getCurrentDateOrToday()).getFullYear() >= 1824)
        {
          return mapDateData
        }
        else
        {
          currentViewingState = ViewingState.splitVote
          return await pastElectoralVoteCounts(mapDateData)
        }
      }, // viewingDataFunction
      null, // zoomingDataFunction
      pastElectoralVoteCounts, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      null, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
      {
        if (mapDate == null) { return }

        var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_presidential_election"
        if (!shouldOpenHomepage)
        {
          linkToOpen += "_in_" + regionIDToLinkMap[regionID]
        }
        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      getPresidentialSVGFromDate, // overrideSVGPath
      true // shouldSetDisabledWorthToZero
    )

    var CountyElectionResultMapSource = new MapSource(
      "Presidential-Counties", // id
      "County Results", // name
      "./csv-sources/past-president-county.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      "./assets/wikipedia-large.png", // iconURL
      {
        date: "date",
        region: "state",
        candidateVotes: "candidatevotes",
        totalVotes: "totalvotes",
        partyID: "party",
        candidateName: "candidate",
        county: "county"
      }, // columnMap
      null, // cycleYear
      electionYearToCandidateData, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDCounty, // regionNameToIDMap
      {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "DC":"the_District_of_Columbia", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME-D1":"Maine", "ME-D2":"Maine", "ME-AL":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE-D1":"Nebraska", "NE-D2":"Nebraska", "NE-D3":"Nebraska", "NE-AL":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"}, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      countyFilterFunction, // organizeMapDataFunction
      countyViewingDataFunction, // viewingDataFunction
      countyZoomingDataFunction, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      (regionID) => {
        if (!regionID.includes(subregionSeparator)) { return regionID }

        let state = regionID.split(subregionSeparator)[0]
        let county = regionID.split(subregionSeparator)[1].replace(/_s$/, "'s").replaceAll("_", " ")

        return county + ", " + state
      }, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage)
      {
        if (mapDate == null || !regionID.includes(subregionSeparator)) { return }

        var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_presidential_election"
        if (!shouldOpenHomepage)
        {
          linkToOpen += "_in_" + regionIDToLinkMap[regionID.split(subregionSeparator)[0]]
        }
        window.open(linkToOpen)
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      () => {
        if (currentViewingState == ViewingState.viewing)
        {
          return "svg-sources/usa-governor-map.svg"
        }

        return ["svg-sources/usa-counties-map.svg", currentMapZoomRegion]
      } // overrideSVGPath
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
      "Custom-Presidential", // id
      "Custom", // name
      null, // dateURL
      null, // homepageURL
      {getOverlayText: () => {
        const isPastElectionCompare = showingCompareMap && compareMapSourceIDArray.every(sourceID => 
          sourceID == PastElectionResultMapSource.getID() ||
          sourceID == CountyElectionResultMapSource.getID() ||
          sourceID == HistoricalElectionResultMapSource.getID()
        )
        if (!isPastElectionCompare) { return null }
        
        let compareYears = [$("#firstCompareDataMapDateSlider"), $("#secondCompareDataMapDateSlider")]
          .map(slider => slider.val()-1)
          .map(dateIndex => PastElectionResultMapSource.getMapDates()[dateIndex])
          .map(dateTime => new Date(dateTime).getFullYear())
        
        let compareYearsText = [compareYears[0], "↕️", compareYears[1]]
          .map(text => `<div>${text}</div>`)
          .join("")
        
        return compareYearsText
      }}, // iconURL
      {
        date: "date",
        region: "region",
        disabled: "disabled",
        candidateName: "candidate",
        partyID: "party",
        percentAdjusted: "percent",
        order: "order"
      }, // columnMap
      null, // cycleYear
      partyNamesToIDs, // candidateNameToPartyIDMap
      idsToPartyNames, // shortCandidateNameOverride
      regionNameToIDCustom, // regionNameToIDMap
      null, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      null, // viewingDataFunction
      async (mapDateData, regionID, isZoomCheck, date) => {
        const isPastElectionCompare = showingCompareMap && compareMapSourceIDArray[0] == PastElectionResultMapSource.getID() && compareMapSourceIDArray[1] == PastElectionResultMapSource.getID()
        
        if (isZoomCheck)
        {
          return isPastElectionCompare
        }
        
        if (!isZoomCheck && isPastElectionCompare)
        {
          getCompareMajorParties = () => [$("#firstCompareDataMapDateSlider"), $("#secondCompareDataMapDateSlider")]
            .map(slider => slider.val()-1)
            .map(dateIndex => PastElectionResultMapSource.getMapData()[PastElectionResultMapSource.getMapDates()[dateIndex]])
            .map(mapData => mapData?.[nationalPopularVoteID]?.partyVotesharePercentages)
            .map(popularVoteshares => popularVoteshares?.filter(voteshareData => voteshareData.voteshare >= 5))
            .map(popularVoteshares => popularVoteshares?.map(voteshareData => voteshareData.partyID))
          
          compareMapSourceIDArray = [CountyElectionResultMapSource.getID(), CountyElectionResultMapSource.getID()]
          compareResultCustomMapSource = CustomCountyMapSource
          shouldSetCompareMapSource = false
          await updateCompareMapSources([true, true], true, false, [$("#firstCompareDataMapDateSlider").val(), $("#secondCompareDataMapDateSlider").val()])
          
          shouldSetCompareMapSource = true
        }
        
        let countyZoomingData = await countyZoomingDataFunction(mapDateData, regionID, isZoomCheck, date, CustomCountyMapSource)
        if (showingCompareMap && compareMapSourceIDArray[0] == CountyElectionResultMapSource.getID() && compareMapSourceIDArray[1] == CountyElectionResultMapSource.getID())
        {
          delete countyZoomingData[regionID + subregionSeparator + statePopularVoteDistrictID]
        }
        return countyZoomingData
      }, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      (regionID) => {
        if (!regionID.includes(subregionSeparator)) { return regionID }
      
        let state = regionID.split(subregionSeparator)[0]
        let county = regionID.split(subregionSeparator)[1].replace(/_s$/, "'s").replaceAll("_", " ")
      
        return county + ", " + state
      }, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      customMapConvertMapDataToCSVFunction, // convertMapDataRowToCSVFunction
      true, // isCustomMap
      false, // shouldClearDisabled
      null, // shouldShowVoteshare
      null, // voteshareCutoffMargin
      getPresidentialSVGFromDate, // overrideSVGPath
      true // shouldSetDisabledWorthToZero
    )
    
    var CustomCountyMapSource = new MapSource(
      "Custom-Presidential-Counties", // id
      "Custom County", // name
      null, // dataURL
      null, // homepageURL
      null, // iconURL
      {
        date: "date",
        region: "state",
        candidateVotes: "candidatevotes",
        totalVotes: "totalvotes",
        partyID: "party",
        candidateName: "candidate",
        county: "county",
        order: "order"
      }, // columnMap
      null, // cycleYear
      partyNamesToIDs, // candidateNameToPartyIDMap
      idsToPartyNames, // shortCandidateNameOverride
      regionNameToIDCounty, // regionNameToIDMap
      null, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      countyFilterFunction, // organizeMapDataFunction
      countyViewingDataFunction, // viewingDataFunction
      (presidentialMapDateData, regionID, isZoomCheck, date) => {
        return countyZoomingDataFunction(presidentialMapDateData, regionID, isZoomCheck, date, CustomCountyMapSource)
      }, // zoomingDataFunction
      null, // splitVoteDataFunction
      null, // splitVoteDisplayOptions
      (regionID) => {
        if (!regionID.includes(subregionSeparator)) { return regionID }
      
        let state = regionID.split(subregionSeparator)[0]
        let county = regionID.split(subregionSeparator)[1].replace(/_s$/, "'s").replaceAll("_", " ")
      
        return county + ", " + state
      }, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      customCountyMapConvertMapDataToCSVFunction, // convertMapDataRowToCSVFunction
      true, // isCustomMap
      false, // shouldClearDisabled
      null, // shouldShowVoteshare
      null, // voteshareCutoffMargin
      () => {
        if (currentViewingState == ViewingState.viewing)
        {
          return "svg-sources/usa-governor-map.svg"
        }
    
        return ["svg-sources/usa-counties-map.svg", currentMapZoomRegion]
      }, // overrideSVGPath
      true // shouldSetDisabledWorthToZero
    )

    var todayDate = new Date()
    CustomMapSource.setTextMapData("date\n" + (todayDate.getMonth()+1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear())

    var presidentialMapSources = {}
    presidentialMapSources[FiveThirtyEightPollAverageMapSource.getID()] = FiveThirtyEightPollAverageMapSource
    presidentialMapSources[FiveThirtyEightProjectionMapSource.getID()] = FiveThirtyEightProjectionMapSource
    presidentialMapSources[CookProjectionMapSource.getID()] = CookProjectionMapSource
    presidentialMapSources[PolymarketPricesMapSource.getID()] = PolymarketPricesMapSource
    presidentialMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
    presidentialMapSources[HistoricalElectionResultMapSource.getID()] = HistoricalElectionResultMapSource
    presidentialMapSources[CountyElectionResultMapSource.getID()] = CountyElectionResultMapSource
    presidentialMapSources[CustomMapSource.getID()] = CustomMapSource
    presidentialMapSources[CustomCountyMapSource.getID()] = CustomCountyMapSource

    var presidentialMapSourceIDs = [FiveThirtyEightProjectionMapSource.getID(), PolymarketPricesMapSource.getID(), PastElectionResultMapSource.getID(), HistoricalElectionResultMapSource.getID()]
    if (customMapEnabled)
    {
      presidentialMapSourceIDs.push(CustomMapSource.getID())
    }

    const kPastElectionsVsPastElections = 1
    const kPastElectionsVs538Projection = 2

    var defaultPresidentialCompareSourceIDs = {}
    defaultPresidentialCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
    defaultPresidentialCompareSourceIDs[kPastElectionsVs538Projection] = [PastElectionResultMapSource.getID(), FiveThirtyEightProjectionMapSource.getID()]

    return {mapSources: presidentialMapSources, mapSourceIDs: presidentialMapSourceIDs, defaultCompareSourceIDs: defaultPresidentialCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)

const incumbentChallengerPartyIDs = {incumbent: RepublicanParty.getID(), challenger: DemocraticParty.getID(), tossup: TossupParty.getID()}
