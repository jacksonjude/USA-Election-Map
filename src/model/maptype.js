class MapType
{
  constructor(id, name, shortName, iconURL, svgPath, totalEV, evFunction, shouldDisplayEVOnMap, secondarySliderIncrement, regionNameToID, regionsToHideOnDisable, mapSettingsLayout)
  {
    this.id = id
    this.name = name
    this.shortName = shortName
    this.iconURL = iconURL
    this.svgPath = svgPath
    this.totalEV = totalEV
    this.evFunction = evFunction
    this.shouldDisplayEVOnMap = shouldDisplayEVOnMap
    this.secondarySliderIncrement = secondarySliderIncrement
    this.regionNameToID = regionNameToID
    this.regionsToHideOnDisable = regionsToHideOnDisable
    this.mapSettingsLayout = mapSettingsLayout

    this.currentMapSettings = {}
    for (var settingNum in mapSettingsLayout)
    {
      this.currentMapSettings[mapSettingsLayout[settingNum].id] = mapSettingsLayout[settingNum].defaultValue
    }
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

  getSVGPath()
  {
    return this.svgPath
  }

  getTotalEV()
  {
    return this.totalEV
  }

  getEV(decade, regionID)
  {
    return this.evFunction(decade, regionID)
  }

  getShouldDisplayEVOnMap()
  {
    return this.shouldDisplayEVOnMap
  }

  getSecondarySliderIncrement()
  {
    return this.secondarySliderIncrement
  }

  setMapSources(mapSources)
  {
    this.mapSources = mapSources
  }

  getMapSources(self)
  {
    var self = self || this
    return self.mapSources
  }

  setMapSourceIDs(mapSourceIDs)
  {
    this.mapSourceIDs = mapSourceIDs
  }

  getMapSourceIDs()
  {
    return this.mapSourceIDs
  }

  setDefaultCompareSourceIDs(defaultCompareSourceIDs)
  {
    this.defaultCompareSourceIDs = defaultCompareSourceIDs
  }

  getDefaultCompareSourceIDs()
  {
    return this.defaultCompareSourceIDs
  }

  setCustomSourceID(customSourceID)
  {
    this.customSourceID = customSourceID
  }

  getCustomMapSource()
  {
    return this.getMapSources(this)[this.customSourceID]
  }

  getRegionNameToID()
  {
    return this.regionNameToID
  }

  getRegionsToHideOnDisable()
  {
    return this.regionsToHideOnDisable
  }

  getMapSettingsLayout()
  {
    return this.mapSettingsLayout
  }

  getMapSettings()
  {
    return this.currentMapSettings
  }

  setMapSettings(currentMapSettings)
  {
    this.currentMapSettings = currentMapSettings
  }

  getMapSettingLayout(settingID, self)
  {
    var self = self || this
    return self.mapSettingsLayout.find(setting => setting.id == settingID)
  }

  getMapSettingOptions(settingID, self)
  {
    var self = self || this
    var settingLayout = self.getMapSettingLayout(settingID, self)
    if (settingLayout == null) { return }
    return settingLayout.options
  }

  getMapSettingOptionData(settingID, self)
  {
    var self = self || this
    var codedValue = self.currentMapSettings[settingID]
    if (codedValue == null) { return }
    return self.getMapSettingOptions(settingID, self).find(option => option.id == codedValue)
  }

  getMapSettingValue(settingID)
  {
    var settingOptionData = this.getMapSettingOptionData(settingID, this)
    if (settingOptionData == null) { return }
    return settingOptionData.value
  }
}

const regionEVArray = {
  2020: {"AL":8, "AK":3, "AZ":12, "AR":6, "CA":55, "CO":10, "CT":7, "DE":3, "DC":3, "FL":31, "GA":16, "HI":4, "ID":4, "IL":19, "IN":11, "IA":6, "KS":6, "KY":8, "LA":8, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":11, "MI":15, "MN":9, "MS":6, "MO":10, "MT":4, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":6, "NH":4, "NJ":14, "NM":5, "NY":27, "NC":16, "ND":3, "OH":17, "OK":7, "OR":8, "PA":19, "RI":3, "SC":9, "SD":3, "TN":11, "TX":41, "UT":6, "VT":3, "VA":13, "WA":12, "WV":4, "WI":10, "WY":3},
  2010: {"AL":9, "AK":3, "AZ":11, "AR":6, "CA":55, "CO":9, "CT":7, "DE":3, "DC":3, "FL":29, "GA":16, "HI":4, "ID":4, "IL":20, "IN":11, "IA":6, "KS":6, "KY":8, "LA":8, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":11, "MI":16, "MN":10, "MS":6, "MO":10, "MT":3, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":6, "NH":4, "NJ":14, "NM":5, "NY":29, "NC":15, "ND":3, "OH":18, "OK":7, "OR":7, "PA":20, "RI":4, "SC":9, "SD":3, "TN":11, "TX":38, "UT":6, "VT":3, "VA":13, "WA":12, "WV":5, "WI":10, "WY":3},
  2000: {"AL":9, "AK":3, "AZ":10, "AR":6, "CA":55, "CO":9, "CT":7, "DE":3, "DC":3, "FL":27, "GA":15, "HI":4, "ID":4, "IL":21, "IN":11, "IA":7, "KS":6, "KY":8, "LA":9, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":12, "MI":17, "MN":10, "MS":6, "MO":11, "MT":3, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":5, "NH":4, "NJ":15, "NM":5, "NY":31, "NC":15, "ND":3, "OH":20, "OK":7, "OR":7, "PA":21, "RI":4, "SC":8, "SD":3, "TN":11, "TX":34, "UT":5, "VT":3, "VA":13, "WA":11, "WV":5, "WI":10, "WY":3},
  1990: {"AL":9, "AK":3, "AZ":8, "AR":6, "CA":54, "CO":8, "CT":8, "DE":3, "DC":3, "FL":25, "GA":13, "HI":4, "ID":4, "IL":22, "IN":12, "IA":7, "KS":6, "KY":8, "LA":9, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":12, "MI":18, "MN":10, "MS":7, "MO":11, "MT":3, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":4, "NH":4, "NJ":15, "NM":5, "NY":33, "NC":14, "ND":3, "OH":21, "OK":8, "OR":7, "PA":23, "RI":4, "SC":8, "SD":3, "TN":11, "TX":32, "UT":5, "VT":3, "VA":13, "WA":11, "WV":5, "WI":11, "WY":3},
  1980: {"AL":9, "AK":3, "AZ":7, "AR":6, "CA":47, "CO":8, "CT":8, "DE":3, "DC":3, "FL":21, "GA":12, "HI":4, "ID":4, "IL":24, "IN":12, "IA":8, "KS":7, "KY":9, "LA":10, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":13, "MI":20, "MN":10, "MS":7, "MO":11, "MT":4, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":4, "NH":4, "NJ":16, "NM":5, "NY":36, "NC":13, "ND":3, "OH":23, "OK":8, "OR":7, "PA":25, "RI":4, "SC":8, "SD":3, "TN":11, "TX":29, "UT":5, "VT":3, "VA":12, "WA":10, "WV":6, "WI":11, "WY":3},
  1970: {"AL":9, "AK":3, "AZ":6, "AR":6, "CA":45, "CO":7, "CT":8, "DE":3, "DC":3, "FL":17, "GA":12, "HI":4, "ID":4, "IL":26, "IN":13, "IA":8, "KS":7, "KY":9, "LA":10, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":14, "MI":21, "MN":10, "MS":7, "MO":12, "MT":4, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":3, "NH":4, "NJ":17, "NM":4, "NY":41, "NC":13, "ND":3, "OH":25, "OK":8, "OR":6, "PA":27, "RI":4, "SC":8, "SD":4, "TN":10, "TX":26, "UT":4, "VT":3, "VA":12, "WA":9, "WV":6, "WI":11, "WY":3}
}

var MapSettingType =
{
  optionCycle: 0,
  numericValue: 1, // TODO: Implement other setting types, add settings to USAPresidentialMapType
  stringValue: 2
}

var MapSettingReloadType =
{
  none: 0,
  display: 1,
  data: 2
}

var USAPresidentialMapType = new MapType(
  "USA-Presidential",
  "Presidential",
  "P",
  "assets/usa-pres.png",
  "src/display/usapresidentialmap.svg",
  538,
  function(decade, regionID)
  {
    return regionEVArray[decade][regionID]
  },
  true,
  5,
  {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"},
  [],
  [
    {id: "latestTick", title: "Latest Tick", type: MapSettingType.optionCycle, options:
      [
        {id: "enabled", title: "Enabled", value: true},
        {id: "disabled", title: "Disabled", value: false}
      ],
    defaultValue: "disabled", reloadType: MapSettingReloadType.data}
  ]
)

var USASenateMapType = new MapType(
  "USA-Senate",
  "Senate",
  "S",
  "assets/usa-senate.png",
  "src/display/usasenatemap.svg",
  100,
  function()
  {
    return 1
  },
  false,
  3,
  {"Alabama":"AL", "Alabama Special":"AL-S", "Alaska":"AK", "Alaska Special":"AK-S", "Arizona":"AZ", "Arizona Special":"AZ-S", "Arkansas":"AR", "Arkansas Special":"AR-S", "California":"CA", "California Special":"CA-S", "Colorado":"CO", "Colorado Special":"CO-S", "Connecticut":"CT", "Connecticut Special":"CT-S", "Delaware":"DE", "Delaware Special":"DE-S", "Florida":"FL", "Florida Special":"FL-S", "Georgia":"GA", "Georgia Special":"GA-S", "Hawaii":"HI", "Hawaii Special":"HI-S", "Idaho":"ID", "Idaho Special":"ID-S", "Illinois":"IL", "Illinois Special":"IL-S", "Indiana":"IN", "Indiana Special":"IN-S", "Iowa":"IA", "Iowa Special":"IA-S", "Kansas":"KS", "Kansas Special":"KS-S", "Kentucky":"KY", "Kentucky Special":"KY-S", "Louisiana":"LA", "Louisiana Special":"LA-S", "Maine":"ME", "Maine Special":"ME-S", "Maryland":"MD", "Maryland Special":"MD-S", "Massachusetts":"MA", "Massachusetts Special":"MA-S", "Michigan":"MI", "Michigan Special":"MI-S", "Minnesota":"MN", "Minnesota Special":"MN-S", "Mississippi":"MS", "Mississippi Special":"MS-S", "Missouri":"MO", "Missouri Special":"MO-S", "Montana":"MT", "Montana Special":"MT-S", "Nebraska":"NE", "Nebraska Special":"NE-S", "Nevada":"NV", "Nevada Special":"NV-S", "New Hampshire":"NH", "New Hampshire Special":"NH-S", "New Jersey":"NJ", "New Jersey Special":"NJ-S", "New Mexico":"NM", "New Mexico Special":"NM-S", "New York":"NY", "New York Special":"NY-S", "North Carolina":"NC", "North Carolina Special":"NC-S", "North Dakota":"ND", "North Dakota Special":"ND-S", "Ohio":"OH", "Ohio Special":"OH-S", "Oklahoma":"OK", "Oklahoma Special":"OK-S", "Oregon":"OR", "Oregon Special":"OR-S", "Pennsylvania":"PA", "Pennsylvania Special":"PA-S", "Rhode Island":"RI", "Rhode Island Special":"RI-S", "South Carolina":"SC", "South Carolina Special":"SC-S", "South Dakota":"SD", "South Dakota Special":"SD-S", "Tennessee":"TN", "Tennessee Special":"TN-S", "Texas":"TX", "Texas Special":"TX-S", "Utah":"UT", "Utah Special":"UT-S", "Vermont":"VT", "Vermont Special":"VT-S", "Virginia":"VA", "Virginia Special":"VA-S", "Washington":"WA", "Washington Special":"WA-S", "West Virginia":"WV", "West Virginia Special":"WV-S", "Wisconsin":"WI", "Wisconsin Special":"WI-S", "Wyoming":"WY", "Wyoming Special":"WY-S"},
  [/.+-S/],
  [
    {id: "mapCurrentSeats", title: "Map Current Seats", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
    defaultValue: "hide", reloadType: MapSettingReloadType.display},
    {id: "pieCurrentSeats", title: "Pie Current Seats", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
    defaultValue: "show", reloadType: MapSettingReloadType.display},
    {id: "seatArrangement", title: "Seat Arrangement", type: MapSettingType.optionCycle, options:
      [
        {id: "election-type", title: "Election", value: 0},
        {id: "seat-class", title: "Class", value: 1}
      ],
    defaultValue: "election-type", reloadType: MapSettingReloadType.data},
    {id: "offYear", title: "Off Cycle Elections", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
    defaultValue: "hide", reloadType: MapSettingReloadType.data},
    {id: "latestTick", title: "Latest Tick", type: MapSettingType.optionCycle, options:
      [
        {id: "enabled", title: "Enabled", value: true},
        {id: "disabled", title: "Disabled", value: false}
      ],
    defaultValue: "disabled", reloadType: MapSettingReloadType.data}
  ]
)

var mapTypes = {}
mapTypes[USAPresidentialMapType.getID()] = USAPresidentialMapType
mapTypes[USASenateMapType.getID()] = USASenateMapType

var mapTypeIDs = [USAPresidentialMapType.getID(), USASenateMapType.getID()]
