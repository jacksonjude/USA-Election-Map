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
  () => {
    const regionNameToIDHistorical = {"AL":"AL", "AK":"AK", "AZ":"AZ", "AR":"AR", "CA":"CA", "CO":"CO", "CT":"CT", "DE":"DE", "FL":"FL", "GA":"GA", "HI":"HI", "ID":"ID", "IL":"IL", "IN":"IN", "IA":"IA", "KS":"KS", "KY":"KY", "LA":"LA", "ME":"ME", "MD":"MD", "MA":"MA", "MI":"MI", "MN":"MN", "MS":"MS", "MO":"MO", "MT":"MT", "NE":"NE", "NV":"NV", "NH":"NH", "NJ":"NJ", "NM":"NM", "NY":"NY", "NC":"NC", "ND":"ND", "OH":"OH", "OK":"OK", "OR":"OR", "PA":"PA", "RI":"RI", "SC":"SC", "SD":"SD", "TN":"TN", "TX":"TX", "UT":"UT", "VT":"VT", "VA":"VA", "WA":"WA", "WV":"WV", "WI":"WI", "WY":"WY", [nationalPopularVoteID]:nationalPopularVoteID}
    
    const democraticPartyID = DemocraticParty.getID()
    const republicanPartyID = RepublicanParty.getID()
    
    const heldSeatPartyIDs2024 = {"AK__0": democraticPartyID, "AL__1": republicanPartyID, "AL__2": republicanPartyID, "AL__3": republicanPartyID, "AL__4": republicanPartyID, "AL__5": republicanPartyID, "AL__6": republicanPartyID, "AL__7": democraticPartyID, "AR__1": republicanPartyID, "AR__2": republicanPartyID, "AR__3": republicanPartyID, "AR__4": republicanPartyID, "AZ__1": republicanPartyID, "AZ__2": republicanPartyID, "AZ__3": democraticPartyID, "AZ__4": democraticPartyID, "AZ__5": republicanPartyID, "AZ__6": republicanPartyID, "AZ__7": democraticPartyID, "AZ__8": republicanPartyID, "AZ__9": republicanPartyID, "CA__1": republicanPartyID, "CA__2": democraticPartyID, "CA__3": republicanPartyID, "CA__4": democraticPartyID, "CA__5": republicanPartyID, "CA__6": democraticPartyID, "CA__7": democraticPartyID, "CA__8": democraticPartyID, "CA__9": democraticPartyID, "CA__10": democraticPartyID, "CA__11": democraticPartyID, "CA__12": democraticPartyID, "CA__13": republicanPartyID, "CA__14": democraticPartyID, "CA__15": democraticPartyID, "CA__16": democraticPartyID, "CA__17": democraticPartyID, "CA__18": democraticPartyID, "CA__19": democraticPartyID, "CA__20": republicanPartyID, "CA__21": democraticPartyID, "CA__22": republicanPartyID, "CA__23": republicanPartyID, "CA__24": democraticPartyID, "CA__25": democraticPartyID, "CA__26": democraticPartyID, "CA__27": republicanPartyID, "CA__28": democraticPartyID, "CA__29": democraticPartyID, "CA__30": democraticPartyID, "CA__31": democraticPartyID, "CA__32": democraticPartyID, "CA__33": democraticPartyID, "CA__34": democraticPartyID, "CA__35": democraticPartyID, "CA__36": democraticPartyID, "CA__37": democraticPartyID, "CA__38": democraticPartyID, "CA__39": democraticPartyID, "CA__40": republicanPartyID, "CA__41": republicanPartyID, "CA__42": democraticPartyID, "CA__43": democraticPartyID, "CA__44": democraticPartyID, "CA__45": republicanPartyID, "CA__46": democraticPartyID, "CA__47": democraticPartyID, "CA__48": republicanPartyID, "CA__49": democraticPartyID, "CA__50": democraticPartyID, "CA__51": democraticPartyID, "CA__52": democraticPartyID, "CO__1": democraticPartyID, "CO__2": democraticPartyID, "CO__3": republicanPartyID, "CO__4": republicanPartyID, "CO__5": republicanPartyID, "CO__6": democraticPartyID, "CO__7": democraticPartyID, "CO__8": democraticPartyID, "CT__1": democraticPartyID, "CT__2": democraticPartyID, "CT__3": democraticPartyID, "CT__4": democraticPartyID, "CT__5": democraticPartyID, "DE__0": democraticPartyID, "FL__1": republicanPartyID, "FL__2": republicanPartyID, "FL__3": republicanPartyID, "FL__4": republicanPartyID, "FL__5": republicanPartyID, "FL__6": republicanPartyID, "FL__7": republicanPartyID, "FL__8": republicanPartyID, "FL__9": democraticPartyID, "FL__10": democraticPartyID, "FL__11": republicanPartyID, "FL__12": republicanPartyID, "FL__13": republicanPartyID, "FL__14": democraticPartyID, "FL__15": republicanPartyID, "FL__16": republicanPartyID, "FL__17": republicanPartyID, "FL__18": republicanPartyID, "FL__19": republicanPartyID, "FL__20": democraticPartyID, "FL__21": republicanPartyID, "FL__22": democraticPartyID, "FL__23": democraticPartyID, "FL__24": democraticPartyID, "FL__25": democraticPartyID, "FL__26": republicanPartyID, "FL__27": republicanPartyID, "FL__28": republicanPartyID, "GA__1": republicanPartyID, "GA__2": democraticPartyID, "GA__3": republicanPartyID, "GA__4": democraticPartyID, "GA__5": democraticPartyID, "GA__6": republicanPartyID, "GA__7": democraticPartyID, "GA__8": republicanPartyID, "GA__9": republicanPartyID, "GA__10": republicanPartyID, "GA__11": republicanPartyID, "GA__12": republicanPartyID, "GA__13": democraticPartyID, "GA__14": republicanPartyID, "HI__1": democraticPartyID, "HI__2": democraticPartyID, "IA__1": republicanPartyID, "IA__2": republicanPartyID, "IA__3": republicanPartyID, "IA__4": republicanPartyID, "ID__1": republicanPartyID, "ID__2": republicanPartyID, "IL__1": democraticPartyID, "IL__2": democraticPartyID, "IL__3": democraticPartyID, "IL__4": democraticPartyID, "IL__5": democraticPartyID, "IL__6": democraticPartyID, "IL__7": democraticPartyID, "IL__8": democraticPartyID, "IL__9": democraticPartyID, "IL__10": democraticPartyID, "IL__11": democraticPartyID, "IL__12": republicanPartyID, "IL__13": democraticPartyID, "IL__14": democraticPartyID, "IL__15": republicanPartyID, "IL__16": republicanPartyID, "IL__17": democraticPartyID, "IN__1": democraticPartyID, "IN__2": republicanPartyID, "IN__3": republicanPartyID, "IN__4": republicanPartyID, "IN__5": republicanPartyID, "IN__6": republicanPartyID, "IN__7": democraticPartyID, "IN__8": republicanPartyID, "IN__9": republicanPartyID, "KS__1": republicanPartyID, "KS__2": republicanPartyID, "KS__3": democraticPartyID, "KS__4": republicanPartyID, "KY__1": republicanPartyID, "KY__2": republicanPartyID, "KY__3": democraticPartyID, "KY__4": republicanPartyID, "KY__5": republicanPartyID, "KY__6": republicanPartyID, "LA__1": republicanPartyID, "LA__2": democraticPartyID, "LA__3": republicanPartyID, "LA__4": republicanPartyID, "LA__5": republicanPartyID, "LA__6": republicanPartyID, "MA__1": democraticPartyID, "MA__2": democraticPartyID, "MA__3": democraticPartyID, "MA__4": democraticPartyID, "MA__5": democraticPartyID, "MA__6": democraticPartyID, "MA__7": democraticPartyID, "MA__8": democraticPartyID, "MA__9": democraticPartyID, "MD__1": republicanPartyID, "MD__2": democraticPartyID, "MD__3": democraticPartyID, "MD__4": democraticPartyID, "MD__5": democraticPartyID, "MD__6": democraticPartyID, "MD__7": democraticPartyID, "MD__8": democraticPartyID, "ME__1": democraticPartyID, "ME__2": democraticPartyID, "MI__1": republicanPartyID, "MI__2": republicanPartyID, "MI__3": democraticPartyID, "MI__4": republicanPartyID, "MI__5": republicanPartyID, "MI__6": democraticPartyID, "MI__7": democraticPartyID, "MI__8": democraticPartyID, "MI__9": republicanPartyID, "MI__10": republicanPartyID, "MI__11": democraticPartyID, "MI__12": democraticPartyID, "MI__13": democraticPartyID, "MN__1": republicanPartyID, "MN__2": democraticPartyID, "MN__3": democraticPartyID, "MN__4": democraticPartyID, "MN__5": democraticPartyID, "MN__6": republicanPartyID, "MN__7": republicanPartyID, "MN__8": republicanPartyID, "MO__1": democraticPartyID, "MO__2": republicanPartyID, "MO__3": republicanPartyID, "MO__4": republicanPartyID, "MO__5": democraticPartyID, "MO__6": republicanPartyID, "MO__7": republicanPartyID, "MO__8": republicanPartyID, "MS__1": republicanPartyID, "MS__2": democraticPartyID, "MS__3": republicanPartyID, "MS__4": republicanPartyID, "MT__1": republicanPartyID, "MT__2": republicanPartyID, "NC__1": democraticPartyID, "NC__2": democraticPartyID, "NC__3": republicanPartyID, "NC__4": democraticPartyID, "NC__5": republicanPartyID, "NC__6": democraticPartyID, "NC__7": republicanPartyID, "NC__8": republicanPartyID, "NC__9": republicanPartyID, "NC__10": republicanPartyID, "NC__11": republicanPartyID, "NC__12": democraticPartyID, "NC__13": democraticPartyID, "NC__14": democraticPartyID, "ND__0": republicanPartyID, "NE__1": republicanPartyID, "NE__2": republicanPartyID, "NE__3": republicanPartyID, "NH__1": democraticPartyID, "NH__2": democraticPartyID, "NJ__1": democraticPartyID, "NJ__2": republicanPartyID, "NJ__3": democraticPartyID, "NJ__4": republicanPartyID, "NJ__5": democraticPartyID, "NJ__6": democraticPartyID, "NJ__7": republicanPartyID, "NJ__8": democraticPartyID, "NJ__9": democraticPartyID, "NJ__10": democraticPartyID, "NJ__11": democraticPartyID, "NJ__12": democraticPartyID, "NM__1": democraticPartyID, "NM__2": democraticPartyID, "NM__3": democraticPartyID, "NV__1": democraticPartyID, "NV__2": republicanPartyID, "NV__3": democraticPartyID, "NV__4": democraticPartyID, "NY__1": republicanPartyID, "NY__2": republicanPartyID, "NY__3": republicanPartyID, "NY__4": republicanPartyID, "NY__5": democraticPartyID, "NY__6": democraticPartyID, "NY__7": democraticPartyID, "NY__8": democraticPartyID, "NY__9": democraticPartyID, "NY__10": democraticPartyID, "NY__11": republicanPartyID, "NY__12": democraticPartyID, "NY__13": democraticPartyID, "NY__14": democraticPartyID, "NY__15": democraticPartyID, "NY__16": democraticPartyID, "NY__17": republicanPartyID, "NY__18": democraticPartyID, "NY__19": republicanPartyID, "NY__20": democraticPartyID, "NY__21": republicanPartyID, "NY__22": republicanPartyID, "NY__23": republicanPartyID, "NY__24": republicanPartyID, "NY__25": democraticPartyID, "NY__26": democraticPartyID, "OH__1": democraticPartyID, "OH__2": republicanPartyID, "OH__3": democraticPartyID, "OH__4": republicanPartyID, "OH__5": republicanPartyID, "OH__6": republicanPartyID, "OH__7": republicanPartyID, "OH__8": republicanPartyID, "OH__9": democraticPartyID, "OH__10": republicanPartyID, "OH__11": democraticPartyID, "OH__12": republicanPartyID, "OH__13": democraticPartyID, "OH__14": republicanPartyID, "OH__15": republicanPartyID, "OK__1": republicanPartyID, "OK__2": republicanPartyID, "OK__3": republicanPartyID, "OK__4": republicanPartyID, "OK__5": republicanPartyID, "OR__1": democraticPartyID, "OR__2": republicanPartyID, "OR__3": democraticPartyID, "OR__4": democraticPartyID, "OR__5": republicanPartyID, "OR__6": democraticPartyID, "PA__1": republicanPartyID, "PA__2": democraticPartyID, "PA__3": democraticPartyID, "PA__4": democraticPartyID, "PA__5": democraticPartyID, "PA__6": democraticPartyID, "PA__7": democraticPartyID, "PA__8": democraticPartyID, "PA__9": republicanPartyID, "PA__10": republicanPartyID, "PA__11": republicanPartyID, "PA__12": democraticPartyID, "PA__13": republicanPartyID, "PA__14": republicanPartyID, "PA__15": republicanPartyID, "PA__16": republicanPartyID, "PA__17": democraticPartyID, "RI__1": democraticPartyID, "RI__2": democraticPartyID, "SC__1": republicanPartyID, "SC__2": republicanPartyID, "SC__3": republicanPartyID, "SC__4": republicanPartyID, "SC__5": republicanPartyID, "SC__6": democraticPartyID, "SC__7": republicanPartyID, "SD__0": republicanPartyID, "TN__1": republicanPartyID, "TN__2": republicanPartyID, "TN__3": republicanPartyID, "TN__4": republicanPartyID, "TN__5": republicanPartyID, "TN__6": republicanPartyID, "TN__7": republicanPartyID, "TN__8": republicanPartyID, "TN__9": democraticPartyID, "TX__1": republicanPartyID, "TX__2": republicanPartyID, "TX__3": republicanPartyID, "TX__4": republicanPartyID, "TX__5": republicanPartyID, "TX__6": republicanPartyID, "TX__7": democraticPartyID, "TX__8": republicanPartyID, "TX__9": democraticPartyID, "TX__10": republicanPartyID, "TX__11": republicanPartyID, "TX__12": republicanPartyID, "TX__13": republicanPartyID, "TX__14": republicanPartyID, "TX__15": republicanPartyID, "TX__16": democraticPartyID, "TX__17": republicanPartyID, "TX__18": democraticPartyID, "TX__19": republicanPartyID, "TX__20": democraticPartyID, "TX__21": republicanPartyID, "TX__22": republicanPartyID, "TX__23": republicanPartyID, "TX__24": republicanPartyID, "TX__25": republicanPartyID, "TX__26": republicanPartyID, "TX__27": republicanPartyID, "TX__28": democraticPartyID, "TX__29": democraticPartyID, "TX__30": democraticPartyID, "TX__31": republicanPartyID, "TX__32": democraticPartyID, "TX__33": democraticPartyID, "TX__34": democraticPartyID, "TX__35": democraticPartyID, "TX__36": republicanPartyID, "TX__37": democraticPartyID, "TX__38": republicanPartyID, "UT__1": republicanPartyID, "UT__2": republicanPartyID, "UT__3": republicanPartyID, "UT__4": republicanPartyID, "VA__1": republicanPartyID, "VA__2": republicanPartyID, "VA__3": democraticPartyID, "VA__4": democraticPartyID, "VA__5": republicanPartyID, "VA__6": republicanPartyID, "VA__7": democraticPartyID, "VA__8": democraticPartyID, "VA__9": republicanPartyID, "VA__10": democraticPartyID, "VA__11": democraticPartyID, "VT__0": democraticPartyID, "WA__1": democraticPartyID, "WA__2": democraticPartyID, "WA__3": democraticPartyID, "WA__4": republicanPartyID, "WA__5": republicanPartyID, "WA__6": democraticPartyID, "WA__7": democraticPartyID, "WA__8": democraticPartyID, "WA__9": democraticPartyID, "WA__10": democraticPartyID, "WI__1": republicanPartyID, "WI__2": democraticPartyID, "WI__3": republicanPartyID, "WI__4": democraticPartyID, "WI__5": republicanPartyID, "WI__6": republicanPartyID, "WI__7": republicanPartyID, "WI__8": republicanPartyID, "WV__2": republicanPartyID, "WV__1": republicanPartyID, "WY__0": republicanPartyID}

    var jsonVoteshareCNNFilterFunction = function(rawMapData, _, columnMap, __, ___, ____, _____, ______, _______, voteshareCutoffMargin)
    {
      let racesToIgnore = []
      let candidateExceptions = {"None of these candidates": "None"}
      let unopposedRaceDefaults = {
        "FL__20": democraticPartyID,
        "OK__3": republicanPartyID
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
          
          const shouldSetHold = reportingPercent <= 0 && unopposedRaceDefaults[regionID] == partyID

          formattedCandidatesArray.push({candidate: candidateName, partyID: partyID, voteshare: totalVotes > 0 ? candidateVotes/totalVotes*100 : (shouldSetHold ? 101 : 0), votes: candidateVotes})
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
    
    var jsonVoteshare538FilterFunction = function(rawMapData, _, columnMap, __, ___, ____, heldRegionMap)
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
          
          filteredMapData[date][formattedRegion] = {region: formattedRegion, state: stateDistrictPair[0], district: stateDistrictPair[1], margin: topTwoMargin, partyID: greatestMarginPartyID, candidateName: greatestMarginCandidateName, candidateMap: invertObject(candidateToPartyID), partyVotesharePercentages: voteshareSortedCandidateData, flip: heldRegionMap[formattedRegion] != greatestMarginPartyID}
        }
      }
      
      return {mapData: filteredMapData, mapDates: mapDates.sort()}
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
        
        const svgYears = [2024, 2022, 2020, 2018, 2016, 2012, 2006, 2004, 2002, 1998, 1996, 1994, 1992, 1984, 1982, 1976]
        
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

    var CNNHouseResults2022MapSource = new MapSource(
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
    
    var CNNHouseResults2024MapSource = new MapSource(
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
      {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}, // regionIDToLinkMap
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
    
        window.open(linkToOpen)
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
    
    var FiveThirtyEightHouseProjection2022MapSource = new MapSource(
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

    var FiveThirtyEightHouseProjection2024MapSource = new MapSource(
      "538-2024-House-Projection", // id
      "538 Projection", // name
      {url: "https://projects.fivethirtyeight.com/2024-election-forecast/house/states_timeseries.json", type: jsonSourceType}, // dataURL
      "https://projects.fivethirtyeight.com/2024-election-forecast/house/", // homepageURL
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
      {"AL":"alabama", "AK":"alaska", "AZ":"arizona", "AR":"arkansas", "CA":"california", "CO":"colorado", "CT":"connecticut", "DE":"delaware", "FL":"florida", "GA":"georgia", "HI":"hawaii", "ID":"idaho", "IL":"illinois", "IN":"indiana", "IA":"iowa", "KS":"kansas", "KY":"kentucky", "LA":"louisiana", "ME":"maine", "MD":"maryland", "MA":"massachusetts", "MI":"michigan", "MN":"minnesota", "MS":"mississippi", "MO":"missouri", "MT":"montana", "NE":"nebraska", "NV":"nevada", "NH":"new-hampshire", "NJ":"new-jersey", "NM":"new-mexico", "NY":"new-york", "NC":"north-carolina", "ND":"north-dakota", "OH":"ohio", "OK":"oklahoma", "OR":"oregon", "PA":"pennsylvania", "RI":"rhode-island", "SC":"south-carolina", "SD":"south-dakota", "TN":"tennessee", "TX":"texas", "UT":"utah", "VT":"vermont", "VA":"virginia", "WA":"washington", "WV":"west-virginia", "WI":"wisconsin", "WY":"wyoming"}, // regionIDToLinkMap
      heldSeatPartyIDs2024, // heldRegionMap
      false, // shouldFilterOutDuplicateRows
      true, // addDecimalPadding
      jsonVoteshare538FilterFunction, // organizeMapDataFunction
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
    houseMapSources[FiveThirtyEightHouseProjection2022MapSource.getID()] = FiveThirtyEightHouseProjection2022MapSource
    houseMapSources[FiveThirtyEightHouseProjection2024MapSource.getID()] = FiveThirtyEightHouseProjection2024MapSource
    houseMapSources[CNNHouseResults2022MapSource.getID()] = CNNHouseResults2022MapSource
    houseMapSources[CNNHouseResults2024MapSource.getID()] = CNNHouseResults2024MapSource
    houseMapSources[CustomMapSource.getID()] = CustomMapSource

    const houseMapCycles = [2024, 2022]
    const houseMapSourceIDs = {
      2024: [CNNHouseResults2024MapSource.getID(), FiveThirtyEightHouseProjection2024MapSource.getID()],
      2022: [FiveThirtyEightHouseProjection2022MapSource.getID()],
      [allYearsCycle]: [PastElectionResultMapSource.getID(), CustomMapSource.getID()]
    }
    
    const kCNNVs538Projection = 1
    const kPastElectionsVsPastElections = 2
    const k538ProjectionVsPastElections = 3

    var defaultHouseCompareSourceIDs = {}
    defaultHouseCompareSourceIDs[kCNNVs538Projection] = [CNNHouseResults2024MapSource.getID(), PastElectionResultMapSource.getID()]
    defaultHouseCompareSourceIDs[kPastElectionsVsPastElections] = [PastElectionResultMapSource.getID(), PastElectionResultMapSource.getID()]
    defaultHouseCompareSourceIDs[k538ProjectionVsPastElections] = [FiveThirtyEightHouseProjection2024MapSource.getID(), PastElectionResultMapSource.getID()]

    return {mapSources: houseMapSources, mapSourceIDs: houseMapSourceIDs, mapCycles: houseMapCycles, defaultCompareSourceIDs: defaultHouseCompareSourceIDs, customSourceID: CustomMapSource.getID()}
  }
)
