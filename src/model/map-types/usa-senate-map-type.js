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
    {id: "seatArrangement", title: "🪑 Seat Arrangement", type: MapSettingType.optionCycle, options:
      [
        {id: "election-type", title: "Election", value: 0},
        {id: "seat-class", title: "Class", value: 1}
      ],
      shouldShowActive: (value) => {
        return value == 1
      },
    defaultValue: "election-type", reloadType: MapSettingReloadType.data},
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
    const regionNameToIDHistorical = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "National Popular Vote":nationalPopularVoteID}
    
    const regionIDToLinkBase = {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}
    const regionIDToLinkHistorical = {"AL":"Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA":"California", "CO":"Colorado", "CT":"Connecticut", "DE":"Delaware", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE":"Nebraska", "NV":"Nevada", "NH":"New_Hampshire", "NJ":"New_Jersey", "NM":"New_Mexico", "NY":"New_York", "NC":"North_Carolina", "ND":"North_Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode_Island", "SC":"South_Carolina", "SD":"South_Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West_Virginia", "WI":"Wisconsin", "WY":"Wyoming"}

    const stateClasses = {
      /* Class 1/2 */ "MT": [1, 2], "WY": [1, 2], "NM": [1, 2], "NE": [1, 2], "TX": [1, 2], "MN": [1, 2], "MI": [1, 2], "TN": [1, 2], "MS": [1, 2], "WV": [1, 2], "VA": [1, 2], "DE": [1, 2], "NJ": [1, 2], "MA": [1, 2], "RI": [1, 2], "ME": [1, 2],
      /* Class 1/3 */ "HI": [1, 3], "CA": [1, 3], "WA": [1, 3], "NV": [1, 3], "UT": [1, 3], "AZ": [1, 3], "ND": [1, 3], "MO": [1, 3], "WI": [1, 3], "IN": [1, 3], "OH": [1, 3], "FL": [1, 3], "PA": [1, 3], "MD": [1, 3], "NY": [1, 3], "CT": [1, 3], "VT": [1, 3],
      /* Class 2/3 */ "AK": [2, 3], "OR": [2, 3], "ID": [2, 3], "CO": [2, 3], "SD": [2, 3], "KS": [2, 3], "OK": [2, 3], "IA": [2, 3], "AR": [2, 3], "LA": [2, 3], "IL": [2, 3], "KY": [2, 3], "AL": [2, 3], "GA": [2, 3], "SC": [2, 3], "NC": [2, 3], "NH": [2, 3],
      /* National Popular Vote */ [nationalPopularVoteID]: [1]
    }
    
    const democraticPartyID = DemocraticParty.getID()
    const republicanPartyID = RepublicanParty.getID()

    const heldSeatPartyIDs2022 = {"AK-2": republicanPartyID, "HI-1": democraticPartyID, "AL-2": republicanPartyID, "AR-2": republicanPartyID, "AZ-1": democraticPartyID, "CA-1": democraticPartyID, "CO-2": democraticPartyID, "CT-1": democraticPartyID, "DE-2": democraticPartyID, "FL-1": republicanPartyID, "GA-2": democraticPartyID, "IA-2": republicanPartyID, "ID-2": republicanPartyID, "IL-2": democraticPartyID, "IN-1": republicanPartyID, "KS-2": republicanPartyID, "KY-2": republicanPartyID, "LA-2": republicanPartyID, "MA-2": democraticPartyID, "MD-1": democraticPartyID, "ME-2": republicanPartyID, "MI-2": democraticPartyID, "MN-2": democraticPartyID, "MO-1": republicanPartyID, "MS-2": republicanPartyID, "MT-2": republicanPartyID, "NC-2": republicanPartyID, "ND-1": republicanPartyID, "NH-2": democraticPartyID, "NJ-2": democraticPartyID, "NM-2": democraticPartyID, "NV-1": democraticPartyID, "NY-1": democraticPartyID, "OH-1": democraticPartyID, "OK-2": republicanPartyID, "OR-2": democraticPartyID, "PA-1": democraticPartyID, "RI-2": democraticPartyID, "SC-2": republicanPartyID, "SD-2": republicanPartyID, "TN-2": republicanPartyID, "TX-2": republicanPartyID, "UT-1": republicanPartyID, "VA-2": democraticPartyID, "VT-1": democraticPartyID, "WA-1": democraticPartyID, "WI-1": democraticPartyID, "WV-2": republicanPartyID, "WY-2": republicanPartyID, "NE-2": republicanPartyID, "WA-3": democraticPartyID, "OR-3": democraticPartyID, "CA-3": democraticPartyID, "NV-3": democraticPartyID, "UT-3": republicanPartyID, "AZ-3": democraticPartyID, "NM-1": democraticPartyID, "AK-3": republicanPartyID, "HI-3": democraticPartyID, "TX-1": republicanPartyID, "OK-3": republicanPartyID, "KS-3": republicanPartyID, "CO-3": democraticPartyID, "NE-1": republicanPartyID, "WY-1": republicanPartyID, "MT-1": democraticPartyID, "ID-3": republicanPartyID, "ND-3": republicanPartyID, "SD-3": republicanPartyID, "MN-1": democraticPartyID, "WI-3": republicanPartyID, "IA-3": republicanPartyID, "IL-3": democraticPartyID, "MO-3": republicanPartyID, "AR-3": republicanPartyID, "LA-3": republicanPartyID, "MS-1": republicanPartyID, "AL-3": republicanPartyID, "GA-3": democraticPartyID, "FL-3": republicanPartyID, "SC-3": republicanPartyID, "NC-3": republicanPartyID, "TN-1": republicanPartyID, "KY-3": republicanPartyID, "WV-1": democraticPartyID, "VA-1": democraticPartyID, "OH-3": republicanPartyID, "IN-3": republicanPartyID, "MI-1": democraticPartyID, "PA-3": republicanPartyID, "NY-3": democraticPartyID, "ME-1": democraticPartyID, "NH-3": democraticPartyID, "VT-3": democraticPartyID, "MA-1": democraticPartyID, "RI-1": democraticPartyID, "CT-3": democraticPartyID, "NJ-1": democraticPartyID, "DE-1": democraticPartyID, "MD-3": democraticPartyID, "NPV-1": republicanPartyID}
    
    const heldSeatPartyIDs2024 = {"AK-2": republicanPartyID, "HI-1": democraticPartyID, "AL-2": republicanPartyID, "AR-2": republicanPartyID, "AZ-1": democraticPartyID, "CA-1": democraticPartyID, "CO-2": democraticPartyID, "CT-1": democraticPartyID, "DE-2": democraticPartyID, "FL-1": republicanPartyID, "GA-2": democraticPartyID, "IA-2": republicanPartyID, "ID-2": republicanPartyID, "IL-2": democraticPartyID, "IN-1": republicanPartyID, "KS-2": republicanPartyID, "KY-2": republicanPartyID, "LA-2": republicanPartyID, "MA-2": democraticPartyID, "MD-1": democraticPartyID, "ME-2": republicanPartyID, "MI-2": democraticPartyID, "MN-2": democraticPartyID, "MO-1": republicanPartyID, "MS-2": republicanPartyID, "MT-2": republicanPartyID, "NC-2": republicanPartyID, "ND-1": republicanPartyID, "NH-2": democraticPartyID, "NJ-2": democraticPartyID, "NM-2": democraticPartyID, "NV-1": democraticPartyID, "NY-1": democraticPartyID, "OH-1": democraticPartyID, "OK-2": republicanPartyID, "OR-2": democraticPartyID, "PA-1": democraticPartyID, "RI-2": democraticPartyID, "SC-2": republicanPartyID, "SD-2": republicanPartyID, "TN-2": republicanPartyID, "TX-2": republicanPartyID, "UT-1": republicanPartyID, "VA-2": democraticPartyID, "VT-1": democraticPartyID, "WA-1": democraticPartyID, "WI-1": democraticPartyID, "WV-2": republicanPartyID, "WY-2": republicanPartyID, "NE-2": republicanPartyID, "WA-3": democraticPartyID, "OR-3": democraticPartyID, "CA-3": democraticPartyID, "NV-3": democraticPartyID, "UT-3": republicanPartyID, "AZ-3": democraticPartyID, "NM-1": democraticPartyID, "AK-3": republicanPartyID, "HI-3": democraticPartyID, "TX-1": republicanPartyID, "OK-3": republicanPartyID, "KS-3": republicanPartyID, "CO-3": democraticPartyID, "NE-1": republicanPartyID, "WY-1": republicanPartyID, "MT-1": democraticPartyID, "ID-3": republicanPartyID, "ND-3": republicanPartyID, "SD-3": republicanPartyID, "MN-1": democraticPartyID, "WI-3": republicanPartyID, "IA-3": republicanPartyID, "IL-3": democraticPartyID, "MO-3": republicanPartyID, "AR-3": republicanPartyID, "LA-3": republicanPartyID, "MS-1": republicanPartyID, "AL-3": republicanPartyID, "GA-3": democraticPartyID, "FL-3": republicanPartyID, "SC-3": republicanPartyID, "NC-3": republicanPartyID, "TN-1": republicanPartyID, "KY-3": republicanPartyID, "WV-1": democraticPartyID, "VA-1": democraticPartyID, "OH-3": republicanPartyID, "IN-3": republicanPartyID, "MI-1": democraticPartyID, "PA-3": democraticPartyID, "NY-3": democraticPartyID, "ME-1": democraticPartyID, "NH-3": democraticPartyID, "VT-3": democraticPartyID, "MA-1": democraticPartyID, "RI-1": democraticPartyID, "CT-3": democraticPartyID, "NJ-1": democraticPartyID, "DE-1": democraticPartyID, "MD-3": democraticPartyID, "NPV-1": republicanPartyID}

    var jsonVoteshareCNNFilterFunction = function(rawMapData, _, columnMap, cycleYear, __, regionNameToID, heldRegionMap, ____, _____, voteshareCutoffMargin)
    {
      let onCycleClass = ((cycleYear-2)%6)/2+1

      let racesToIgnore = ["2022-S2P-CA"]
      let candidateExceptions = {"None of these candidates": "None"}
      
      const overridePartyCandidates = {
        "Sanders": "DEM",
        "King": "DEM"
      }

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
          if (overridePartyCandidates[candidateName])
          {
            partyID = overridePartyCandidates[candidateName]
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
    
    var jsonPricesFilterFunction = function(rawMapData, _, columnMap, cycleYear, __, regionNameToIDMap, heldRegionMap)
    {
      let filteredMapData = {}
      let mapDates = []
      
      const defaultRelativePositiveParty = DemocraticParty.getID()
      const defaultRelativeNegativeParty = RepublicanParty.getID()
      const positiveParties = {"NE":IndependentGenericParty.getID()}
      
      let onCycleClass = ((cycleYear-2)%6)/2+1
      
      for (let regionName in rawMapData)
      {
        let region = regionNameToIDMap[regionName]
        const relativePositiveParty = positiveParties[region] ?? defaultRelativePositiveParty
        const relativeNegativeParty = defaultRelativeNegativeParty
        
        let partyIDToCandidateNames = {[relativePositiveParty]: politicalParties[relativePositiveParty].getNames()[0], [relativeNegativeParty]: politicalParties[relativeNegativeParty].getNames()[0]}
        
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
          
          for (let partyID of [relativePositiveParty, relativeNegativeParty])
          {
            const party = politicalParties[partyID]
            
            const voteshare = dateData[columnMap.price]*100*(partyID == relativeNegativeParty ? -1 : 1)+(partyID == relativeNegativeParty ? 100 : 0)
            voteshareSortedCandidateData.push({candidate: party.getNames()[0], partyID: partyID, voteshare: voteshare, winPercentage: voteshare})
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
          
          filteredMapData[date][region] = {region: region, seatClass: onCycleClass, offYear: false, runoff: false, isSpecial: false, margin: topValue, partyID: greatestValuePartyID, candidateName: greatestValueCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[region + "-" + onCycleClass] != greatestValuePartyID}
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
      
      for (const mapDate in filteredMapData)
      {
        for (let regionID of Object.values(regionNameToIDMap))
        {
          if (regionID == nationalPopularVoteID) continue
        
          let placeholderRegionData = {offYear: false, runoff: false, margin: 101, disabled: true}
        
          let seatClassesToUse = [stateClasses[regionID][0] != onCycleClass ? stateClasses[regionID][0] : stateClasses[regionID][1], stateClasses[regionID][1] != onCycleClass ? stateClasses[regionID][1] : stateClasses[regionID][0]]
        
          if (!filteredMapData[mapDate][regionID])
          {
            filteredMapData[mapDate][regionID] = {region: regionID, seatClass: seatClassesToUse[0], isSpecial: false, partyID: heldRegionMap[regionID + "-" + seatClassesToUse[0]], ...placeholderRegionData}
          }
          if (!filteredMapData[mapDate][regionID + "-S"])
          {
            filteredMapData[mapDate][regionID + "-S"] = {region: regionID + "-S", seatClass: seatClassesToUse[1], isSpecial: true, partyID: heldRegionMap[regionID + "-" + seatClassesToUse[1]], ...placeholderRegionData}
          }
        }
      }
      
      return {mapData: filteredMapData, mapDates: mapDates.sort()}
    }
    
    var jsonVoteshare538FilterFunction = function(rawMapData, _, columnMap, cycleYear, ___, regionNameToID, heldRegionMap)
    {
      let filteredMapData = {}
      let mapDates = []
      
      const onCycleClass = ((cycleYear-2)%6)/2+1
      
      const overridePartyCandidates = {
        "Sanders": "dem",
        "King": "dem"
      }
    
      for (let regionData of rawMapData)
      {
        let region = regionData.latest[columnMap.region]
        let rawPartyIDToCandidateNames = regionData.latest[columnMap.candidates]
        const candidateToRawPartyID = invertObject(rawPartyIDToCandidateNames)
        
        let candidateToPartyID = {}
        for (let partyID in rawPartyIDToCandidateNames)
        {
          const candidate = rawPartyIDToCandidateNames[partyID]
          if (overridePartyCandidates[candidate])
          {
            partyID = overridePartyCandidates[candidate]
          }
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
          
          const isSpecial = region.endsWith('-2')
          const state = region.replace('-2', '')
          const seatClass = isSpecial ? stateClasses[state].filter(c => c != onCycleClass)[0] : onCycleClass
          const formattedRegion = `${state}${isSpecial ? '-S' : ''}`
          
          filteredMapData[date][formattedRegion] = {region: formattedRegion, seatClass: seatClass, offYear: false, runoff: false, isSpecial: isSpecial, margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: invertObject(candidateToPartyID), partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[state + "-" + seatClass] != greatestMarginPartyID}
        }
      }
      
      for (let mapDate in filteredMapData)
      {
        for (let regionID of Object.values(regionNameToID))
        {
          if (regionID == nationalPopularVoteID) continue
          
          let placeholderRegionData = {offYear: false, runoff: false, margin: 101, disabled: true}
          
          let seatClassesToUse = [stateClasses[regionID][0] != onCycleClass ? stateClasses[regionID][0] : stateClasses[regionID][1], stateClasses[regionID][1] != onCycleClass ? stateClasses[regionID][1] : stateClasses[regionID][0]]
          
          if (!filteredMapData[mapDate][regionID])
          {
            filteredMapData[mapDate][regionID] = {region: regionID, seatClass: seatClassesToUse[0], isSpecial: false, partyID: heldRegionMap[regionID + "-" + seatClassesToUse[0]], ...placeholderRegionData}
          }
          if (!filteredMapData[mapDate][regionID + "-S"])
          {
            filteredMapData[mapDate][regionID + "-S"] = {region: regionID + "-S", seatClass: seatClassesToUse[1], isSpecial: true, partyID: heldRegionMap[regionID + "-" + seatClassesToUse[1]], ...placeholderRegionData}
          }
        }
      }
      
      return {mapData: filteredMapData, mapDates: mapDates.sort()}
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
                if (candidateData[candidateName].votes && candidateVotes)
                {
                  candidateData[candidateName].votes += candidateVotes
                }
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
            filteredDateData[regionNameToID[regionToFind] + (shouldBeSpecialRegion ? "-S" : "")] = {region: regionNameToID[regionToFind] + (shouldBeSpecialRegion ? "-S" : ""), seatClass: classNum, offYear: isOffyear, runoff: isRunoffElection, isSpecial: isSpecialElection, disabled: mapDataRows[0][columnMap.isDisabled] == "TRUE", margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: partyIDToCandidateNames, partyVotesharePercentages: shouldIncludeVoteshare ? voteshareSortedCandidateData : null, flip: mapDataRows[0][columnMap.flip] == "TRUE" || (mostRecentParty != greatestMarginPartyID && mostRecentParty != TossupParty.getID())}
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
        return (regionData.runoff ?? false).toString().toUpperCase()

        case "isOffyear":
        return (regionData.offYear ?? false).toString().toUpperCase()

        case "isDisabled":
        return (regionData.disabled ?? false).toString().toUpperCase()
        
        case "flip":
        return (regionData.flip ?? false).toString().toUpperCase()
      }
    }

    var CNNSenateResults2022MapSource = new MapSource(
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
      regionIDToLinkBase, // regionIDToLinkMap
      heldSeatPartyIDs2022, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshareCNNFilterFunction, // organizeMapDataFunction
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
          linkToOpen += "senate"
        }
        else
        {
          linkToOpen += regionIDToLinkMap[regionID.replace("-S", "")] + "/" + "senate" + (regionID.endsWith("-S") ? "-2" : "")
        }

        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0 // voteshareCutoffMargin
    )
    
    var CNNSenateResults2024MapSource = new MapSource(
      "CNN-2024-Senate-Results", // id
      "CNN Results", // name
      {url: "https://politics.api.cnn.io/results/national-races/2024-SG.json", type: jsonSourceType}, // dataURL
      "https://www.cnn.com/election/2024/results/", // homepageURL
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
      2024, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkBase, // regionIDToLinkMap
      heldSeatPartyIDs2024, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshareCNNFilterFunction, // organizeMapDataFunction
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
          linkToOpen += "senate"
        }
        else
        {
          linkToOpen += regionIDToLinkMap[regionID.replace("-S", "")] + "/" + "senate" + (regionID.endsWith("-S") ? "-general-special-election" : "")
        }
    
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      0.0 // voteshareCutoffMargin
    )
    
    var FiveThirtyEightSenateProjection2022MapSource = new MapSource(
      "538-2022-Senate-Projection", // id
      "538 Projection", // name
      "./csv-sources/538-2022-senate-toplines.csv", // dataURL
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
      regionIDToLinkBase, // regionIDToLinkMap
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
    
        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0 // voteshareCutoffMargin
    )

    var FiveThirtyEightSenateProjection2024MapSource = new MapSource(
      "538-2024-Senate-Projection", // id
      "538 Projection", // name
      {url: "https://projects.fivethirtyeight.com/2024-election-forecast/senate/states_timeseries.json", type: jsonSourceType}, // dataURL
      "https://projects.fivethirtyeight.com/2024-election-forecast/senate/", // homepageURL
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
      heldSeatPartyIDs2024, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshare538FilterFunction, // organizeMapDataFunction
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
          linkToOpen += regionIDToLinkMap[regionID.replace("-S", "")] + (isSpecial ? "-2" : "")
        }

        return linkToOpen
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      true, // shouldShowVoteshare
      1.0 // voteshareCutoffMargin
    )
    
    var PolymarketSenate2024MapSource = new MapSource(
      "Polymarket-2024-Senate", // id
      "Polymarket", // name
      {url: "https://jacksonjude.com/USA-Election-Map-Data/data/2024-senate-polymarket-prices.json", type: jsonSourceType}, // dataURL
      "https://polymarket.com", // homepageURL
      {regular: "./assets/polymarket-large.png", mini: "./assets/polymarket.png"}, // iconURL
      {
        time: "t",
        price: "p"
      }, // columnMap
      2024, // cycleYear
      null, // candidateNameToPartyIDMap
      null, // shortCandidateNameOverride
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkBase, // regionIDToLinkMap
      heldSeatPartyIDs2024, // heldRegionMap
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
          
          linkToOpen += "/event/" + linkData + "-us-senate-election-winner" + (dataIsArray && linkData.length > 1 ? linkData[1] : "")
        }
        return linkToOpen
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

    var LTESenateProjection2022MapSource = new MapSource(
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
        return linkToOpen
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

    var PASenateProjection2022MapSource = new MapSource(
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
        return linkToOpen
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

    var CookSenateProjection2022MapSource = new MapSource(
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
        return homepageURL + (Cook2022SenateRatingIDs[mapDate.getUTCAdjustedTime()] || "")
      }, // customOpenRegionLinkFunction
      null, // updateCustomMapFunction
      null, // convertMapDataRowToCSVFunction
      null, // isCustomMap
      null, // shouldClearDisabled
      false // shouldShowVoteshare
    )

    var SCBSenateProjection2022MapSource = new MapSource(
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
      regionNameToIDHistorical, // regionNameToIDMap
      regionIDToLinkHistorical, // regionIDToLinkMap
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
        return linkToOpen
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
    senateMapSources[CNNSenateResults2022MapSource.getID()] = CNNSenateResults2022MapSource
    senateMapSources[CNNSenateResults2024MapSource.getID()] = CNNSenateResults2024MapSource
    senateMapSources[FiveThirtyEightSenateProjection2022MapSource.getID()] = FiveThirtyEightSenateProjection2022MapSource
    senateMapSources[FiveThirtyEightSenateProjection2024MapSource.getID()] = FiveThirtyEightSenateProjection2024MapSource
    senateMapSources[PolymarketSenate2024MapSource.getID()] = PolymarketSenate2024MapSource
    senateMapSources[LTESenateProjection2022MapSource.getID()] = LTESenateProjection2022MapSource
    senateMapSources[PASenateProjection2022MapSource.getID()] = PASenateProjection2022MapSource
    senateMapSources[CookSenateProjection2022MapSource.getID()] = CookSenateProjection2022MapSource
    senateMapSources[SCBSenateProjection2022MapSource.getID()] = SCBSenateProjection2022MapSource
    senateMapSources[PastElectionResultMapSource.getID()] = PastElectionResultMapSource
    senateMapSources[CustomMapSource.getID()] = CustomMapSource

    const senateMapCycles = [2024, 2022]
    const senateMapSourceIDs = {
      [2022]: [FiveThirtyEightSenateProjection2022MapSource.getID(), LTESenateProjection2022MapSource.getID(), PASenateProjection2022MapSource.getID(), CookSenateProjection2022MapSource.getID(), SCBSenateProjection2022MapSource.getID()],
      [2024]: [CNNSenateResults2024MapSource.getID(), FiveThirtyEightSenateProjection2024MapSource.getID(), PolymarketSenate2024MapSource.getID()],
      [allYearsCycle]: [PastElectionResultMapSource.getID(), CustomMapSource.getID()]
    }
    
    const kCNNVs538Projection = 1
    const kPastElectionsVsPastElections = 2
    const kPastElectionsVs538Projection = 3

    var defaultSenateCompareSourceIDs = {}
    defaultSenateCompareSourceIDs[kCNNVs538Projection] = [CNNSenateResults2024MapSource.getID(), PastElectionResultMapSource.getID()]
    defaultSenateCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
    defaultSenateCompareSourceIDs[kPastElectionsVs538Projection] = [PastElectionResultMapSource.getID(), FiveThirtyEightSenateProjection2024MapSource.getID()]

    return {mapSources: senateMapSources, mapSourceIDs: senateMapSourceIDs, mapCycles: senateMapCycles, defaultCompareSourceIDs: defaultSenateCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)
