class MapType
{
  constructor(id, name, shortName, iconURL, svgPath, totalEV, evFunction, shouldDisplayEVOnMap, secondarySliderIncrement, customMapEnabled, compareMapEnabled, controlsHelpHTML, regionNameToID, regionsToHideOnDisable, mapSettingsLayout)
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
    this.compareMapEnabled = compareMapEnabled
    this.controlsHelpHTML = controlsHelpHTML

    this.regionNameToID = regionNameToID
    this.regionsToHideOnDisable = regionsToHideOnDisable
    this.mapSettingsLayout = mapSettingsLayout.concat(globalMapSettings)

    this.currentMapSourceID = getCookie(this.id + "-currentMapSource")

    this.currentMapSettings = {}
    for (var settingNum in this.mapSettingsLayout)
    {
      var isGlobal = globalMapSettings.some(setting => setting.id == this.mapSettingsLayout[settingNum].id)
      this.currentMapSettings[this.mapSettingsLayout[settingNum].id] = getCookie((isGlobal ? "" : (this.id + "-")) + this.mapSettingsLayout[settingNum].id) || this.mapSettingsLayout[settingNum].defaultValue
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
    return this.overrideSVGPath || this.svgPath
  }

  setOverrideSVGPath(tempPath)
  {
    this.overrideSVGPath = tempPath
  }

  resetOverrideSVGPath()
  {
    if (this.overrideSVGPath == null) { return false }

    this.overrideSVGPath = null
    return true
  }

  async loadSVG(callback)
  {
    $("#svgdata").css('opacity', "0")

    let svgPath = this.getSVGPath()
    let svgPathString = (svgPath instanceof Array) ? svgPath[0] : svgPath

    let svgPathID = svgPathString.includes("/") ? svgPathString.split("/").reverse()[0] : svgPathString
    let svgData = await SVGDatabase.fetchFile(svgPathID)
    if (svgData)
    {
      $("#mapzoom").html(svgData)
      callback(svgPath)
    }
    else
    {
      $("#mapzoom").load(svgPathString, () => {
        SVGDatabase.insertFile(svgPathID, $("#mapzoom").html())
        callback(svgPath)
      })
    }
  }

  getTotalEV()
  {
    return this.totalEV
  }

  getEV(decade, regionID, disabled, shouldSetDisabledWorthToZero)
  {
    return this.evFunction(decade, regionID, disabled, shouldSetDisabledWorthToZero)
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

  getCompareMapEnabled()
  {
    return this.compareMapEnabled
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
    return mergeObject(this.currentMapSettings, currentGlobalMapSettings)
  }

  setMapSettings(currentMapSettings)
  {
    this.currentMapSettings = currentMapSettings

    for (var settingID in this.currentMapSettings)
    {
      var isGlobal = globalMapSettings.some(setting => setting.id == settingID)
      setCookie((isGlobal ? "" : (this.id + "-")) + settingID, this.currentMapSettings[settingID])

      if (isGlobal)
      {
        currentGlobalMapSettings[settingID] = this.currentMapSettings[settingID]
      }
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
  2020: {"AL":9, "AK":3, "AZ":11, "AR":6, "CA":54, "CO":10, "CT":7, "DE":3, "DC":3, "FL":30, "GA":16, "HI":4, "ID":4, "IL":19, "IN":11, "IA":6, "KS":6, "KY":8, "LA":8, "ME": 4, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":11, "MI":15, "MN":10, "MS":6, "MO":10, "MT":4, "NE":5, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":6, "NH":4, "NJ":14, "NM":5, "NY":28, "NC":16, "ND":3, "OH":17, "OK":7, "OR":8, "PA":19, "RI":4, "SC":9, "SD":3, "TN":11, "TX":40, "UT":6, "VT":3, "VA":13, "WA":12, "WV":4, "WI":10, "WY":3},
  2010: {"AL":9, "AK":3, "AZ":11, "AR":6, "CA":55, "CO":9, "CT":7, "DE":3, "DC":3, "FL":29, "GA":16, "HI":4, "ID":4, "IL":20, "IN":11, "IA":6, "KS":6, "KY":8, "LA":8, "ME": 4, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":11, "MI":16, "MN":10, "MS":6, "MO":10, "MT":3, "NE":5, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":6, "NH":4, "NJ":14, "NM":5, "NY":29, "NC":15, "ND":3, "OH":18, "OK":7, "OR":7, "PA":20, "RI":4, "SC":9, "SD":3, "TN":11, "TX":38, "UT":6, "VT":3, "VA":13, "WA":12, "WV":5, "WI":10, "WY":3},
  2000: {"AL":9, "AK":3, "AZ":10, "AR":6, "CA":55, "CO":9, "CT":7, "DE":3, "DC":3, "FL":27, "GA":15, "HI":4, "ID":4, "IL":21, "IN":11, "IA":7, "KS":6, "KY":8, "LA":9, "ME": 4, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":12, "MI":17, "MN":10, "MS":6, "MO":11, "MT":3, "NE":5, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":5, "NH":4, "NJ":15, "NM":5, "NY":31, "NC":15, "ND":3, "OH":20, "OK":7, "OR":7, "PA":21, "RI":4, "SC":8, "SD":3, "TN":11, "TX":34, "UT":5, "VT":3, "VA":13, "WA":11, "WV":5, "WI":10, "WY":3},
  1990: {"AL":9, "AK":3, "AZ":8, "AR":6, "CA":54, "CO":8, "CT":8, "DE":3, "DC":3, "FL":25, "GA":13, "HI":4, "ID":4, "IL":22, "IN":12, "IA":7, "KS":6, "KY":8, "LA":9, "ME": 4, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":12, "MI":18, "MN":10, "MS":7, "MO":11, "MT":3, "NE":5, "NE-D1":1, "NE-D2":1, "NE-D3":1, "NE-AL":2, "NV":4, "NH":4, "NJ":15, "NM":5, "NY":33, "NC":14, "ND":3, "OH":21, "OK":8, "OR":7, "PA":23, "RI":4, "SC":8, "SD":3, "TN":11, "TX":32, "UT":5, "VT":3, "VA":13, "WA":11, "WV":5, "WI":11, "WY":3},
  1980: {"AL":9, "AK":3, "AZ":7, "AR":6, "CA":47, "CO":8, "CT":8, "DE":3, "DC":3, "FL":21, "GA":12, "HI":4, "ID":4, "IL":24, "IN":12, "IA":8, "KS":7, "KY":9, "LA":10, "ME": 4, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":13, "MI":20, "MN":10, "MS":7, "MO":11, "MT":4, "NE":5, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":5, "NV":4, "NH":4, "NJ":16, "NM":5, "NY":36, "NC":13, "ND":3, "OH":23, "OK":8, "OR":7, "PA":25, "RI":4, "SC":8, "SD":3, "TN":11, "TX":29, "UT":5, "VT":3, "VA":12, "WA":10, "WV":6, "WI":11, "WY":3},
  1970: {"AL":9, "AK":3, "AZ":6, "AR":6, "CA":45, "CO":7, "CT":8, "DE":3, "DC":3, "FL":17, "GA":12, "HI":4, "ID":4, "IL":26, "IN":13, "IA":8, "KS":7, "KY":9, "LA":10, "ME": 4, "ME-D1":1, "ME-D2":1, "ME-AL":2, "MD":10, "MA":14, "MI":21, "MN":10, "MS":7, "MO":12, "MT":4, "NE":5, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":5, "NV":3, "NH":4, "NJ":17, "NM":4, "NY":41, "NC":13, "ND":3, "OH":25, "OK":8, "OR":6, "PA":27, "RI":4, "SC":8, "SD":4, "TN":10, "TX":26, "UT":4, "VT":3, "VA":12, "WA":9, "WV":6, "WI":11, "WY":3},
  1960: {"AL":10, "AK":3, "AZ":5, "AR":6, "CA":40, "CO":6, "CT":8, "DE":3, "DC":3, "FL":14, "GA":12, "HI":4, "ID":4, "IL":26, "IN":13, "IA":9, "KS":7, "KY":9, "LA":10, "ME": 4, "ME-D1":0, "ME-D2":0, "ME-AL":4, "MD":10, "MA":14, "MI":21, "MN":10, "MS":7, "MO":12, "MT":4, "NE":5, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":5, "NV":3, "NH":4, "NJ":17, "NM":4, "NY":43, "NC":13, "ND":4, "OH":26, "OK":8, "OR":6, "PA":29, "RI":4, "SC":8, "SD":4, "TN":11, "TX":25, "UT":4, "VT":3, "VA":12, "WA":9, "WV":7, "WI":12, "WY":3},
  1950: {"AL":11, "AK":3, "AZ":4, "AR":8, "CA":32, "CO":6, "CT":8, "DE":3, "DC":0, "FL":10, "GA":12, "HI":3, "ID":4, "IL":27, "IN":13, "IA":10, "KS":8, "KY":10, "LA":10, "ME": 5, "ME-D1":0, "ME-D2":0, "ME-AL":5, "MD":9, "MA":16, "MI":20, "MN":11, "MS":8, "MO":13, "MT":4, "NE":6, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":6, "NV":3, "NH":4, "NJ":16, "NM":4, "NY":45, "NC":14, "ND":4, "OH":25, "OK":8, "OR":6, "PA":32, "RI":4, "SC":8, "SD":4, "TN":11, "TX":24, "UT":4, "VT":3, "VA":12, "WA":9, "WV":8, "WI":12, "WY":3},
  1940: {"AL":11, "AK":0, "AZ":4, "AR":9, "CA":25, "CO":6, "CT":8, "DE":3, "DC":0, "FL":8, "GA":12, "HI":0, "ID":4, "IL":28, "IN":13, "IA":10, "KS":8, "KY":11, "LA":10, "ME-D1":0, "ME-D2":0, "ME-AL":5, "MD":8, "MA":16, "MI":19, "MN":11, "MS":9, "MO":15, "MT":4, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":6, "NV":3, "NH":4, "NJ":16, "NM":4, "NY":47, "NC":14, "ND":4, "OH":25, "OK":10, "OR":6, "PA":35, "RI":4, "SC":8, "SD":4, "TN":12, "TX":23, "UT":4, "VT":3, "VA":11, "WA":8, "WV":8, "WI":12, "WY":3},
  1930: {"AL":11, "AK":0, "AZ":3, "AR":9, "CA":22, "CO":6, "CT":8, "DE":3, "DC":0, "FL":7, "GA":12, "HI":0, "ID":4, "IL":29, "IN":14, "IA":11, "KS":9, "KY":11, "LA":10, "ME-D1":0, "ME-D2":0, "ME-AL":5, "MD":8, "MA":17, "MI":19, "MN":11, "MS":9, "MO":15, "MT":4, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":7, "NV":3, "NH":4, "NJ":16, "NM":3, "NY":47, "NC":13, "ND":4, "OH":26, "OK":11, "OR":5, "PA":36, "RI":4, "SC":8, "SD":4, "TN":11, "TX":23, "UT":4, "VT":3, "VA":11, "WA":8, "WV":8, "WI":12, "WY":3},
  1920: {"AL":12, "AK":0, "AZ":3, "AR":9, "CA":13, "CO":6, "CT":7, "DE":3, "DC":0, "FL":6, "GA":14, "HI":0, "ID":4, "IL":29, "IN":15, "IA":13, "KS":10, "KY":13, "LA":10, "ME-D1":0, "ME-D2":0, "ME-AL":6, "MD":8, "MA":18, "MI":15, "MN":12, "MS":10, "MO":18, "MT":4, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":8, "NV":3, "NH":4, "NJ":14, "NM":3, "NY":45, "NC":12, "ND":5, "OH":24, "OK":10, "OR":5, "PA":38, "RI":5, "SC":9, "SD":5, "TN":12, "TX":20, "UT":4, "VT":4, "VA":12, "WA":7, "WV":8, "WI":13, "WY":3},
  1910: {"AL":12, "AK":0, "AZ":3, "AR":9, "CA":13, "CO":6, "CT":7, "DE":3, "DC":0, "FL":6, "GA":14, "HI":0, "ID":4, "IL":29, "IN":15, "IA":13, "KS":10, "KY":13, "LA":10, "ME-D1":0, "ME-D2":0, "ME-AL":6, "MD":8, "MA":18, "MI":15, "MN":12, "MS":10, "MO":18, "MT":4, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":8, "NV":3, "NH":4, "NJ":14, "NM":3, "NY":45, "NC":12, "ND":5, "OH":24, "OK":10, "OR":5, "PA":38, "RI":5, "SC":9, "SD":5, "TN":12, "TX":20, "UT":4, "VT":4, "VA":12, "WA":7, "WV":8, "WI":13, "WY":3},
  1900: {"AL":11, "AK":0, "AZ":0, "AR":9, "CA":10, "CO":5, "CT":7, "DE":3, "DC":0, "FL":5, "GA":13, "HI":0, "ID":3, "IL":27, "IN":15, "IA":13, "KS":10, "KY":13, "LA":9, "ME-D1":0, "ME-D2":0, "ME-AL":6, "MD":8, "MA":16, "MI":14, "MN":11, "MS":10, "MO":18, "MT":3, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":8, "NV":3, "NH":4, "NJ":12, "NM":0, "NY":39, "NC":12, "ND":4, "OH":23, "OK":7, "OR":4, "PA":34, "RI":4, "SC":9, "SD":4, "TN":12, "TX":18, "UT":3, "VT":4, "VA":12, "WA":5, "WV":7, "WI":13, "WY":3},
  1890: {"AL":11, "AK":0, "AZ":0, "AR":8, "CA":9, "CO":4, "CT":6, "DE":3, "DC":0, "FL":4, "GA":13, "HI":0, "ID":3, "IL":24, "IN":15, "IA":13, "KS":10, "KY":13, "LA":8, "ME-D1":0, "ME-D2":0, "ME-AL":6, "MD":8, "MA":15, "MI":14, "MN":9, "MS":9, "MO":17, "MT":3, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":8, "NV":3, "NH":4, "NJ":10, "NM":0, "NY":36, "NC":11, "ND":3, "OH":23, "OK":0, "OR":4, "PA":32, "RI":4, "SC":9, "SD":4, "TN":12, "TX":15, "UT":3, "VT":4, "VA":12, "WA":4, "WV":6, "WI":12, "WY":3},
  1880: {"AL":10, "AK":0, "AZ":0, "AR":7, "CA":8, "CO":3, "CT":6, "DE":3, "DC":0, "FL":4, "GA":12, "HI":0, "ID":0, "IL":22, "IN":15, "IA":13, "KS":9, "KY":13, "LA":8, "ME-D1":0, "ME-D2":0, "ME-AL":6, "MD":8, "MA":14, "MI":13, "MN":7, "MS":9, "MO":16, "MT":0, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":5, "NV":3, "NH":4, "NJ":9, "NM":0, "NY":36, "NC":11, "ND":0, "OH":23, "OK":0, "OR":3, "PA":30, "RI":4, "SC":9, "SD":0, "TN":12, "TX":13, "UT":0, "VT":4, "VA":12, "WA":0, "WV":6, "WI":11, "WY":0},
  1870: {"AL":10, "AK":0, "AZ":0, "AR":6, "CA":6, "CO":3, "CT":6, "DE":3, "DC":0, "FL":4, "GA":11, "HI":0, "ID":0, "IL":21, "IN":15, "IA":11, "KS":5, "KY":12, "LA":8, "ME-D1":0, "ME-D2":0, "ME-AL":7, "MD":8, "MA":13, "MI":11, "MN":5, "MS":8, "MO":15, "MT":0, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":3, "NV":3, "NH":5, "NJ":9, "NM":0, "NY":35, "NC":10, "ND":0, "OH":22, "OK":0, "OR":3, "PA":29, "RI":4, "SC":7, "SD":0, "TN":12, "TX":8, "UT":0, "VT":5, "VA":11, "WA":0, "WV":5, "WI":10, "WY":0},
  1860: {"AL":8, "AK":0, "AZ":0, "AR":5, "CA":5, "CO":0, "CT":6, "DE":3, "DC":0, "FL":3, "GA":9, "HI":0, "ID":0, "IL":16, "IN":13, "IA":8, "KS":3, "KY":11, "LA":7, "ME-D1":0, "ME-D2":0, "ME-AL":7, "MD":7, "MA":12, "MI":8, "MN":4, "MS":0, "MO":11, "MT":0, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":3, "NV":3, "NH":5, "NJ":7, "NM":0, "NY":33, "NC":9, "ND":0, "OH":21, "OK":0, "OR":3, "PA":26, "RI":4, "SC":6, "SD":0, "TN":10, "TX":0, "UT":0, "VT":5, "VA":0, "WA":0, "WV":5, "WI":8, "WY":0},
  1850: {"AL":9, "AK":0, "AZ":0, "AR":4, "CA":4, "CO":0, "CT":6, "DE":3, "DC":0, "FL":3, "GA":10, "HI":0, "ID":0, "IL":11, "IN":13, "IA":4, "KS":0, "KY":12, "LA":6, "ME-D1":0, "ME-D2":0, "ME-AL":8, "MD":8, "MA":13, "MI":6, "MN":4, "MS":7, "MO":9, "MT":0, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":0, "NV":0, "NH":5, "NJ":7, "NM":0, "NY":35, "NC":10, "ND":0, "OH":23, "OK":0, "OR":3, "PA":27, "RI":4, "SC":8, "SD":0, "TN":12, "TX":4, "UT":0, "VT":5, "VA":15, "WA":0, "WV":0, "WI":5, "WY":0},
  1840: {"AL":9, "AK":0, "AZ":0, "AR":3, "CA":0, "CO":0, "CT":6, "DE":3, "DC":0, "FL":3, "GA":10, "HI":0, "ID":0, "IL":9, "IN":12, "IA":4, "KS":0, "KY":12, "LA":6, "ME-D1":0, "ME-D2":0, "ME-AL":9, "MD":8, "MA":12, "MI":5, "MN":0, "MS":6, "MO":7, "MT":0, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":0, "NV":0, "NH":6, "NJ":7, "NM":0, "NY":36, "NC":11, "ND":0, "OH":23, "OK":0, "OR":0, "PA":26, "RI":4, "SC":9, "SD":0, "TN":13, "TX":4, "UT":0, "VT":6, "VA":17, "WA":0, "WV":0, "WI":4, "WY":0},
  1830: {"AL":7, "AK":0, "AZ":0, "AR":3, "CA":0, "CO":0, "CT":8, "DE":3, "DC":0, "FL":0, "GA":11, "HI":0, "ID":0, "IL":5, "IN":9, "IA":0, "KS":0, "KY":15, "LA":5, "ME-D1":0, "ME-D2":0, "ME-AL":10, "MD":10, "MA":14, "MI":3, "MN":0, "MS":4, "MO":4, "MT":0, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":0, "NV":0, "NH":7, "NJ":8, "NM":0, "NY":42, "NC":15, "ND":0, "OH":21, "OK":0, "OR":0, "PA":30, "RI":4, "SC":11, "SD":0, "TN":15, "TX":0, "UT":0, "VT":7, "VA":23, "WA":0, "WV":0, "WI":0, "WY":0},
  1820: {"AL":5, "AK":0, "AZ":0, "AR":0, "CA":0, "CO":0, "CT":8, "DE":3, "DC":0, "FL":0, "GA":9, "HI":0, "ID":0, "IL":3, "IN":5, "IA":0, "KS":0, "KY":14, "LA":5, "ME-D1":0, "ME-D2":0, "ME-AL":9, "MD":11, "MA":15, "MI":0, "MN":0, "MS":3, "MO":3, "MT":0, "NE-D1":0, "NE-D2":0, "NE-D3":0, "NE-AL":0, "NV":0, "NH":8, "NJ":8, "NM":0, "NY":36, "NC":15, "ND":0, "OH":16, "OK":0, "OR":0, "PA":28, "RI":4, "SC":11, "SD":0, "TN":11, "TX":0, "UT":0, "VT":7, "VA":24, "WA":0, "WV":0, "WI":0, "WY":0}
}

const MapSettingType =
{
  optionCycle: 0,
  numericValue: 1, // TODO: Implement other setting types
  stringValue: 2
}

const MapSettingReloadType =
{
  none: 0,
  display: 1,
  data: 2,
  custom: 3
}

var globalMapSettings =
[
  {id: "flipStates", title: "Flip States", type: MapSettingType.optionCycle, options:
    [
      {id: "show", title: "Shown", value: true},
      {id: "hide", title: "Hidden", value: false}
    ],
  defaultValue: "hide", reloadType: MapSettingReloadType.display},
  {id: "piePopularVote", title: "Popular Vote", type: MapSettingType.optionCycle, options:
    [
      {id: "show", title: "Shown", value: true},
      {id: "hide", title: "Hidden", value: false}
    ],
  defaultValue: "hide", reloadType: MapSettingReloadType.display},
  {id: "pieStyle", title: "Pie Style", type: MapSettingType.optionCycle, options:
    [
      {id: "expanded", title: "Expanded", value: 0},
      {id: "compact", title: "Compact", value: 1}
    ],
  defaultValue: "expanded", reloadType: MapSettingReloadType.display},
  {id: "dateFormat", title: "Date Format", type: MapSettingType.optionCycle, options:
    [
      {id: "mdy", title: "MM/DD/YYYY", value: 0},
      {id: "dmy", title: "DD/MM/YYYY", value: 1},
      {id: "ymd", title: "YYYY/MM/DD", value: 2}
    ],
  defaultValue: "mdy", reloadType: MapSettingReloadType.display},
  {id: "showTooltips", title: "Control Tooltips", type: MapSettingType.optionCycle, options:
    [
      {id: "show", title: "Shown", value: true},
      {id: "hide", title: "Hidden", value: false}
    ],
  defaultValue: "show", reloadType: MapSettingReloadType.none}
]

var currentGlobalMapSettings = {}
for (var settingNum in globalMapSettings)
{
  currentGlobalMapSettings[globalMapSettings[settingNum].id] = getCookie(globalMapSettings[settingNum].id) || globalMapSettings[settingNum].defaultValue
}

var USAPresidentialMapType = new MapType(
  "USA-Presidential",
  "Presidential",
  "P",
  "assets/usa-pres.png",
  "svg-sources/usa-presidential-map.svg",
  538,
  function(decade, regionID, regionData)
  {
    if (currentMapSource.isCustom() && regionID in overrideRegionEVs) return overrideRegionEVs[regionID]
    if (currentMapSource.getShouldSetDisabledWorthToZero() && regionData.disabled) return 0
    return (regionEVArray[decade] || regionEVArray[2020])[regionID]
  },
  true,
  5,
  true,
  true,
  `
  <h3 style='margin: 0px;'>Controls</h3>
  <h5 style='margin: 0px; margin-top: 8px; margin-bottom: 10px; text-align: left; font-size: 15px;'>
    &#x2022; Select Source / <span style='color: #ec7039;'>1</span>, <span style='color: #ec7039;'>2</span>, <span style='color: #4a84ff;'>3</span>, <span style='color: #0c71c0;'>4</span>, <span style='color: #aaa;'>5</span>, 6 keys: Change map source<br>
    &#x2022; Clear button / 0 key: <span style='color: #aaa;'>Clear map</span><br>
    &#x2022; Slider / arrow keys: Select map date<br>
    &nbsp;&nbsp;&nbsp;* Down: -5, Left: -1, Right: +1, Up: +5<br>
    &#x2022; Click state: View more poll / projection / result data<br>
    <br>
    &#x2022; Copy / Edit & Done button / enter key: Edit map<br>
    &#x2022; Party buttons / 0-4 keys: Select party to fill<br>
    &#x2022; Left click state: Cycle <span style='color: #d9202f;'>safe</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #cf8980;'>tilt</span> margins<br>
    &#x2022; Right click state: Cycle <span style='color: #cf8980;'>tilt</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #d9202f;'>safe</span> margins<br>
    &#x2022; Shift click state: Enter specific margin<br>
    &#x2022; Alt click state: Disable state<br>
    &#x2022; Hold and drag: <span style='color: #587ccc;'>Fill states</span><br>
    <br>
    &#x2022; Party buttons: Click to edit cadndiate name<br>
    &#x2022; Left / right click preset button: Cycle preset colors<br>
    &#x2022; Left click margin color: Select with color picker<br>
    &#x2022; Right click margin color: Enter exact hex value<br>
    <br>
    &#x2022; Source checkbox: Select map source to compare<br>
    &#x2022; Shift + 1-5 keys: Select map source to compare<br>
    &#x2022; Up/Down, Left/Right arrow keys: Select, adjust slider<br>
    <br>
    &#x2022; C key: Toggle compare dropdown selection<br>
    &#x2022; 1 key: Compare <span style='color: #aaa;'>Past Results</span> vs <span style='color: #aaa;'>Past Results</span><br>
    &#x2022; 2 key: Compare <span style='color: #aaa;'>Past Results</span> vs <span style='color: #ec7039;'>538 Projection</span><br>
    &#x2022; 3 key: Compare <span style='color: #aaa;'>Past Results</span> vs <span style='color: #ec7039;'>538 Poll Avg</span><br>
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
  {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "ME-1":"ME-D1", "ME-2":"ME-D2", "Maine":"ME-AL", "Maine-text":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "NE-1":"NE-D1", "NE-2":"NE-D2", "NE-3":"NE-D3", "Nebraska":"NE-AL", "Nebraska-text":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"},
  [],
  [
    {id: "presViewingType", title: "Viewing Type", type: MapSettingType.optionCycle, options:
      [
        {id: "popularVotes", title: "Popular Votes", value: false},
        {id: "electoralVotes", title: "Electoral Votes", value: true}
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
    {id: "evDecadeOverrideSelection", title: "EV Decade", type: MapSettingType.optionCycle, options:
    Object.keys(regionEVArray).map((decade) => {
      return {id: decade, title: decade, value: parseInt(decade)}
    }),
    defaultValue: Object.keys(regionEVArray).reverse()[0], reloadType: MapSettingReloadType.display},
    {id: "evDecadeOverrideToggle", title: "Override Decade", type: MapSettingType.optionCycle, options:
      [
        {id: "enabled", title: "Enabled", value: true},
        {id: "disabled", title: "Disabled", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "disabled", reloadType: MapSettingReloadType.display}
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
  true,
  `
  <h3 style='margin: 0px;'>Controls</h3>
  <h5 style='margin: 0px; margin-top: 8px; margin-bottom: 10px; text-align: left; font-size: 15px;'>
    &#x2022; Select Source / <span style='color: #E9353B;'>1</span>, <span style='color: #BCBCBC;'>2</span>, <span style='color: #0A5EA0;'>3</span>, <span style='color: #aaa;'>4</span>, 5 keys: Change map source<br>
    &#x2022; Clear button / 0 key: <span style='color: #aaa;'>Clear map</span><br>
    &#x2022; Slider / arrow keys: Select map date<br>
    &nbsp;&nbsp;&nbsp;* Down: -3, Left: -1, Right: +1, Up: +3<br>
    &#x2022; Click state: View more poll / projection / result data<br>
    <br>
    &#x2022; Copy / Edit & Done button / enter key: Edit map<br>
    &#x2022; Party buttons / 0-4 keys: Select party to fill<br>
    &#x2022; Left click state: Cycle <span style='color: #d9202f;'>safe</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #cf8980;'>tilt</span> margins<br>
    &#x2022; Right click state: Cycle <span style='color: #cf8980;'>tilt</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #d9202f;'>safe</span> margins<br>
    &#x2022; Shift click state: Enter specific margin<br>
    &#x2022; Alt click state: Disable state<br>
    &#x2022; Hold and drag: <span style='color: #587ccc;'>Fill states</span><br>
    <br>
    &#x2022; Party buttons: Click to edit cadndiate name<br>
    &#x2022; Left / right click preset button: Cycle preset colors<br>
    &#x2022; Left click margin color: Select with color picker<br>
    &#x2022; Right click margin color: Enter exact hex value<br>
    <br>
    &#x2022; Source checkbox: Select map source to compare<br>
    &#x2022; Shift + 1-4 keys: Select map source to compare<br>
    &#x2022; Up/Down, Left/Right arrow keys: Select, adjust slider<br>
    <br>
    &#x2022; Settings dropdown: Click setting to toggle/cycle options<br>
    &#x2022; Map Current Seats: Show seats not up for election<br>
    &#x2022; Pie Current Seats: Show seats not up for election<br>
    &#x2022; Seat Arrangement:<br>
    &nbsp;&nbsp;&nbsp;* By Election (regular or special)<br>
    &nbsp;&nbsp;&nbsp;* By Class (specific seat for the state: <span style='color: #D93314;'>1</span>/<span style='color: #F0A300;'>2</span>/<span style='color: #E8D500;'>3</span>)<br>
    &nbsp;&nbsp;&nbsp;** <span style='color: #D93314;'>1: 2018</span>, <span style='color: #F0A300;'>2: 2020</span>, <span style='color: #E8D500;'>3: 2016/2022</span><br>
    &#x2022; Off Cycle Elections: Show elections not on election day<br>
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
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "hide", reloadType: MapSettingReloadType.display},
    {id: "pieCurrentSeats", title: "Pie Current Seats", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return !value
      },
    defaultValue: "show", reloadType: MapSettingReloadType.display},
    {id: "seatArrangement", title: "Seat Arrangement", type: MapSettingType.optionCycle, options:
      [
        {id: "election-type", title: "Election", value: 0},
        {id: "seat-class", title: "Class", value: 1}
      ],
      shouldShowActive: (value) => {
        return value == 1
      },
    defaultValue: "election-type", reloadType: MapSettingReloadType.data},
    {id: "offYear", title: "Off Cycle Elections", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "hide", reloadType: MapSettingReloadType.data}
  ]
)

var USAGovernorMapType = new MapType(
  "USA-Governor",
  "Governor",
  "G",
  "assets/usa-governor.png",
  "svg-sources/usa-governor-map.svg",
  50,
  function()
  {
    return 1
  },
  false,
  4,
  true,
  true,
  `
  <h3 style='margin: 0px;'>Controls</h3>
  <h5 style='margin: 0px; margin-top: 8px; margin-bottom: 10px; text-align: left; font-size: 15px;'>
    &#x2022; Select Source / <span style='color: #E9353B;'>1</span>, <span style='color: #0A5EA0;'>2</span>, <span style='color: #aaa;'>3</span>, 4 keys: Change map source<br>
    &#x2022; Clear button / 0 key: <span style='color: #aaa;'>Clear map</span><br>
    &#x2022; Slider / arrow keys: Select map date<br>
    &nbsp;&nbsp;&nbsp;* Down: -4, Left: -1, Right: +1, Up: +4<br>
    &#x2022; Click state: View more poll / projection / result data<br>
    <br>
    &#x2022; Copy / Edit & Done button / enter key: Edit map<br>
    &#x2022; Party buttons / 0-4 keys: Select party to fill<br>
    &#x2022; Left click state: Cycle <span style='color: #d9202f;'>safe</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #cf8980;'>tilt</span> margins<br>
    &#x2022; Right click state: Cycle <span style='color: #cf8980;'>tilt</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #d9202f;'>safe</span> margins<br>
    &#x2022; Shift click state: Enter specific margin<br>
    &#x2022; Alt click state: Disable state<br>
    &#x2022; Hold and drag: <span style='color: #587ccc;'>Fill states</span><br>
    <br>
    &#x2022; Party buttons: Click to edit cadndiate name<br>
    &#x2022; Left / right click preset button: Cycle preset colors<br>
    &#x2022; Left click margin color: Select with color picker<br>
    &#x2022; Right click margin color: Enter exact hex value<br>
    <br>
    &#x2022; Source checkbox: Select map source to compare<br>
    &#x2022; Shift + 1-3 keys: Select map source to compare<br>
    &#x2022; Up/Down, Left/Right arrow keys: Select, adjust slider<br>
    <br>
    &#x2022; Settings dropdown: Click setting to toggle/cycle options<br>
    &#x2022; Map Current Seats: Show seats not up for election<br>
    &#x2022; Pie Current Seats: Show seats not up for election<br>
    &#x2022; Off Cycle Elections: Show elections not on election day<br>
    <br>
    &#x2022; Margins button / enter key: Apply entered margins<br>
    &#x2022; Margin dropdown button: Edit margin value<br>
    <br>
    &#x2022; Drop JPEG / PNG image file: Set icon inside pie chart<br>
    &#x2022; Drop <span style='color: #22a366;'>CSV</span> / <span style='color: #f7df1c;'>JSON</span> file: Load custom map<br>
  </h5>
  `,
  {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"},
  [],
  [
    {id: "mapCurrentSeats", title: "Map Current Seats", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "hide", reloadType: MapSettingReloadType.display},
    {id: "pieCurrentSeats", title: "Pie Current Seats", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return !value
      },
    defaultValue: "show", reloadType: MapSettingReloadType.display},
    {id: "offYear", title: "Off Cycle Elections", type: MapSettingType.optionCycle, options:
      [
        {id: "show", title: "Shown", value: true},
        {id: "hide", title: "Hidden", value: false}
      ],
      shouldShowActive: (value) => {
        return value
      },
    defaultValue: "hide", reloadType: MapSettingReloadType.data}
  ]
)

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
  `
  <h3 style='margin: 0px;'>Controls</h3>
  <h5 style='margin: 0px; margin-top: 8px; margin-bottom: 10px; text-align: left; font-size: 15px;'>
    &#x2022; Select Source / <span style='color: #E9353B;'>1</span>, <span style='color: #0A5EA0;'>2</span>, <span style='color: #aaa;'>3</span>, 4 keys: Change map source<br>
    &#x2022; Clear button / 0 key: <span style='color: #aaa;'>Clear map</span><br>
    &#x2022; Slider / arrow keys: Select map date<br>
    &nbsp;&nbsp;&nbsp;* Down: -4, Left: -1, Right: +1, Up: +4<br>
    &#x2022; Click state: Reveal state districts<br>
    &#x2022; Right click state: View more poll / projection / result data<br>
    <br>
    &#x2022; Copy / Edit & Done button / enter key: Edit map<br>
    &#x2022; Party buttons / 0-4 keys: Select party to fill<br>
    &#x2022; Left click state: Cycle <span style='color: #d9202f;'>safe</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #cf8980;'>tilt</span> margins<br>
    &#x2022; Right click state: Cycle <span style='color: #cf8980;'>tilt</span>,  <span style='color: #ff8b98;'>lean</span>,  <span style='color: #ff5864;'>likely</span>,  <span style='color: #d9202f;'>safe</span> margins<br>
    &#x2022; Shift click state: Enter specific margin<br>
    &#x2022; Alt click state: Disable state<br>
    &#x2022; Hold and drag: <span style='color: #587ccc;'>Fill states</span><br>
    <br>
    &#x2022; Party buttons: Click to edit cadndiate name<br>
    &#x2022; Left / right click preset button: Cycle preset colors<br>
    &#x2022; Left click margin color: Select with color picker<br>
    &#x2022; Right click margin color: Enter exact hex value<br>
    <br>
    &#x2022; Source checkbox: Select map source to compare<br>
    &#x2022; Shift + 1-3 keys: Select map source to compare<br>
    &#x2022; Up/Down, Left/Right arrow keys: Select, adjust slider<br>
    <br>
    &#x2022; Settings dropdown: Click setting to toggle/cycle options<br>
    &#x2022; Map Seats: Show totals or all districts<br>
    &#x2022; Seat Totals: Show totals for selected state or all states<br>
    <br>
    &#x2022; Margins button / enter key: Apply entered margins<br>
    &#x2022; Margin dropdown button: Edit margin value<br>
    <br>
    &#x2022; Drop JPEG / PNG image file: Set icon inside pie chart<br>
    &#x2022; Drop <span style='color: #22a366;'>CSV</span> / <span style='color: #f7df1c;'>JSON</span> file: Load custom map<br>
  </h5>
  `,
  {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY"},
  [],
  [
    {id: "showAllDistricts", title: "National View", type: MapSettingType.optionCycle, options:
      [
        {id: "totals", title: "Show Totals", value: false},
        {id: "all", title: "Show Districts", value: true}
      ],
    defaultValue: "totals", reloadType: MapSettingReloadType.display},
    {id: "showStateDistricts", title: "State View", type: MapSettingType.optionCycle, options:
      [
        {id: "boxes", title: "Show Boxes", value: false},
        {id: "districts", title: "Show Districts", value: true}
      ],
    defaultValue: "districts", reloadType: MapSettingReloadType.display},
    {id: "zoomSeatTotals", title: "Seat Totals", type: MapSettingType.optionCycle, options:
      [
        {id: "all", title: "All Seats", value: false},
        {id: "selected", title: "Selected State", value: true}
      ],
    defaultValue: "selected", reloadType: MapSettingReloadType.display}
  ]
)

var mapTypes = {}
mapTypes[USAPresidentialMapType.getID()] = USAPresidentialMapType
mapTypes[USASenateMapType.getID()] = USASenateMapType
mapTypes[USAGovernorMapType.getID()] = USAGovernorMapType
mapTypes[USAHouseMapType.getID()] = USAHouseMapType

var mapTypeIDs = [USAPresidentialMapType.getID(), USASenateMapType.getID(), USAHouseMapType.getID(), USAGovernorMapType.getID()]
