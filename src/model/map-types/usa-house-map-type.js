var USAHouseMapType = new MapType(
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
  (customMapEnabled) => {
    const regionNameToIDHistorical = {"AL":"AL", "AK":"AK", "AZ":"AZ", "AR":"AR", "CA":"CA", "CO":"CO", "CT":"CT", "DE":"DE", "FL":"FL", "GA":"GA", "HI":"HI", "ID":"ID", "IL":"IL", "IN":"IN", "IA":"IA", "KS":"KS", "KY":"KY", "LA":"LA", "ME":"ME", "MD":"MD", "MA":"MA", "MI":"MI", "MN":"MN", "MS":"MS", "MO":"MO", "MT":"MT", "NE":"NE", "NV":"NV", "NH":"NH", "NJ":"NJ", "NM":"NM", "NY":"NY", "NC":"NC", "ND":"ND", "OH":"OH", "OK":"OK", "OR":"OR", "PA":"PA", "RI":"RI", "SC":"SC", "SD":"SD", "TN":"TN", "TX":"TX", "UT":"UT", "VT":"VT", "VA":"VA", "WA":"WA", "WV":"WV", "WI":"WI", "WY":"WY", [nationalPopularVoteID]:nationalPopularVoteID}

    var jsonVoteshareFilterFunction = function(rawMapData, _, columnMap, __, ___, ____, _____, ______, _______, voteshareCutoffMargin)
    {
      let racesToIgnore = []
      let candidateExceptions = {"None of these candidates": "None"}

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

          formattedCandidatesArray.push({candidate: candidateName, partyID: partyID, voteshare: totalVotes > 0 ? candidateVotes/totalVotes*100 : 100, votes: candidateVotes})
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

        mapData[mapDate][regionID] = {region: regionID, state: state, district: district, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: false, reportingPercent: reportingPercent}
      }

      for (let state of Object.keys(stateDistrictCounts).filter(state => stateDistrictCounts[state] == 1))
      {
        let regionData = cloneObject(mapData[mapDate][state + subregionSeparator + "1"])
        delete mapData[mapDate][state + subregionSeparator + "1"]
        regionData.district = "0"
        regionData.region = state + subregionSeparator + "0"
        mapData[mapDate][state + subregionSeparator + "0"] = regionData
      }

      return {mapData: mapData, candidateNameData: partyNameArray, mapDates: [mapDate]}
    }

    var singleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, __, ___, ____, _____, ______, voteshareCutoffMargin)
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
              topTwoMargin = 101
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

          dateData[regionID] = {region: regionID, state: state, district: district, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: false}
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

    var doubleLineVoteshareFilterFunction = function(rawMapData, mapDates, columnMap, _, __, regionNameToID, ___, _____, isCustomMap, voteshareCutoffMargin, shouldIncludeVoteshare)
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

          var fullStateRows = rawDateData.filter(row => {
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
                  districtNumber = parseInt(districtNumber)+1
                }
                filteredDateData[regionNameToID[regionToFind] + subregionSeparator + districtNumber] = {region: regionNameToID[regionToFind] + subregionSeparator + districtNumber, state: regionNameToID[regionToFind], margin: 0, partyID: TossupParty.getID(), candidateMap: partyIDToCandidateNames}
              }
            }
            continue
          }

          var stateDistricts = [...new Set(fullStateRows.map(row => {
            return row[columnMap.district]
          }))]

          if (stateDistricts.length == 0)
          {
            console.log(regionToFind, currentMapDate)
          }

          for (let stateDistrict of stateDistricts)
          {
            var districtRows = fullStateRows.filter(row => {
              return row[columnMap.district] == stateDistrict
            })

            var fullRegionName = regionToFind + (regionToFind != nationalPopularVoteID ? subregionSeparator + stateDistrict : "")

            var candidateData = {}

            for (var rowNum in districtRows)
            {
              var row = districtRows[rowNum]

              var candidateName = row[columnMap.candidateName]
              var currentVoteshare = parseFloat(row[columnMap.voteshare])
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
              console.log("No candidate data!", currentMapDate.getFullYear().toString(), fullRegionName)
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
              if (!isCustomMap && Object.keys(candidateData).length == 1)
              {
                topTwoMargin = 101
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

            var mostRecentParty = mostRecentWinner(filteredMapData, currentMapDate.getTime(), fullRegionName)
            filteredDateData[fullRegionName] = {region: fullRegionName, state: regionToFind, district: stateDistrict, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: shouldIncludeVoteshare ? voteshareSortedCandidateData : null, flip: mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID()}
          }
        }

        filteredMapData[mapDates[dateNum]] = filteredDateData
        partyNameData[mapDates[dateNum]] = currentDatePartyNameArray
      }

      return {mapData: filteredMapData, candidateNameData: partyNameData, mapDates: mapDates}
    }

    function mostRecentWinner(mapData, dateToStart, regionID)
    {
      var reversedMapDates = cloneObject(Object.keys(mapData)).reverse()

      var startYear = (new Date(parseInt(dateToStart))).getFullYear()

      for (var dateNum in reversedMapDates)
      {
        if (reversedMapDates[dateNum] >= parseInt(dateToStart)) { continue }

        var currentYear = (new Date(parseInt(reversedMapDates[dateNum]))).getFullYear()

        if (startYear-currentYear > 2)
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
      }
    }

    var getHouseSVGFromDate = function(dateTime)
    {
      var zoomRegion = currentMapZoomRegion

      if (currentViewingState == ViewingState.viewing && !currentMapType.getMapSettingValue("showAllDistricts"))
      {
        return "svg-sources/usa-governor-map.svg"
      }

      if ((currentViewingState == ViewingState.viewing && currentMapType.getMapSettingValue("showAllDistricts")) || (currentViewingState == ViewingState.zooming && currentMapType.getMapSettingValue("showStateDistricts")))
      {
        var dateYear = (new Date(dateTime)).getFullYear()
        if (dateYear >= 2022)
        {
          return ["svg-sources/usa-house-2022-map.svg", zoomRegion]
        }
        else if (dateYear >= 2020)
        {
          return ["svg-sources/usa-house-2020-map.svg", zoomRegion]
        }
        else if (dateYear >= 2018)
        {
          return ["svg-sources/usa-house-2018-map.svg", zoomRegion]
        }
        else if (dateYear >= 2016)
        {
          return ["svg-sources/usa-house-2016-map.svg", zoomRegion]
        }
        else if (dateYear >= 2012)
        {
          return ["svg-sources/usa-house-2012-map.svg", zoomRegion]
        }
        else if (dateYear >= 2006)
        {
          return ["svg-sources/usa-house-2006-map.svg", zoomRegion]
        }
        else if (dateYear >= 2004)
        {
          return ["svg-sources/usa-house-2004-map.svg", zoomRegion]
        }
        else if (dateYear >= 2002)
        {
          return ["svg-sources/usa-house-2002-map.svg", zoomRegion]
        }
        else if (dateYear >= 1998)
        {
          return ["svg-sources/usa-house-1998-map.svg", zoomRegion]
        }
        else if (dateYear >= 1996)
        {
          return ["svg-sources/usa-house-1996-map.svg", zoomRegion]
        }
        else if (dateYear >= 1994)
        {
          return ["svg-sources/usa-house-1994-map.svg", zoomRegion]
        }
        else if (dateYear >= 1992)
        {
          return ["svg-sources/usa-house-1992-map.svg", zoomRegion]
        }
        else if (dateYear >= 1984)
        {
          return ["svg-sources/usa-house-1984-map.svg", zoomRegion]
        }
        else if (dateYear >= 1982)
        {
          return ["svg-sources/usa-house-1982-map.svg", zoomRegion]
        }
        else if (dateYear >= 1976)
        {
          return ["svg-sources/usa-house-1976-map.svg", zoomRegion]
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

        var boundingBox = $("#svgdata")[0].getBBox()

        var districtCount = Object.keys(mapDateData).length - (Object.keys(mapDateData).some(regionID => regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) ? 1 : 0)

        var districtBoxSize = Math.max(boundingBox.width, boundingBox.height)*0.07
        var districtBoxPadding = districtBoxSize/5
        var districtBoxCornerRadius = districtBoxSize/10

        var startingX = boundingBox.x + boundingBox.width/2 - (districtBoxesPerLine*(districtBoxSize+districtBoxPadding)-districtBoxPadding/2)/2
        var startingY = boundingBox.y + boundingBox.height/2 - (Math.ceil(districtCount/districtBoxesPerLine)*(districtBoxSize+districtBoxPadding)-districtBoxPadding/2)/2

        var districtBoxLineCount = Math.floor(districtCount/districtBoxesPerLine)+1

        var itemsOnLastLine = districtCount%districtBoxesPerLine > 0 ? districtCount%districtBoxesPerLine : districtBoxesPerLine
        var lastLineXOffset = (districtBoxesPerLine-itemsOnLastLine)*(districtBoxSize+districtBoxPadding)/2

        var outlineGroupHTML = ""
        outlineGroupHTML += "<rect " + isDistrictBoxRegionAttribute + " " + noInteractSVGRegionAttribute + " " + noCountSVGRegionAttribute + " fill='gray' fill-opacity='0.7' width='" + ((districtBoxLineCount == 1 ? itemsOnLastLine : districtBoxesPerLine)*(districtBoxSize+districtBoxPadding)+districtBoxPadding) + "' height='" + (Math.ceil(districtCount/districtBoxesPerLine)*(districtBoxSize+districtBoxPadding)+districtBoxPadding) + "' x='" + (startingX-districtBoxPadding+(districtBoxLineCount == 1 ? lastLineXOffset : 0)) + "' y='" + (startingY-districtBoxPadding) + "' rx='" + districtBoxCornerRadius + "' ry='" + districtBoxCornerRadius  + "'></rect>"
        Object.keys(mapDateData).forEach((regionID, i) => {
          if (regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) { return }

          var districtBoxLineOn = Math.floor(i/districtBoxesPerLine)
          outlineGroupHTML += "<rect " + isDistrictBoxRegionAttribute + " id='" + regionID + "' width='" + districtBoxSize + "' height='" + districtBoxSize + "' x='" + (startingX + i%districtBoxesPerLine*(districtBoxSize+districtBoxPadding) + (districtBoxLineOn == districtBoxLineCount-1 ? lastLineXOffset : 0)) + "' y='" + (startingY + districtBoxLineOn*(districtBoxSize+districtBoxPadding)) + "' rx='" + districtBoxCornerRadius + "' ry='" + districtBoxCornerRadius  + "' ></rect>"
        })

        $("#outlines").append(outlineGroupHTML)
        var svgDataHTML = $("#svgdata").html()
        $("#svgdata").html(svgDataHTML)
      }]
    }

    var houseViewingData = async (mapDateData) => {
      var usedFallbackMap = USAHouseMapType.getSVGPath()[2] || false
      if (currentMapType.getMapSettingValue("showAllDistricts") && !usedFallbackMap)
      {
        return mapDateData
      }

      var housePerStateMapData = {}

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

      if (mapDateData[nationalPopularVoteID])
      {
        housePerStateMapData[nationalPopularVoteID] = cloneObject(mapDateData[nationalPopularVoteID])
      }

      return housePerStateMapData
    }

    var houseZoomingData = async (mapDateData, zoomRegion) => {
      var stateMapData = {}

      Object.keys(mapDateData).filter(regionID => mapDateData[regionID].state == zoomRegion)
      .sort((regionID1, regionID2) => mapDateData[regionID1].district-mapDateData[regionID2].district)
      .forEach(regionID => {
        stateMapData[regionID] = cloneObject(mapDateData[regionID])
      })

      return stateMapData
    }

    var houseFormattedRegionName = (regionID) => {
      if (!regionID || !regionID.includes(subregionSeparator)) { return regionID }

      let state = regionID.split(subregionSeparator)[0]
      let districtNumber = regionID.split(subregionSeparator)[1]

      if (districtNumber == "0")
      {
        districtNumber = "AL"
      }

      return state + "-" + districtNumber
    }

    var CNNHouseResultsMapSource = new MapSource(
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
      {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}, // regionIDToLinkMap
      null, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshareFilterFunction, // organizeMapDataFunction
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
          homepageURL += "house"
        }
        else
        {
          let [state, district] = regionID.split(subregionSeparator)
          if (district === "0") district = "1"
          linkToOpen += regionIDToLinkMap[state] + "/" + (district ? "us-house-district-" + district : "")
        }

        window.open(linkToOpen)
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

    var FiveThirtyEightHouseProjectionMapSource = new MapSource(
      "538-2022-House-Projection", // id
      "538 Projection", // name
      "https://projects.fivethirtyeight.com/2022-general-election-forecast-data/house_district_toplines_2022.csv", // dataURL
      "https://projects.fivethirtyeight.com/2022-election-forecast/house/", // homepageURL
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

        window.open(linkToOpen)
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

    var PastElectionResultMapSource = new MapSource(
      "Past-House-Elections", // id
      "Past Elections", // name
      "./csv-sources/past-house.csv", // dataURL
      "https://en.wikipedia.org/wiki/", // homepageURL
      "./assets/wikipedia-large.png", // iconURL
      {
        date: "date",
        region: "region",
        district: "district",
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
      houseViewingData, // viewingDataFunction
      houseZoomingData, // zoomingDataFunction
      null, // splitVoteDataFunction
      {showSplitVotesOnCanZoom: true, showSplitVoteBoxes: true}, // splitVoteDisplayOptions
      houseFormattedRegionName, // getFormattedRegionName
      function(homepageURL, regionID, regionIDToLinkMap, mapDate, shouldOpenHomepage, _)
      {
        if (mapDate == null) { return }

        var districtNumber
        if (regionID != null && regionID.includes(subregionSeparator))
        {
          districtNumber = regionID.split(subregionSeparator)[1]
          regionID = regionID.split(subregionSeparator)[0]
        }

        var linkToOpen = homepageURL + mapDate.getFullYear() + "_United_States_House_of_Representatives_elections"
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
        window.open(linkToOpen)
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
        district: "district",
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
          if (!regionID.includes(subregionSeparator)) { continue }
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

    var todayDate = new Date()
    CustomMapSource.setTextMapData("date\n" + (todayDate.getMonth()+1) + "/" + todayDate.getDate() + "/" + todayDate.getFullYear())

    var houseMapSources = {}
    houseMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
    houseMapSources[FiveThirtyEightHouseProjectionMapSource.getID()] = FiveThirtyEightHouseProjectionMapSource
    houseMapSources[CNNHouseResultsMapSource.getID()] = CNNHouseResultsMapSource
    houseMapSources[CustomMapSource.getID()] = CustomMapSource

    var houseMapSourceIDs = [PastElectionResultMapSource.getID(), FiveThirtyEightHouseProjectionMapSource.getID()]
    if (customMapEnabled)
    {
      houseMapSourceIDs.push(CustomMapSource.getID())
    }

    const kPastElectionsVsPastElections = 1
    const k538ProjectionVsPastElections = 2

    var defaultHouseCompareSourceIDs = {}
    defaultHouseCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
    defaultHouseCompareSourceIDs[k538ProjectionVsPastElections] = [FiveThirtyEightHouseProjectionMapSource.getID(), PastElectionResultMapSource.getID()]

    return {mapSources: houseMapSources, mapSourceIDs: houseMapSourceIDs, defaultCompareSourceIDs: defaultHouseCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)
