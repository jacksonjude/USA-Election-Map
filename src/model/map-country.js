class MapCountry
{
  constructor(id, name, shortName, iconURL, createMapCountrySetup)
  {
    this.id = id
    this.name = name
    this.shortName = shortName
    this.iconURL = iconURL
    this.createMapCountrySetup = createMapCountrySetup
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
  
  setupMapCountry()
  {
    const {mapTypes, defaultMapTypeID, politicalPartyData, countdownTimes} = this.createMapCountrySetup()
    
    this.mapTypes = mapTypes
    this.mapTypeIDs = Object.keys(mapTypes)
    
    this.defaultMapTypeID = defaultMapTypeID
    
    const {politicalParties, defaultDropdownPartyIDs, mainPoliticalPartyIDs, majorThirdPartyCandidateIDs} = politicalPartyData
    this.politicalParties = politicalParties
    this.defaultDropdownPartyIDs = defaultDropdownPartyIDs
    this.mainPoliticalPartyIDs = mainPoliticalPartyIDs
    this.majorThirdPartyCandidateIDs = majorThirdPartyCandidateIDs
    
    this.countdownTimes = countdownTimes
  }

  getMapTypes()
  {
    return this.mapTypes
  }
  
  getMapTypeIDs()
  {
    return this.mapTypeIDs
  }
  
  getDefaultMapTypeID()
  {
    return this.defaultMapTypeID ?? this.mapTypeIDs[0]
  }
  
  getPoliticalPartyData()
  {
    return {parties: this.politicalParties, dropdownIDs: this.defaultDropdownPartyIDs, mainIDs: this.mainPoliticalPartyIDs, majorThirdPartyCandidateIDs: this.majorThirdPartyCandidateIDs}
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
  const countries = [USAMapCountry, JJUMapCountry]
  
  for (const country of countries)
  {
    country.setupMapCountry()
    mapCountries[country.getID()] = country
    mapCountryIDs.push(country.getID())
  }
}