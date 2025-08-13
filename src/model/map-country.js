class MapCountry
{
  constructor(id, name, shortName, iconURL)
  {
    this.id = id
    this.name = name
    this.shortName = shortName
    this.iconURL = iconURL
  }

  getID()
  {
    return this.id
  }

  getName()
  {
    return this.name
  }

  getShortName()
  {
    return this.shortName
  }

  getIconURL()
  {
    return this.iconURL
  }
  
  setMapTypes(mapTypes)
  {
    this.mapTypes = mapTypes
    this.mapTypeIDs = Object.keys(mapTypes)
  }

  getMapTypes()
  {
    return this.mapTypes
  }
  
  getMapTypeIDs()
  {
    return this.mapTypeIDs
  }
  
  setPoliticalPartyData(politicalParties, defaultDropdownPartyIDs, mainPoliticalPartyIDs, majorThirdPartyCandidateIDs)
  {
    this.politicalParties = politicalParties
    this.defaultDropdownPartyIDs = defaultDropdownPartyIDs
    this.mainPoliticalPartyIDs = mainPoliticalPartyIDs
    this.majorThirdPartyCandidateIDs = majorThirdPartyCandidateIDs
  }
  
  getPoliticalPartyData()
  {
    return {parties: this.politicalParties, dropdownIDs: this.defaultDropdownPartyIDs, mainIDs: this.mainPoliticalPartyIDs, majorThirdPartyCandidateIDs: this.majorThirdPartyCandidateIDs}
  }
  
  setCountdownTimes(countdownTimes)
  {
    this.countdownTimes = countdownTimes
  }
  
  getCountdownTimes()
  {
    return this.countdownTimes ?? {}
  }
}

let mapCountries = {}
let mapCountryIDs = []

function setMapCountries()
{
  USAMapCountry.setMapTypes({
    [USAPresidentMapType.getID()]: USAPresidentMapType,
    [USASenateMapType.getID()]: USASenateMapType,
    [USAGovernorMapType.getID()]: USAGovernorMapType,
    [USAHouseMapType.getID()]: USAHouseMapType
  })
  
  USAMapCountry.setPoliticalPartyData(
    {
      [TossupParty.getID()]: TossupParty,
      [DemocraticParty.getID()]: DemocraticParty,
      [RepublicanParty.getID()]: RepublicanParty,
      [WhigParty.getID()]: WhigParty,
      [NationalRepublicanParty.getID()]: NationalRepublicanParty,
      [DemocraticRepublicanParty.getID()]: DemocraticRepublicanParty,
      [FederalistParty.getID()]: FederalistParty,
      [LibertarianParty.getID()]: LibertarianParty,
      [GreenParty.getID()]: GreenParty,
      [ReformParty.getID()]: ReformParty,
      [FreeSoilParty.getID()]: FreeSoilParty,
      [IndependentRNParty.getID()]: IndependentRNParty,
      [Independent2024RFKParty.getID()]: Independent2024RFKParty,
      [Independent2016EMParty.getID()]: Independent2016EMParty,
      [Independent2016CPParty.getID()]: Independent2016CPParty,
      [Independent2016BSParty.getID()]: Independent2016BSParty,
      [Independent2016RPParty.getID()]: Independent2016RPParty,
      [Independent2016JKParty.getID()]: Independent2016JKParty,
      [Independent2016SEParty.getID()]: Independent2016SEParty,
      [Independent2004JEParty.getID()]: Independent2004JEParty,
      [Independent1988LBParty.getID()]: Independent1988LBParty,
      [Independent1980JAParty.getID()]: Independent1980JAParty,
      [Independent1976EMParty.getID()]: Independent1976EMParty,
      [Independent1976RRParty.getID()]: Independent1976RRParty,
      [Independent1968GWParty.getID()]: Independent1968GWParty,
      [Independent1960HBParty.getID()]: Independent1960HBParty,
      [Independent1956WJParty.getID()]: Independent1956WJParty,
      [Independent1948SMParty.getID()]: Independent1948SMParty,
      [Independent1948HWParty.getID()]: Independent1948HWParty,
      [Independent1932NTParty.getID()]: Independent1932NTParty,
      [Independent1924RLParty.getID()]: Independent1924RLParty,
      [Independent1920EDParty.getID()]: Independent1920EDParty,
      [Independent1916ABParty.getID()]: Independent1916ABParty,
      [Independent1912TRParty.getID()]: Independent1912TRParty,
      [Independent1912EDParty.getID()]: Independent1912EDParty,
      [Independent1892JWParty.getID()]: Independent1892JWParty,
      [Independent1892JBParty.getID()]: Independent1892JBParty,
      [Independent1888CFParty.getID()]: Independent1888CFParty,
      [Independent1860JohnBreckenridgeParty.getID()]: Independent1860JohnBreckenridgeParty,
      [Independent1860JohnBellParty.getID()]: Independent1860JohnBellParty,
      [Independent1856MFParty.getID()]: Independent1856MFParty,
      [Independent1844JBParty.getID()]: Independent1844JBParty,
      [Independent1836HWParty.getID()]: Independent1836HWParty,
      [Independent1836DWParty.getID()]: Independent1836DWParty,
      [Independent1836WMParty.getID()]: Independent1836WMParty,
      [Independent1832WWParty.getID()]: Independent1832WWParty,
      [Independent1832JFParty.getID()]: Independent1832JFParty,
      [Independent1824AJParty.getID()]: Independent1824AJParty,
      [Independent1824WCParty.getID()]: Independent1824WCParty,
      [Independent1824HCParty.getID()]: Independent1824HCParty,
      [Independent1820JAParty.getID()]: Independent1820JAParty,
      [Independent1808GCParty.getID()]: Independent1808GCParty,
      [IndependentGWParty.getID()]: IndependentGWParty,
      [IndependentGenericParty.getID()]: IndependentGenericParty
    },
    [
      DemocraticParty.getID(),
      RepublicanParty.getID()
    ],
    [
      TossupParty.getID(),
      DemocraticParty.getID(),
      RepublicanParty.getID(),
      LibertarianParty.getID(),
      GreenParty.getID(),
      WhigParty.getID(),
      FreeSoilParty.getID(),
      NationalRepublicanParty.getID(),
      DemocraticRepublicanParty.getID(),
      FederalistParty.getID(),
      IndependentGenericParty.getID()
    ],
    [
      Independent2024RFKParty.getID(),
      Independent2016EMParty.getID(),
      Independent2004JEParty.getID(),
      Independent1988LBParty.getID(),
      Independent1980JAParty.getID(),
      Independent1976EMParty.getID(),
      Independent1976RRParty.getID(),
      Independent1968GWParty.getID(),
      Independent1960HBParty.getID(),
      Independent1956WJParty.getID(),
      Independent1948SMParty.getID(),
      Independent1948HWParty.getID(),
      Independent1932NTParty.getID(),
      Independent1924RLParty.getID(),
      Independent1920EDParty.getID(),
      Independent1916ABParty.getID(),
      Independent1912TRParty.getID(),
      Independent1912EDParty.getID(),
      Independent1892JWParty.getID(),
      Independent1892JBParty.getID(),
      Independent1888CFParty.getID(),
      Independent1860JohnBreckenridgeParty.getID(),
      Independent1860JohnBellParty.getID(),
      Independent1856MFParty.getID(),
      Independent1844JBParty.getID(),
      Independent1836HWParty.getID(),
      Independent1836DWParty.getID(),
      Independent1836WMParty.getID(),
      Independent1832WWParty.getID(),
      Independent1832JFParty.getID(),
      Independent1824AJParty.getID(),
      Independent1824WCParty.getID(),
      Independent1824HCParty.getID(),
      Independent1820JAParty.getID(),
      Independent1808GCParty.getID(),
      IndependentGWParty.getID()
    ]
  )
  
  USAMapCountry.setCountdownTimes({
    // "2020 Presidential Election": {time: 1604444400000, url: "https://en.wikipedia.org/wiki/2020_United_States_presidential_election"},
    // "2021 Inauguration Day": {time: 1611162000000, url: "https://en.wikipedia.org/wiki/Inauguration_of_Joe_Biden"},
    // "2022 Midterm Elections": {time: 1667948400000, url: "https://en.wikipedia.org/wiki/2022_United_States_elections"},
    "2024 Presidential Election": {time: 1730847600000, url: "https://en.wikipedia.org/wiki/2024_United_States_presidential_election"},
    "2025 Inauguration Day": {time: 1737392400000, url: null},
    "2026 Midterm Elections": {time: 1793746800000, url: "https://en.wikipedia.org/wiki/2026_United_States_elections"},
  })
  
  JJUMapCountry.setMapTypes({
    [JJUHouseMapType.getID()]: JJUHouseMapType,
    [JJUPresidentMapType.getID()]: JJUPresidentMapType,
    [JJUGovernorMapType.getID()]: JJUGovernorMapType
  })
  
  JJUMapCountry.setPoliticalPartyData(
    {
      [TossupParty.getID()]: TossupParty,
      [JJULabourParty.getID()]: JJULabourParty,
      [JJULiberalParty.getID()]: JJULiberalParty,
      [JJUAllianceParty.getID()]: JJUAllianceParty,
      [JJUProgressiveParty.getID()]: JJUProgressiveParty,
      [JJUWildroseParty.getID()]: JJUWildroseParty,
      [JJULabLibPartyBloc.getID()]: JJULabLibPartyBloc,
      [JJULibConPartyBloc.getID()]: JJULibConPartyBloc,
      [JJULabourConPartyBloc.getID()]: JJULabourConPartyBloc,
      [JJUWatermelonPartyBloc.getID()]: JJUWatermelonPartyBloc,
      [JJUCitrusPartyBloc.getID()]: JJUCitrusPartyBloc,
      [JJUTrafficLightPartyBloc.getID()]: JJUTrafficLightPartyBloc,
      [JJUUnityPartyBloc.getID()]: JJUUnityPartyBloc,
      [IndependentGenericParty.getID()]: IndependentGenericParty
    },
    [
      JJULabourParty.getID(),
      JJULiberalParty.getID(),
      JJUAllianceParty.getID(),
      JJUProgressiveParty.getID()
    ],
    [
      TossupParty.getID(),
      JJULabourParty.getID(),
      JJULiberalParty.getID(),
      JJUAllianceParty.getID(),
      JJUProgressiveParty.getID(),
      JJUWildroseParty.getID(),
      JJULabLibPartyBloc.getID(),
      JJULibConPartyBloc.getID(),
      JJULabourConPartyBloc.getID(),
      JJUWatermelonPartyBloc.getID(),
      JJUCitrusPartyBloc.getID(),
      JJUTrafficLightPartyBloc.getID(),
      JJUUnityPartyBloc.getID(),
      IndependentGenericParty.getID()
    ],
    []
  )
  
  JJUMapCountry.setCountdownTimes({
    "June 2025 General Election": {time: 1750032000000, url: null},
    "July 2025 Midterm Elections": {time: 1753056000000, url: null},
    "August 2025 Snap Elections": {time: 1754265600000, url: null},
    "September 2025 General Election": {time: 1757289600000, url: null}
  })
  
  mapCountries[USAMapCountry.getID()] = USAMapCountry
  mapCountries[JJUMapCountry.getID()] = JJUMapCountry

  mapCountryIDs = [USAMapCountry.getID(), JJUMapCountry.getID()]
}

let USAMapCountry = new MapCountry(
  "USA",
  "United States",
  "USA",
  "assets/usa-flag.png"
)

let JJUMapCountry = new MapCountry(
  "JJU",
  "Jacksonia",
  "JJU",
  "assets/jju-flag.png"
)