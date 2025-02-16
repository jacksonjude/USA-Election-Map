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
  
  JJUMapCountry.setMapTypes({
    [JJUHouseMapType.getID()]: JJUHouseMapType
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