const USAHouseMapType = new MapType(
  "USA-House",
  "House",
  "H",
  "assets/usa-house.png",
  "svg-sources/usa-governor-map.svg", // use governor (single state) by default before zoom
  50,
  function(decade, regionID)
  {
    return (regionEVArray[decade] || regionEVArray[2020])[regionID]-2 || 1
  },
  false,
  2,
  true,
  true,
  true,
  false,
  {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming"},
  [],
  [
    {id: "showAllDistricts", title: "🇺🇸 National View", type: MapSettingType.optionCycle, options:
      [
        {id: "totals", title: "Show Totals", value: false},
        {id: "all", title: "Show Districts", value: true}
      ],
    defaultValue: "totals", reloadType: MapSettingReloadType.display},
    {id: "showStateDistricts", title: "🏳️ State View", type: MapSettingType.optionCycle, options:
      [
        {id: "boxes", title: "Show Boxes", value: false},
        {id: "districts", title: "Show Districts", value: true}
      ],
    defaultValue: "districts", reloadType: MapSettingReloadType.display},
    {id: "zoomSeatTotals", title: "🧮 Seat Totals", type: MapSettingType.optionCycle, options:
      [
        {id: "all", title: "All Seats", value: false},
        {id: "selected", title: "Selected State", value: true}
      ],
    defaultValue: "selected", reloadType: MapSettingReloadType.display}
  ],
  () => {
    const regionNameToIDHistorical = {"AL":"AL", "AK":"AK", "AZ":"AZ", "AR":"AR", "CA":"CA", "CO":"CO", "CT":"CT", "DE":"DE", "FL":"FL", "GA":"GA", "HI":"HI", "ID":"ID", "IL":"IL", "IN":"IN", "IA":"IA", "KS":"KS", "KY":"KY", "LA":"LA", "ME":"ME", "MD":"MD", "MA":"MA", "MI":"MI", "MN":"MN", "MS":"MS", "MO":"MO", "MT":"MT", "NE":"NE", "NV":"NV", "NH":"NH", "NJ":"NJ", "NM":"NM", "NY":"NY", "NC":"NC", "ND":"ND", "OH":"OH", "OK":"OK", "OR":"OR", "PA":"PA", "RI":"RI", "SC":"SC", "SD":"SD", "TN":"TN", "TX":"TX", "UT":"UT", "VT":"VT", "VA":"VA", "WA":"WA", "WV":"WV", "WI":"WI", "WY":"WY", [nationalPopularVoteID]:nationalPopularVoteID}
    
    const regionIDToLinkBase = {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}
    const regionIDToLinkHistorical = {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"}
    
    const jsonVoteshareCNNFilterFunction = function(rawMapData, _, columnMap, __, ___, ____, heldRegionMap, ______, _______, voteshareCutoffMargin)
    {
      let racesToIgnore = []
      let candidateExceptions = {"None of these candidates": "None"}
      let unopposedRaceDefaults = {
        "FL__20": DemocraticParty.getID(),
        "OK__3": RepublicanParty.getID()
      }

      let mapDate = new Date(rawMapData[0][columnMap.date]).getTime()

      let mapData = {[mapDate]: {}}
      let partyNameArray = {[mapDate]: {}}

      let stateDistrictCounts = {}

      for (let raceData of rawMapData)
      {
        let raceKey = raceData[columnMap.raceKey]
        if (racesToIgnore.includes(raceKey)) continue

        let state = raceData[columnMap.state]
        let district = raceData[columnMap.district]
        let regionID = state + subregionSeparator + district

        if (!stateDistrictCounts[state])
        {
          stateDistrictCounts[state] = 1
        }
        else
        {
          stateDistrictCounts[state] += 1
        }

        let totalVotes = raceData[columnMap.totalVotes]
        let reportingPercent = raceData[columnMap.reportingPercent]
        // let calledRace = raceData[columnMap.calledRace] == "called"

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

          formattedCandidatesArray.push({candidate: candidateName, partyID: partyID, voteshare: totalVotes > 0 ? candidateVotes/totalVotes*100 : 0, votes: candidateVotes})
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
        
        const isHold = reportingPercent <= 0 && unopposedRaceDefaults[regionID] != null

        mapData[mapDate][regionID] = {region: regionID, state: state, district: district, margin: topTwoMargin, isHold: isHold, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[regionID] != greatestMarginPartyID, reportingPercent: reportingPercent, totalVotes: totalVotes}
      }

      for (let state of Object.keys(stateDistrictCounts).filter(state => stateDistrictCounts[state] == 1))
      {
        let regionData = cloneObject(mapData[mapDate][state + subregionSeparator + "1"])
        delete mapData[mapDate][state + subregionSeparator + "1"]
        regionData.district = "0"
        regionData.region = state + subregionSeparator + "0"
        regionData.flip = heldRegionMap[regionData.region] != regionData.partyID
        mapData[mapDate][state + subregionSeparator + "0"] = regionData
      }

      return {mapData: mapData, candidateNameData: partyNameArray, mapDates: [mapDate]}
    }

    const singleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, __, ___, ____, _____, ______, voteshareCutoffMargin)
    {
      let mapData = {}
      let partyNameData = {}

      const deluxeProjectionType = "_deluxe"
      const candidateColumns = {[DemocraticParty.getID()]: ["D1", "D2", "D3", "D4"], [RepublicanParty.getID()]: ["R1", "R2", "R3", "R4"], [IndependentGenericParty.getID()]: ["I1", "O1"]}
      const candidateNameColumnPrefix = "name_"
      const candidateVoteshareColumnPrefix = "voteshare_mean_"
      const candidateWinColumnPrefix = "winner_"
      const netPartyMarginColumn = "mean_netpartymargin"

      const districtsToUsePartyForMargin = ["AK__1", "LA__5", "LA__3"]

      let partyNames = Object.keys(candidateColumns).reduce((partyMap, partyID) => {
        partyMap[partyID] = politicalParties[partyID].getNames()[0]
        return partyMap
      }, {})

      for (let mapDate of mapDates)
      {
        let rawDateData = rawMapData[mapDate].filter(mapRow => mapRow[columnMap.pollType] == deluxeProjectionType)
        let dateData = {}

        let stateDistrictCounts = {}

        for (let mapRow of rawDateData)
        {
          let [_, state, district] = /(\w\w)-(\d\d?)/.exec(mapRow[columnMap.region])
          let regionID = state + subregionSeparator + district

          if (!stateDistrictCounts[state])
          {
            stateDistrictCounts[state] = 1
          }
          else
          {
            stateDistrictCounts[state] += 1
          }

          let candidateArray = []

          for (let partyID in candidateColumns)
          {
            for (let candidateID of candidateColumns[partyID])
            {
              let candidateName = mapRow[candidateNameColumnPrefix + candidateID]
              if (candidateName == "") continue

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
          let isHold = false

          if (districtsToUsePartyForMargin.includes(regionID))
          {
            topTwoMargin = parseFloat(mapRow[netPartyMarginColumn])
            greatestMarginPartyID = Math.sign(topTwoMargin) == 1 ? DemocraticParty.getID() : RepublicanParty.getID()
            greatestMarginCandidateName = politicalParties[greatestMarginPartyID].getNames()[0]
            topTwoMargin = Math.abs(topTwoMargin)
          }
          else if (voteshareSortedCandidateData[0].voteshare != 0)
          {
            greatestMarginPartyID = voteshareSortedCandidateData[0].partyID
            greatestMarginCandidateName = voteshareSortedCandidateData[0].candidate
            if (candidateArray.length == 1)
            {
              topTwoMargin = 100
              isHold = true
            }
            else
            {
              topTwoMargin = voteshareSortedCandidateData[0].voteshare - (voteshareSortedCandidateData[1] ? voteshareSortedCandidateData[1].voteshare : 0)
              topTwoMargin = topTwoMargin == 0 ? 100 : topTwoMargin
            }
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

          dateData[regionID] = {region: regionID, state: state, district: district, margin: topTwoMargin, isHold: isHold, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: false}
        }

        for (let state of Object.keys(stateDistrictCounts).filter(state => stateDistrictCounts[state] == 1))
        {
          let regionData = cloneObject(dateData[state + subregionSeparator + "1"])
          delete dateData[state + subregionSeparator + "1"]
          regionData.district = "0"
          regionData.region = state + subregionSeparator + "0"
          dateData[state + subregionSeparator + "0"] = regionData
        }

        mapData[mapDate] = dateData
        partyNameData[mapDate] = partyNames
      }

      return {mapData: mapData, candidateNameData: partyNameData, mapDates: mapDates}
    }

    const doubleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, __, regionNameToID, ___, _____, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare)
    {
      let filteredMapData = {}
      let partyNameData = {}

      let regionNames = Object.keys(regionNameToID)
      
      const partyAffiliationSetting = currentMapType.getMapSettings()["partyAffiliations"]

      for (let dateNum in mapDates)
      {
        let rawDateData = rawMapData[mapDates[dateNum]]
        let filteredDateData = {}

        let currentMapDate = new Date(mapDates[dateNum])
        let currentDatePartyNameArray = {}

        for (let regionNum in regionNames)
        {
          let regionToFind = regionNames[regionNum]

          let fullStateRows = rawDateData.filter(row => {
            return row[columnMap.region] == regionToFind
          })

          if (fullStateRows.length == 0)
          {
            if (isCustomMap && regionNameToID[regionToFind] != nationalPopularVoteID)
            {
              let partyIDToCandidateNames = {}
              for (let partyID of mainPoliticalPartyIDs)
              {
                partyIDToCandidateNames[partyID] = politicalParties[partyID].getNames()[0]
              }

              let decadeToFillFrom = getDecadeFromDate(currentMapDate)
              if (decadeToFillFrom > 2020)
              {
                decadeToFillFrom = 2020 // default/fallback to 2020 map
              }

              let regionHouseSeatCount = USAHouseMapType.getEV(decadeToFillFrom, regionNameToID[regionToFind])
              for (let districtNumber in [...Array(regionHouseSeatCount).keys()])
              {
                if (regionHouseSeatCount > 1)
                {
                  districtNumber = (parseInt(districtNumber)+1).toString()
                }
                filteredDateData[regionNameToID[regionToFind] + subregionSeparator + districtNumber] = {region: regionNameToID[regionToFind] + subregionSeparator + districtNumber, state: regionNameToID[regionToFind], margin: 0, partyID: TossupParty.getID(), candidateMap: partyIDToCandidateNames}
              }
            }
            continue
          }

          let stateDistricts = [...new Set(fullStateRows.map(row => {
            return row[columnMap.district]
          }))]

          if (stateDistricts.length == 0)
          {
            console.log(regionToFind, currentMapDate)
          }

          for (let stateDistrict of stateDistricts)
          {
            let districtRows = fullStateRows.filter(row => {
              return row[columnMap.district] == stateDistrict
            })

            let fullRegionName = regionToFind + (regionToFind != nationalPopularVoteID ? subregionSeparator + stateDistrict : "")

            let candidateData = {}

            for (let rowNum in districtRows)
            {
              let row = districtRows[rowNum]

              let candidateName = row[columnMap.candidateName]
              let currentVoteshare = parseFloat(row[columnMap.voteshare])
              let currentOrder = row[columnMap.order] ? parseInt(row[columnMap.order]) : null

              let currentPartyName
              if (partyAffiliationSetting == "ballot" && columnMap.ballotPartyID && row[columnMap.ballotPartyID])
              {
                currentPartyName = row[columnMap.ballotPartyID]
              }
              else
              {
                currentPartyName = row[columnMap.partyID]
              }
              
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

              let currentPartyID
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

            let voteshareSortedCandidateData = Object.values(candidateData)
            voteshareSortedCandidateData = voteshareSortedCandidateData.filter((candData) => !isNaN(candData.voteshare))
            voteshareSortedCandidateData.sort((cand1, cand2) => cand2.voteshare - cand1.voteshare)
            if (!isCustomMap && voteshareCutoffMargin != null)
            {
              voteshareSortedCandidateData = voteshareSortedCandidateData.filter(candData => candData.voteshare >= voteshareCutoffMargin)
            }

            if (voteshareSortedCandidateData.length == 0)
            {
              console.log("No candidate data!", currentMapDate.getFullYear().toString(), fullRegionName)
              continue
            }

            let greatestMarginPartyID
            let greatestMarginCandidateName
            let topTwoMargin
            let isHold = false

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
              if (!isCustomMap && Object.keys(candidateData).length == 1)
              {
                topTwoMargin = 100
                isHold = true
              }
              else
              {
                topTwoMargin = topCandidateData[0].voteshare - (topCandidateData[1] ? topCandidateData[1].voteshare : 0)
                topTwoMargin = !isCustomMap && topTwoMargin == 0 ? 100 : topTwoMargin
              }
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

            const mostRecentPartyID = mostRecentWinner(filteredMapData, currentMapDate.getTime(), fullRegionName).partyID
            filteredDateData[fullRegionName] = {region: fullRegionName, state: regionToFind, district: stateDistrict, margin: topTwoMargin, isHold: isHold, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: shouldIncludeVoteshare ? voteshareSortedCandidateData : null, flipOverride: districtRows[0][columnMap.flip] == "TRUE", previousPartyID: mostRecentPartyID}
          }
        }

        filteredMapData[mapDates[dateNum]] = filteredDateData
        partyNameData[mapDates[dateNum]] = currentDatePartyNameArray
      }

      return {mapData: filteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
    }
    
    const jsonVoteshare538FilterFunction = function(rawMapData, _, columnMap, __, ___, ____, heldSeatDataMap)
    {
      let filteredMapData = {}
      let mapDates = []
    
      for (let regionData of rawMapData)
      {
        let region = regionData.latest[columnMap.region]
        let rawPartyIDToCandidateNames = regionData.latest[columnMap.candidates]
        const candidateToRawPartyID = invertObject(rawPartyIDToCandidateNames)
        
        let candidateToPartyID = {}
        for (let partyID in rawPartyIDToCandidateNames)
        {
          const candidate = rawPartyIDToCandidateNames[partyID]
          const formattedPartyID = partyID.replace(/\d/, "").toUpperCase()
          
          candidateToPartyID[candidate] = politicalParties[formattedPartyID] ? formattedPartyID : IndependentGenericParty.getID()
        }
        
        for (let dateData of regionData.timeseries)
        {
          let date = new Date(`${dateData[columnMap.date]} 12:00`).getTime()
          if (!mapDates.includes(date))
          {
            mapDates.push(date)
          }
          
          if (!filteredMapData[date])
          {
            filteredMapData[date] = {}
          }
          
          let voteshareSortedCandidateData = []
          
          for (let candidate in candidateToPartyID)
          {
            const partyObject = politicalParties[candidateToPartyID[candidate]] ?? IndependentGenericParty
            const rawPartyID = candidateToRawPartyID[candidate]
            
            voteshareSortedCandidateData.push({candidate: candidate, partyID: partyObject.getID(), voteshare: dateData[rawPartyID]?.[columnMap.voteshare], winPercentage: dateData[columnMap.winprob]?.[rawPartyID]})
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
          
          let stateDistrictPair = region.replace("-", subregionSeparator).replace(new RegExp(`${subregionSeparator}0`), subregionSeparator).split(subregionSeparator)
          
          const decade = getDecadeFromDate(new Date(date))          
          const stateSeatCount = USAHouseMapType.getEV(decade, stateDistrictPair[0])
          if (stateSeatCount == 1)
          {
            stateDistrictPair[1] = 0
          }
          
          const formattedRegion = stateDistrictPair.join(subregionSeparator)
          
          filteredMapData[date][formattedRegion] = {region: formattedRegion, state: stateDistrictPair[0], district: stateDistrictPair[1], margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: invertObject(candidateToPartyID), partyVotesharePercentages: voteshareSortedCandidateData, flip: heldSeatDataMap[formattedRegion].partyID != greatestMarginPartyID}
        }
      }
      
      return {mapData: filteredMapData, mapDates: mapDates.sort()}
    }
    
    const jsonVoteshareVotehubFilterFunction = function(rawMapData, _, columnMap, __, ___, ____, heldSeatMapData)
    {
      const filteredMapData = {}
      const mapDates = []
      
      const partyLetterToID = {
        'D': DemocraticParty.getID(),
        'R': RepublicanParty.getID(),
        'I': IndependentGenericParty.getID()
      }
      
      const partyAffiliationSetting = currentMapType.getMapSettings()["partyAffiliations"]
      
      for (const regionData of rawMapData)
      {
        const region = regionData[columnMap.region]
        const district = regionData[columnMap.district]
        const rawCandidates = regionData[columnMap.candidates]
        
        const candidateList = []
        const partyIDToCandidateName = {}
        for (const rawCandidate of rawCandidates)
        {
          const candidatePartyID = partyLetterToID[partyAffiliationSetting == "ballot" ? rawCandidate.party : rawCandidate.caucus]
          
          const candidate = {
            id: rawCandidate.id,
            name: rawCandidate.name,
            partyID: candidatePartyID ?? IndependentGenericParty.getID()
          }
          candidate.name ??= politicalParties[candidate.partyID].getNames()[0]
          candidateList.push(candidate)
          partyIDToCandidateName[candidate.partyID] = candidate.name
        }
        
        for (const dateData of regionData.timeseries)
        {
          const date = new Date(`${dateData[columnMap.date]} 12:00`).getTime()
          if (!mapDates.includes(date))
          {
            mapDates.push(date)
          }
          
          if (!filteredMapData[date])
          {
            filteredMapData[date] = {}
          }
          
          let voteshareSortedCandidateData = []
          
          for (const candidate of candidateList)
          {
            const candidateDateData = dateData.candidates.find(c => c.id == candidate.id)
            
            const voteshare = candidateDateData?.[columnMap.voteshare]
            const margin = columnMap.margin ? candidateDateData?.[columnMap.margin] : undefined
            const rawWinPercentage = candidateDateData?.[columnMap.winprob]
            
            voteshareSortedCandidateData.push({candidate: candidate.name, partyID: candidate.partyID, voteshare: voteshare, margin: margin, winPercentage: !isNaN(rawWinPercentage) ? 100*rawWinPercentage : undefined})
          }
          
          const blankCandidateData = voteshareSortedCandidateData.filter((candData) => isNaN(candData.voteshare))
          voteshareSortedCandidateData = voteshareSortedCandidateData.filter((candData) => !(isNaN(candData.voteshare)))
          
          if (blankCandidateData.length == 1)
          {
            if (voteshareSortedCandidateData.length == 1 && voteshareSortedCandidateData[0].margin)
            {
              blankCandidateData[0].voteshare = voteshareSortedCandidateData[0].voteshare - voteshareSortedCandidateData[0].margin
            }
            else
            {
              blankCandidateData[0].voteshare = 100-voteshareSortedCandidateData.reduce((agg, curr) => agg += curr.voteshare, 0)
            }
            
            blankCandidateData[0].winPercentage = isNaN(blankCandidateData[0].winPercentage) ? 100-voteshareSortedCandidateData.reduce((agg, curr) => agg += curr.winPercentage, 0) : blankCandidateData[0].winPercentage
            voteshareSortedCandidateData.push(blankCandidateData[0])
          }
          else if (blankCandidateData.length > 1)
          {
            console.log(`Multiple blank candidates for ${region}/${district}/${date}!`)
            console.log(blankCandidateData, dateData)
            continue
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
          
          const state = region
          const formattedRegion = `${state}${subregionSeparator}${district}`
          
          filteredMapData[date][formattedRegion] = {region: formattedRegion, state: state, district: district, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateName, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldSeatMapData[formattedRegion].partyID != greatestMarginPartyID}
        }
      }
      
      return {mapData: filteredMapData, mapDates: mapDates.sort()}
    }
    
    const getPastElectionHeldSeats = async function(cycleYear, regionNameToID)
    {
      let heldSeatMapData = null
      const previousElectionCycleYear = cycleYear-2
      
      if (await PastElectionResultMapSource.loadMap())
      {
        const pastMapData = PastElectionResultMapSource.getMapData()
        
        let cycleDate = PastElectionResultMapSource.getMapDates().find(mapDate => new Date(mapDate).getFullYear() == cycleYear)
        // use 11/1 as fallback future date if current election cycle has not occurred yet
        cycleDate ??= new Date(cycleYear, 11-1, 1).getTime()
        
        heldSeatMapData = Object.keys(pastMapData[PastElectionResultMapSource.getMapDates().at(-1)])
          .reduce((compiledMapData, regionID) => {
            compiledMapData[regionID] = mostRecentWinner(pastMapData, cycleDate, regionID)
            return compiledMapData
          }, {})
      }
      
      return heldSeatMapData
    }
    
    const jsonVoteshare538FilterFunctionWithPastElections = async (rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, regionNameToID) => {
      const heldSeatMapData = await getPastElectionHeldSeats(cycleYear, regionNameToID)
      return jsonVoteshare538FilterFunction(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, regionNameToID, heldSeatMapData)
    }
    
    const jsonVoteshareVotehubFilterFunctionWithPastElections = async (rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, regionNameToID) =>
    {
      const heldSeatMapData = await getPastElectionHeldSeats(cycleYear, regionNameToID)
      return jsonVoteshareVotehubFilterFunction(rawMapData, mapDates, columnMap, cycleYear, candidateNameToPartyIDMap, regionNameToID, heldSeatMapData)
    }

    function mostRecentWinner(mapData, dateToStart, regionID)
    {
      let reversedMapDates = cloneObject(Object.keys(mapData)).reverse()

      let startYear = (new Date(parseInt(dateToStart))).getFullYear()

      for (let dateNum in reversedMapDates)
      {
        if (reversedMapDates[dateNum] >= parseInt(dateToStart)) { continue }

        let currentYear = (new Date(parseInt(reversedMapDates[dateNum]))).getFullYear()

        if (startYear-currentYear > 2)
        {
          return {margin: 0, partyID: TossupParty.getID()}
        }

        let mapDataFromDate = mapData[reversedMapDates[dateNum]]
        if (regionID in mapDataFromDate)
        {
          return {margin: mapDataFromDate[regionID].margin, partyID: mapDataFromDate[regionID].partyID, candidateName: mapDataFromDate[regionID].candidateName, candidateMap: mapDataFromDate[regionID].candidateMap, partyVotesharePercentages: mapDataFromDate[regionID].partyVotesharePercentages, electionDate: parseInt(reversedMapDates[dateNum])}
        }
      }

      return {margin: 0, partyID: TossupParty.getID()}
    }

    function customMapConvertMapDataToCSVFunction(columnKey, mapDateString, regionID, _, candidateName, partyID, regionData, shouldUseVoteshare)
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
        return regionData.state || regionID.split(subregionSeparator)[0]

        case "district":
        return regionData.district || regionID.split(subregionSeparator)[1]

        case "partyID":
        return partyID

        case "order":
        voteshareData = regionData.partyVotesharePercentages ? regionData.partyVotesharePercentages.find(partyVoteshare => candidateName == partyVoteshare.candidate) : null
        if (voteshareData)
        {
          return voteshareData.order
        }
        return ""
        
        case "flip":
        return (regionData.flip ?? false).toString().toUpperCase()
      }
    }

    const getHouseSVGFromDate = function(dateTime)
    {
      let zoomRegion = currentMapZoomRegion

      if (currentViewingState == ViewingState.viewing && !currentMapType.getMapSettingValue("showAllDistricts"))
      {
        return "svg-sources/usa-governor-map.svg"
      }

      if ((currentViewingState == ViewingState.viewing && currentMapType.getMapSettingValue("showAllDistricts")) || (currentViewingState == ViewingState.zooming && currentMapType.getMapSettingValue("showStateDistricts")))
      {
        let dateYear = (new Date(dateTime)).getFullYear()
        
        const svgYears = [2026, 2024, 2022, 2020, 2018, 2016, 2012, 2006, 2004, 2002, 1998, 1996, 1994, 1992, 1984, 1982, 1976]
        
        for (const year of svgYears)
        {
          if (dateYear >= year)
          {
            return [`svg-sources/usa-house-${year}-map.svg`, zoomRegion]
          }
        }
      }

      return ["svg-sources/usa-governor-map.svg", zoomRegion, true, (mapDateData) => {
        $("#outlines").children().each(function() {
          if ($(this).attr(isDistrictBoxRegionAttribute) !== undefined)
          {
            $(this).remove()
          }
          else
          {
            $(this).attr(noInteractSVGRegionAttribute, "")
            $(this).attr(noCountSVGRegionAttribute, "")
          }
        })

        const districtBoxesPerLine = 6

        let boundingBoxParts = $("#svgdata")[0].getAttribute("data-viewBox").split(" ").map(s => parseFloat(s))
        let boundingBox = {x: boundingBoxParts[0], y: boundingBoxParts[1], width: boundingBoxParts[2], height: boundingBoxParts[3]}

        let districtCount = Object.keys(mapDateData).length - (Object.keys(mapDateData).some(regionID => regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) ? 1 : 0)

        let districtBoxSize = Math.max(boundingBox.width, boundingBox.height)*0.07
        let districtBoxPadding = districtBoxSize/5
        let districtBoxCornerRadius = districtBoxSize/10

        let startingX = boundingBox.x + boundingBox.width/2 - (districtBoxesPerLine*(districtBoxSize+districtBoxPadding)-districtBoxPadding/2)/2
        let startingY = boundingBox.y + boundingBox.height/2 - (Math.ceil(districtCount/districtBoxesPerLine)*(districtBoxSize+districtBoxPadding)-districtBoxPadding/2)/2

        let districtBoxLineCount = Math.floor(districtCount/districtBoxesPerLine)+1

        let itemsOnLastLine = districtCount%districtBoxesPerLine > 0 ? districtCount%districtBoxesPerLine : districtBoxesPerLine
        let lastLineXOffset = (districtBoxesPerLine-itemsOnLastLine)*(districtBoxSize+districtBoxPadding)/2

        let outlineGroupHTML = ""
        outlineGroupHTML += "<rect " + isDistrictBoxRegionAttribute + " " + noInteractSVGRegionAttribute + " " + noCountSVGRegionAttribute + " fill='gray' fill-opacity='0.7' width='" + ((districtBoxLineCount == 1 ? itemsOnLastLine : districtBoxesPerLine)*(districtBoxSize+districtBoxPadding)+districtBoxPadding) + "' height='" + (Math.ceil(districtCount/districtBoxesPerLine)*(districtBoxSize+districtBoxPadding)+districtBoxPadding) + "' x='" + (startingX-districtBoxPadding+(districtBoxLineCount == 1 ? lastLineXOffset : 0)) + "' y='" + (startingY-districtBoxPadding) + "' rx='" + districtBoxCornerRadius + "' ry='" + districtBoxCornerRadius  + "'></rect>"
        Object.keys(mapDateData).forEach((regionID, i) => {
          if (regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) { return }

          let districtBoxLineOn = Math.floor(i/districtBoxesPerLine)
          outlineGroupHTML += "<rect " + isDistrictBoxRegionAttribute + " id='" + regionID + "' width='" + districtBoxSize + "' height='" + districtBoxSize + "' x='" + (startingX + i%districtBoxesPerLine*(districtBoxSize+districtBoxPadding) + (districtBoxLineOn == districtBoxLineCount-1 ? lastLineXOffset : 0)) + "' y='" + (startingY + districtBoxLineOn*(districtBoxSize+districtBoxPadding)) + "' rx='" + districtBoxCornerRadius + "' ry='" + districtBoxCornerRadius  + "' ></rect>"
        })

        $("#outlines").append(outlineGroupHTML)
        let svgDataHTML = $("#svgdata").html()
        $("#svgdata").html(svgDataHTML)
      }]
    }

    const houseViewingData = async (mapDateData) => {
      let usedFallbackMap = USAHouseMapType.getSVGPath()[2] || false
      if (currentMapType.getMapSettingValue("showAllDistricts") && !usedFallbackMap)
      {
        return mapDateData
      }

      let housePerStateMapData = {}

      for (let regionID in mapDateData)
      {
        if (regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) { continue }

        let regionData = mapDateData[regionID]

        if (!(regionData.state in housePerStateMapData))
        {
          housePerStateMapData[regionData.state] = {region: regionData.state, voteSplits: []}
        }

        let partyVoteSplitData = housePerStateMapData[regionData.state].voteSplits
        let partyVote = partyVoteSplitData.find(partyVoteItem => partyVoteItem.partyID == regionData.partyID)
        if (!partyVote)
        {
          partyVote = {partyID: regionData.partyID, candidate: politicalParties[regionData.partyID].getNames()[0], votes: 0}
          partyVoteSplitData.push(partyVote)
        }
        partyVote.votes++

        if (regionData.flip)
        {
          housePerStateMapData[regionData.state].flip = true
        }
      }

      for (let regionID in housePerStateMapData)
      {
        let partyVoteSplitData = housePerStateMapData[regionID].voteSplits
        partyVoteSplitData.sort((partyVote1, partyVote2) => partyVote2.votes-partyVote1.votes)

        let largestPartyCount = partyVoteSplitData[0].votes
        let largestPartyID = partyVoteSplitData[0].partyID
        let secondLargestPartyCount = partyVoteSplitData[1] ? partyVoteSplitData[1].votes : 0

        housePerStateMapData[regionID].margin = (largestPartyCount/(largestPartyCount+secondLargestPartyCount)*100-50)*0.9001 // +0.001 to account for rounding errors
        housePerStateMapData[regionID].partyID = largestPartyID
      }

      if (mapDateData?.[nationalPopularVoteID])
      {
        housePerStateMapData[nationalPopularVoteID] = cloneObject(mapDateData[nationalPopularVoteID])
      }

      return housePerStateMapData
    }

    const houseZoomingData = async (mapDateData, zoomRegion) => {
      let stateMapData = {}

      Object.keys(mapDateData).filter(regionID => mapDateData[regionID].state == zoomRegion)
      .sort((regionID1, regionID2) => mapDateData[regionID1].district-mapDateData[regionID2].district)
      .forEach(regionID => {
        stateMapData[regionID] = cloneObject(mapDateData[regionID])
      })

      return stateMapData
    }

    const houseFormattedRegionName = (regionID, regionData) => {
      if (!regionID || !regionID.includes(subregionSeparator)) { return regionID }

      let state = regionID.split(subregionSeparator)[0]
      let districtNumber = regionID.split(subregionSeparator)[1]

      if (districtNumber == "0")
      {
        districtNumber = "AL"
      }
      
      let regionName = state + "-" + districtNumber
      
      if (regionData && regionData.isHold && regionData.electionDate)
      {
        const electionDate = new Date(regionData.electionDate)
        regionName += ` (${electionDate.getFullYear()})`
      }

      return regionName
    }

    let CNNHouseResults2022MapSource = new MapSource(
      "CNN-2022-House-Results", // id
      "CNN Results", // name
      {url: "https://politics.api.cnn.io/results/national-races/2022-HG.json", type: jsonSourceType}, // dataURL
      "https://www.cnn.com/election/2022/results/", // homepageURL
      {regular: "./assets/cnn-large.png", mini: "./assets/cnn.png"}, // iconURL
      {
        date: "extractedAt",
        raceKey: "ecKey",
        state: "stateAbbreviation",
        district: "jurisdictionCode",
        special: "raceType",
        totalVotes: "totalVote",
        reportingPercent: "percentReporting",
        calledRace: "editorialStatus",
        candidates: "candidates",
        candidateName: "lastName",
        partyID: "majorParty",
        candidateVotes: "voteNum"
      }, // columnMap
      2022, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkBase, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshareCNNFilterFunction, // organizeMapDataFunction
      houseViewingData, // viewingDataFunction
      houseZoomingData, // zoomingDataFunction
      null, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: true, showSplitVoteBoxes: true}, // splitVoteDisplayOptions
      houseFormattedRegionName, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, _, shouldOpenHomepage, __)
      {
        if (!shouldOpenHomepage && !regionID) return

        let linkToOpen = homepageURL
        if (shouldOpenHomepage)
        {
          linkToOpen += "house"
        }
        else
        {
          let [state, district] = regionID.split(subregionSeparator)
          if (district === "0") district = "1"
          linkToOpen += regionIDToLinkMap[state] + "/" + (district ? "us-house-district-" + district : "")
        }

        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      getHouseSVGFromDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      true // shouldUseOriginalMapDataForTotalsPieChart
    )
    
    const CNNHouseResults2024MapSource = new MapSource(
      "CNN-2024-House-Results", // id
      "CNN Results", // name
      {url: "https://politics.api.cnn.io/results/national-races/2024-HG.json", type: jsonSourceType}, // dataURL
      "https://www.cnn.com/election/2024/results/", // homepageURL
      {regular: "./assets/cnn-large.png", mini: "./assets/cnn.png"}, // iconURL
      {
        date: "extractedAt",
        raceKey: "ecKey",
        state: "stateAbbreviation",
        district: "jurisdictionCode",
        special: "raceType",
        totalVotes: "totalVote",
        reportingPercent: "percentReporting",
        calledRace: "editorialStatus",
        candidates: "candidates",
        candidateName: "lastName",
        partyID: "majorParty",
        candidateVotes: "voteNum"
      }, // columnMap
      2024, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkBase, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshareCNNFilterFunction, // organizeMapDataFunction
      houseViewingData, // viewingDataFunction
      houseZoomingData, // zoomingDataFunction
      null, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: true, showSplitVoteBoxes: true}, // splitVoteDisplayOptions
      houseFormattedRegionName, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, _, shouldOpenHomepage, __)
      {
        if (!shouldOpenHomepage && !regionID) return
    
        let linkToOpen = homepageURL
        if (shouldOpenHomepage)
        {
          linkToOpen += "house"
        }
        else
        {
          let [state, district] = regionID.split(subregionSeparator)
          if (district === "0") district = "1"
          linkToOpen += regionIDToLinkMap[state] + "/" + (district ? "us-house-district-" + district : "")
        }
    
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      0.0, // voteshareCutoffMargin
      getHouseSVGFromDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      true // shouldUseOriginalMapDataForTotalsPieChart
    )
    
    const FiveThirtyEightHouseProjection2022MapSource = new MapSource(
      "538-2022-House-Projection", // id
      "538 Projection", // name
      "./csv-sources/538/2022_house_district_toplines.csv", // dataURL
      "https://web.archive.org/web/20250306183747/https://projects.fivethirtyeight.com/2022-election-forecast/house/", // homepageURL
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
      regionIDToLinkBase, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      singleLineVoteshareFilterFunction, // organizeMapDataFunction
      houseViewingData, // viewingDataFunction
      houseZoomingData, // zoomingDataFunction
      null, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: true, showSplitVoteBoxes: true}, // splitVoteDisplayOptions
      houseFormattedRegionName, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage, mapData)
      {
        if (!shouldOpenHomepage && (!regionID || !mapData || !mapData[mapDate.getTime()] || !mapData[mapDate.getTime()][regionID])) return
    
        let linkToOpen = homepageURL
        if (!shouldOpenHomepage)
        {
          let {state, district} = mapData[mapDate.getTime()][regionID]
          if (district == "0") district = "1"
          linkToOpen += regionIDToLinkMap[state] + "/" + district
        }
    
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      getHouseSVGFromDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      true // shouldUseOriginalMapDataForTotalsPieChart
    )

    const FiveThirtyEightHouseProjection2024MapSource = new MapSource(
      "538-2024-House-Projection", // id
      "538 Projection", // name
      {url: "./csv-sources/538/2024_house_states_timeseries.json", type: jsonSourceType}, // dataURL
      "https://web.archive.org/web/20250306070753/https://projects.fivethirtyeight.com/2024-election-forecast/house/", // homepageURL
      {regular: "./assets/fivethirtyeight-large.png", mini: "./assets/fivethirtyeight.png"}, // iconURL
      {
        date: "date",
        region: "seat",
        candidates: "candidates",
        voteshare: "median"
      }, // columnMap
      2024, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkBase, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshare538FilterFunctionWithPastElections, // organizeMapDataFunction
      houseViewingData, // viewingDataFunction
      houseZoomingData, // zoomingDataFunction
      null, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: true, showSplitVoteBoxes: true}, // splitVoteDisplayOptions
      houseFormattedRegionName, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage, mapData)
      {
        if (!shouldOpenHomepage && (!regionID || !mapData || !mapData[mapDate.getTime()] || !mapData[mapDate.getTime()][regionID])) return

        let linkToOpen = homepageURL
        if (!shouldOpenHomepage)
        {
          let {state, district} = mapData[mapDate.getTime()][regionID]
          if (district == "0") district = "1"
          linkToOpen += regionIDToLinkMap[state] + "-" + district
        }

        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      getHouseSVGFromDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      true // shouldUseOriginalMapDataForTotalsPieChart
    )
    
    const VotehubHouseProjection2026MapSource = new MapSource(
      "Votehub-2026-House-Projection", // id
      "VoteHub Projection", // name
      {url: "https://jacksonjude.com/USA-Election-Map-Data/data/2026-votehub-forecast-house.json", type: jsonSourceType}, // dataURL
      "https://votehub.com/2026-forecast/", // homepageURL
      {regular: "./assets/votehub-large.png", mini: "./assets/votehub.png"}, // iconURL
      {
        date: "date",
        region: "state",
        district: "number",
        candidates: "candidates",
        voteshare: "voteshare",
        margin: "margin",
        winprob: "probability"
      }, // columnMap
      2026, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkBase, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshareVotehubFilterFunctionWithPastElections, // organizeMapDataFunction
      houseViewingData, // viewingDataFunction
      houseZoomingData, // zoomingDataFunction
      null, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: true, showSplitVoteBoxes: true}, // splitVoteDisplayOptions
      houseFormattedRegionName, // getFormattedRegionName
      function(homepageURL, regionID, _, mapDate, shouldOpenHomepage, mapData)
      {
        if (!shouldOpenHomepage && (!mapData || !regionID || !mapDate || !mapData[mapDate.getTime()][regionID])) return
        
        let linkToOpen = homepageURL
        if (!shouldOpenHomepage && (regionID != null && mapDate != null && mapData != null))
        {
          const regionData = mapData[mapDate.getTime()][regionID]
          
          let state = regionData.state
          let district = regionData.district
          
          linkToOpen += `race/?race_id=H2026${state}${zeroPadding(district)}`
        }
        else
        {
          linkToOpen += "house/"
        }
        
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      getHouseSVGFromDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      true // shouldUseOriginalMapDataForTotalsPieChart
    )

    const PastElectionResultMapSource = new MapSource(
      "Past-House-Elections", // id
      "Past Elections", // name
      "./csv-sources/past-house.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      {regular: "./assets/wikipedia-large.png", mini: "./assets/wikipedia-large.png", getOverlayText: () => {
        let currentYear = currentSliderDate.getFullYear()
        return currentYear
      }}, // iconURL
      {
        date: "date",
        region: "region",
        district: "district",
        candidateName: "candidate",
        partyID: "party",
        ballotPartyID: "ballotparty",
        voteshare: "voteshare"
      }, // columnMap
      null, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToID
      regionIDToLinkHistorical, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      doubleLineVoteshareFilterFunction, // organizeMapDataFunction
      houseViewingData, // viewingDataFunction
      houseZoomingData, // zoomingDataFunction
      null, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: true, showSplitVoteBoxes: true}, // splitVoteDisplayOptions
      houseFormattedRegionName, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage, mapData)
      {
        if (mapDate == null) { return }
        
        const regionData = mapData[mapDate.getTime()][regionID]
        if (regionData && regionData.isHold && regionData.electionDate)
        {
          mapDate = new Date(regionData.electionDate)
        }

        let districtNumber
        if (regionID != null && regionID.includes(subregionSeparator))
        {
          districtNumber = regionID.split(subregionSeparator)[1]
          regionID = regionID.split(subregionSeparator)[0]
        }

        let linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_House_of_Representatives_elections"
        if (!shouldOpenHomepage)
        {
          if (getDecadeFromDate(mapDate) < 2000)
          {
            linkToOpen += "#" + regionIDToLinkMap[regionID]
          }
          else if (USAHouseMapType.getEV(getDecadeFromDate(mapDate), regionID) > 1)
          {
            linkToOpen += "_in_" + regionIDToLinkMap[regionID] + (districtNumber ? "#District_" + districtNumber : "")
          }
          else
          {
            linkToOpen += "#" + regionIDToLinkMap[regionID]
          }
        }
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0, // voteshareCutoffMargin
      getHouseSVGFromDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      true // shouldUseOriginalMapDataForTotalsPieChart
    )

    let idsToPartyNames = {}
    let partyNamesToIDs = {}
    for (let partyNum in mainPoliticalPartyIDs)
    {
      if (mainPoliticalPartyIDs[partyNum] == TossupParty.getID()) { continue }

      partyNamesToIDs[politicalParties[mainPoliticalPartyIDs[partyNum]].getNames()[0]] = mainPoliticalPartyIDs[partyNum]
      idsToPartyNames[mainPoliticalPartyIDs[partyNum]] = politicalParties[mainPoliticalPartyIDs[partyNum]].getNames()[0]
    }

    const CustomMapSource = new MapSource(
      "Custom-House", // id
      "Custom", // name
      null, // dataURL
      null, // homepageURL
      null, // iconURL
      {
        date: "date",
        region: "region",
        district: "district",
        candidateName: "candidate",
        partyID: "party",
        voteshare: "voteshare",
        order: "order",
        flip: "flip"
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
      houseViewingData, // viewingDataFunction
      houseZoomingData, // zoomingDataFunction
      null, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: true, showSplitVoteBoxes: true}, // splitVoteDisplayOptions
      houseFormattedRegionName, // getFormattedRegionName
      null, // customOpenRegionLinkFunction
      function(displayRegionData, mapDateData)
      {
        for (let regionID in displayRegionData)
        {
          if (!regionID.includes(subregionSeparator) && regionID != nationalPopularVoteID) { continue }
          if (regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) { continue }

          let regionData = displayRegionData[regionID]
          regionData.region = regionID

          mapDateData[regionID] = cloneObject(regionData)
        }
      }, // updateCustomMapFunction
      customMapConvertMapDataToCSVFunction, // convertMapDataRowToCSVFunction
      true, // isCustomMap
      false, // shouldClearDisabled
      null, // shouldShowVoteshare
      null, // voteshareCutoffMargin
      getHouseSVGFromDate, // overrideSVGPath
      null, // shouldSetDisabledWorthToZero
      true // shouldUseOriginalMapDataForTotalsPieChart
    )

    let todayDate = new Date()
    CustomMapSource.setTextMapData("date\n" + (todayDate.getMonth()+1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear())

    let houseMapSources = {}
    houseMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
    houseMapSources[FiveThirtyEightHouseProjection2022MapSource.getID()] = FiveThirtyEightHouseProjection2022MapSource
    houseMapSources[FiveThirtyEightHouseProjection2024MapSource.getID()] = FiveThirtyEightHouseProjection2024MapSource
    houseMapSources[CNNHouseResults2022MapSource.getID()] = CNNHouseResults2022MapSource
    houseMapSources[CNNHouseResults2024MapSource.getID()] = CNNHouseResults2024MapSource
    houseMapSources[VotehubHouseProjection2026MapSource.getID()] = VotehubHouseProjection2026MapSource
    houseMapSources[CustomMapSource.getID()] = CustomMapSource

    const houseMapCycles = [2026, 2024, 2022]
    const houseMapSourceIDs = {
      2026: [VotehubHouseProjection2026MapSource.getID()],
      2024: [FiveThirtyEightHouseProjection2024MapSource.getID()],
      2022: [FiveThirtyEightHouseProjection2022MapSource.getID()],
      [allYearsCycle]: [PastElectionResultMapSource.getID(), CustomMapSource.getID()]
    }
    
    const kPastElectionsVsPastElections = 1
    const k538ProjectionVsPastElections = 2

    let defaultHouseCompareSourceIDs = {}
    defaultHouseCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
    defaultHouseCompareSourceIDs[k538ProjectionVsPastElections] = [FiveThirtyEightHouseProjection2024MapSource.getID(), PastElectionResultMapSource.getID()]

    return {mapSources: houseMapSources, mapSourceIDs: houseMapSourceIDs, mapCycles: houseMapCycles, defaultCompareSourceIDs: defaultHouseCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)
