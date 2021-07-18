class MapType
{
  constructor(id, name, shortName, iconURL, svgPath, totalEV, evFunction, shouldDisplayEVOnMap, secondarySliderIncrement, customMapEnabled, controlsHelpHTML, regionNameToID, regionsToHideOnDisable, mapSettingsLayout)
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
    this.customMapEnabled = customMapEnabled
    this.controlsHelpHTML = controlsHelpHTML

    this.regionNameToID = regionNameToID
    this.regionsToHideOnDisable = regionsToHideOnDisable
    this.mapSettingsLayout = mapSettingsLayout

    this.currentMapSourceID = getCookie(this.id + "-currentMapSource")

    this.currentMapSettings = {}
    for (var settingNum in mapSettingsLayout)
    {
      this.currentMapSettings[mapSettingsLayout[settingNum].id] = getCookie(this.id + "-" + mapSettingsLayout[settingNum].id) || mapSettingsLayout[settingNum].defaultValue
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

  getCustomMapEnabled()
  {
    return this.customMapEnabled
  }

  getControlsHelpHTML()
  {
    return this.controlsHelpHTML
  }

  setMapSources(mapSources)
  {
    this.mapSources = mapSources
  }

  getMapSources(selfArg)
  {
    var self = selfArg || this
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

  setCurrentMapSourceID(currentMapSourceID)
  {
    this.currentMapSourceID = currentMapSourceID
    setCookie(this.id + "-currentMapSource", this.currentMapSourceID || "")
  }

  getCurrentMapSourceID()
  {
    return this.currentMapSourceID
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

    for (var settingID in this.currentMapSettings)
    {
      setCookie(this.id + "-" + settingID, this.currentMapSettings[settingID])
    }
  }

  getMapSettingLayout(settingID, selfArg)
  {
    var self = selfArg || this
    return self.mapSettingsLayout.find(setting => setting.id == settingID)
  }

  getMapSettingOptions(settingID, selfArg)
  {
    var self = selfArg || this
    var settingLayout = self.getMapSettingLayout(settingID, self)
    if (settingLayout == null) { return }
    return settingLayout.options
  }

  getMapSettingOptionData(settingID, selfArg)
  {
    var self = selfArg || this
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
  2020: {"AL":9, "AK":3, "AZ":11, "AR":6, "CA":54, "CO":10, "CT":7, "DE":3, "DC":3, "FL":30, "GA":16, "HI":4, "ID":4, "IL":19, "IN":11, "IA":6, "KS":6, "KY":8, "LA":8, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":11, "MI":15, "MN":10, "MS":6, "MO":10, "MT":4, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":6, "NH":4, "NJ":14, "NM":5, "NY":28, "NC":16, "ND":3, "OH":17, "OK":7, "OR":8, "PA":19, "RI":4, "SC":9, "SD":3, "TN":11, "TX":40, "UT":6, "VT":3, "VA":13, "WA":12, "WV":4, "WI":10, "WY":3},
  2010: {"AL":9, "AK":3, "AZ":11, "AR":6, "CA":55, "CO":9, "CT":7, "DE":3, "DC":3, "FL":29, "GA":16, "HI":4, "ID":4, "IL":20, "IN":11, "IA":6, "KS":6, "KY":8, "LA":8, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":11, "MI":16, "MN":10, "MS":6, "MO":10, "MT":3, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":6, "NH":4, "NJ":14, "NM":5, "NY":29, "NC":15, "ND":3, "OH":18, "OK":7, "OR":7, "PA":20, "RI":4, "SC":9, "SD":3, "TN":11, "TX":38, "UT":6, "VT":3, "VA":13, "WA":12, "WV":5, "WI":10, "WY":3},
  2000: {"AL":9, "AK":3, "AZ":10, "AR":6, "CA":55, "CO":9, "CT":7, "DE":3, "DC":3, "FL":27, "GA":15, "HI":4, "ID":4, "IL":21, "IN":11, "IA":7, "KS":6, "KY":8, "LA":9, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":12, "MI":17, "MN":10, "MS":6, "MO":11, "MT":3, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":5, "NH":4, "NJ":15, "NM":5, "NY":31, "NC":15, "ND":3, "OH":20, "OK":7, "OR":7, "PA":21, "RI":4, "SC":8, "SD":3, "TN":11, "TX":34, "UT":5, "VT":3, "VA":13, "WA":11, "WV":5, "WI":10, "WY":3},
  1990: {"AL":9, "AK":3, "AZ":8, "AR":6, "CA":54, "CO":8, "CT":8, "DE":3, "DC":3, "FL":25, "GA":13, "HI":4, "ID":4, "IL":22, "IN":12, "IA":7, "KS":6, "KY":8, "LA":9, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":12, "MI":18, "MN":10, "MS":7, "MO":11, "MT":3, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":4, "NH":4, "NJ":15, "NM":5, "NY":33, "NC":14, "ND":3, "OH":21, "OK":8, "OR":7, "PA":23, "RI":4, "SC":8, "SD":3, "TN":11, "TX":32, "UT":5, "VT":3, "VA":13, "WA":11, "WV":5, "WI":11, "WY":3},
  1980: {"AL":9, "AK":3, "AZ":7, "AR":6, "CA":47, "CO":8, "CT":8, "DE":3, "DC":3, "FL":21, "GA":12, "HI":4, "ID":4, "IL":24, "IN":12, "IA":8, "KS":7, "KY":9, "LA":10, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":13, "MI":20, "MN":10, "MS":7, "MO":11, "MT":4, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":4, "NH":4, "NJ":16, "NM":5, "NY":36, "NC":13, "ND":3, "OH":23, "OK":8, "OR":7, "PA":25, "RI":4, "SC":8, "SD":3, "TN":11, "TX":29, "UT":5, "VT":3, "VA":12, "WA":10, "WV":6, "WI":11, "WY":3},
  1970: {"AL":9, "AK":3, "AZ":6, "AR":6, "CA":45, "CO":7, "CT":8, "DE":3, "DC":3, "FL":17, "GA":12, "HI":4, "ID":4, "IL":26, "IN":13, "IA":8, "KS":7, "KY":9, "LA":10, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":14, "MI":21, "MN":10, "MS":7, "MO":12, "MT":4, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":3, "NH":4, "NJ":17, "NM":4, "NY":41, "NC":13, "ND":3, "OH":25, "OK":8, "OR":6, "PA":27, "RI":4, "SC":8, "SD":4, "TN":10, "TX":26, "UT":4, "VT":3, "VA":12, "WA":9, "WV":6, "WI":11, "WY":3},
  1960: {"AL":10, "AK":3, "AZ":5, "AR":6, "CA":40, "CO":6, "CT":8, "DE":3, "DC":3, "FL":14, "GA":12, "HI":4, "ID":4, "IL":26, "IN":13, "IA":9, "KS":7, "KY":9, "LA":10, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":14, "MI":21, "MN":10, "MS":7, "MO":12, "MT":4, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":3, "NH":4, "NJ":17, "NM":4, "NY":43, "NC":13, "ND":4, "OH":26, "OK":8, "OR":6, "PA":29, "RI":4, "SC":8, "SD":4, "TN":11, "TX":25, "UT":4, "VT":3, "VA":12, "WA":9, "WV":7, "WI":12, "WY":3},
  1950: {"AL":11, "AK":3, "AZ":4, "AR":8, "CA":32, "CO":6, "CT":8, "DE":3, "DC":0, "FL":10, "GA":12, "HI":3, "ID":4, "IL":27, "IN":13, "IA":10, "KS":8, "KY":10, "LA":10, "ME-D1":1, "ME-D2":1, "ME-AL":3, "MD":9, "MA":16, "MI":20, "MN":11, "MS":8, "MO":13, "MT":4, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":3, "NV":3, "NH":4, "NJ":16, "NM":4, "NY":45, "NC":14, "ND":4, "OH":25, "OK":8, "OR":6, "PA":32, "RI":4, "SC":8, "SD":4, "TN":11, "TX":24, "UT":4, "VT":3, "VA":12, "WA":9, "WV":8, "WI":12, "WY":3}
}

var MapSettingType =
{
  optionCycle: 0,
  numericValue: 1, // TODO: Implement other setting types
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
  "svg-sources/usa-presidential-map.svg",
  538,
  function(decade, regionID)
  {
    return (regionEVArray[decade] || regionEVArray[2020])[regionID]
  },
  true,
  5,
  true,
  `
  <h3 style='margin: 0px;'>Controls</h3>
  <h5 style='margin: 0px; margin-top: 8px; margin-bottom: 10px; text-align: left; font-size: 15px;'>
    &#x2022; Select Source / <span style='color: #ec7039;'>1</span>, <span style='color: #ec7039;'>2</span>, <span style='color: #4a84ff;'>3</span>, <span style='color: #0c71c0;'>4</span>, <span style='color: #aaa;'>5</span>, 6 keys: Change map source<br>
    &#x2022; Source download buttons: <span style='color: #49BD49;'>Update</span> selected source<br>
    &#x2022; S key: Toggle source dropdown selection<br>
    &#x2022; 1-6 keys: Force source <span style='color: #49BD49;'>update</span><br>
    &#x2022; Clear button / 0 key: <span style='color: #aaa;'>Clear map</span><br>
    &#x2022; Slider / arrow keys: Select data map date<br>
    &nbsp;&nbsp;&nbsp;* Down: -5, Left: -1, Right: +1, Up: +5<br>
    &#x2022; Click state: View more poll / projection / result data<br>
    <br>
    &#x2022; Copy / Edit & Done button / enter key: Edit map<br>
    &#x2022; Party buttons / <span style='color: #8aafff;'>1</span>, 2, <span style='color: #ff8b98;'>3</span> keys: Select party to fill<br>
    &#x2022; Left click state: Cycle <span style='color: #d9202f;'>safe</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #cf8980;'>tilt</span> margins<br>
    &#x2022; Right click state: Cycle <span style='color: #cf8980;'>tilt</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #d9202f;'>safe</span> margins<br>
    &#x2022; Hold and drag: <span style='color: #587ccc;'>Fill states</span><br>
    <br>
    &#x2022; Source checkbox: Select map source to compare<br>
    &#x2022; Shift + 1-5 keys: Select map source to compare<br>
    &#x2022; Up/Down arrow keys: Select source slider to adjust<br>
    &#x2022; Left/Right arrow keys: Adjust selected slider<br>
    <br>
    &#x2022; C key: Toggle compare dropdown selection<br>
    &#x2022; 1 key: Compare <span style='color: #aaa;'>Past Results</span> vs <span style='color: #aaa;'>Past Results</span><br>
    &#x2022; 2 key: Compare <span style='color: #aaa;'>Past Results</span> vs <span style='color: #ec7039;'>538 Projection</span><br>
    &#x2022; 3 key: Compare <span style='color: #aaa;'>Past Results</span> vs <span style='color: #ec7039;'>538 Poll Avg</span><br>
    <br>
    &#x2022; Settings dropdown: Click setting to toggle/cycle option<br>
    &#x2022; Latest Tick: Include tick for latest date on slider<br>
    <br>
    &#x2022; Margins button / enter key: Apply entered margins<br>
    &#x2022; Margin dropdown button: Edit margin value<br>
    &#x2022; M key: Toggle margins dropdown selection<br>
    &#x2022; 1 key: <span style='color: #d9202f;'>15</span>/<span style='color: #ff5864;'>5</span>/<span style='color: #ff8b98;'>1</span> margins (default)<br>
    &#x2022; 2 key: <span style='color: #d9202f;'>5</span>/<span style='color: #ff5864;'>3</span>/<span style='color: #ff8b98;'>1</span> margins (election shift)<br>
    <br>
    &#x2022; Drop JPEG / PNG image file: Set icon inside pie chart<br>
    &#x2022; Drop <span style='color: #22a366;'>CSV</span> / <span style='color: #f7df1c;'>JSON</span> file: Load custom map<br>
  </h5>
  `,
  {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"},
  [],
  [
    {id: "latestTick", title: "Latest Tick", type: MapSettingType.optionCycle, options:
      [
        {id: "enabled", title: "Enabled", value: true},
        {id: "disabled", title: "Disabled", value: false}
      ],
    defaultValue: "disabled", reloadType: MapSettingReloadType.data},
    {id: "startAtLatest", title: "Start At Latest", type: MapSettingType.optionCycle, options:
      [
        {id: "enabled", title: "Enabled", value: true},
        {id: "disabled", title: "Disabled", value: false}
      ],
    defaultValue: "enabled", reloadType: MapSettingReloadType.none}
  ]
)

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
  `
  <h3 style='margin: 0px;'>Controls</h3>
  <h5 style='margin: 0px; margin-top: 8px; margin-bottom: 10px; text-align: left; font-size: 15px;'>
    &#x2022; Select Source / <span style='color: #E9353B;'>1</span>, <span style='color: #aaa;'>2</span>, 3 keys: Change map source<br>
    &#x2022; Source download buttons: <span style='color: #49BD49;'>Update</span> selected source<br>
    &#x2022; S key: Toggle source dropdown selection<br>
    &#x2022; 1-2 keys: Force source <span style='color: #49BD49;'>update</span><br>
    &#x2022; Clear button / 0 key: <span style='color: #aaa;'>Clear map</span><br>
    &#x2022; Slider / arrow keys: Select data map date<br>
    &nbsp;&nbsp;&nbsp;* Down: -3, Left: -1, Right: +1, Up: +3<br>
    &#x2022; Click state: View more poll / projection / result data<br>
    <br>
    &#x2022; Copy / Edit & Done button / enter key: Edit map<br>
    &#x2022; Party buttons / <span style='color: #8aafff;'>1</span>, 2, <span style='color: #ff8b98;'>3</span> keys: Select party to fill<br>
    &#x2022; Left click state: Cycle <span style='color: #d9202f;'>safe</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #cf8980;'>tilt</span> margins<br>
    &#x2022; Right click state: Cycle <span style='color: #cf8980;'>tilt</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #d9202f;'>safe</span> margins<br>
    &#x2022; Hold and drag: <span style='color: #587ccc;'>Fill states</span><br>
    <br>
    &#x2022; Source checkbox: Select map source to compare<br>
    &#x2022; Shift + 1-2 keys: Select map source to compare<br>
    &#x2022; Up/Down arrow keys: Select source slider to adjust<br>
    &#x2022; Left/Right arrow keys: Adjust selected slider<br>
    <br>
    &#x2022; Settings dropdown: Click setting to toggle/cycle option<br>
    &#x2022; Map Current Seats: Show seats not up for election<br>
    &#x2022; Pie Current Seats: Show seats not up for election<br>
    &#x2022; Seat Arrangement:<br>
    &nbsp;&nbsp;&nbsp;* By Election (regular or special)<br>
    &nbsp;&nbsp;&nbsp;* By Class (specific seat for the state: <span style='color: #D93314;'>1</span>/<span style='color: #F0A300;'>2</span>/<span style='color: #E8D500;'>3</span>)<br>
    &nbsp;&nbsp;&nbsp;** <span style='color: #D93314;'>1: 2018</span>, <span style='color: #F0A300;'>2: 2020</span>, <span style='color: #E8D500;'>3: 2016/2022</span><br>
    &#x2022; Off Cycle Elections: Show elections not on election day<br>
    &nbsp;&nbsp;&nbsp;* Includes party flips and runoffs<br>
    &#x2022; Latest Tick: Include tick for latest date on slider<br>
    <!-- &nbsp;&nbsp;&nbsp;* Will set to maximum on source change when selected<br> -->
    <br>
    &#x2022; Margins button / enter key: Apply entered margins<br>
    &#x2022; Margin dropdown button: Edit margin value<br>
    <br>
    &#x2022; Drop JPEG / PNG image file: Set icon inside pie chart<br>
    &#x2022; Drop <span style='color: #22a366;'>CSV</span> / <span style='color: #f7df1c;'>JSON</span> file: Load custom map<br>
  </h5>
  `,
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
    defaultValue: "disabled", reloadType: MapSettingReloadType.data},
    {id: "startAtLatest", title: "Start At Latest", type: MapSettingType.optionCycle, options:
      [
        {id: "enabled", title: "Enabled", value: true},
        {id: "disabled", title: "Disabled", value: false}
      ],
    defaultValue: "enabled", reloadType: MapSettingReloadType.none}
  ]
)

var mapTypes = {}
mapTypes[USAPresidentialMapType.getID()] = USAPresidentialMapType
mapTypes[USASenateMapType.getID()] = USASenateMapType

var mapTypeIDs = [USAPresidentialMapType.getID(), USASenateMapType.getID()]
