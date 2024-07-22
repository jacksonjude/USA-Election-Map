class MapSource
{
  constructor(id, name, dataURL, homepageURL, iconURL, columnMap, cycleYear, candidateNameToPartyIDMap, shortCandidateNameOverride, regionNameToIDMap, regionIDToLinkMap, heldRegionMap, shouldFilterOutDuplicateRows, addDecimalPadding, organizeMapDataFunction, viewingDataFunction, zoomingDataFunction, splitVoteDataFunction, splitVoteDisplayOptions, getFormattedRegionName, customOpenRegionLinkFunction, updateCustomMapFunction, convertMapDataRowToCSVFunction, isCustomMap, shouldClearDisabled, shouldShowVoteshare, voteshareCutoffMargin, overrideSVGPath, shouldSetDisabledWorthToZero, shouldUseOriginalMapDataForTotalsPieChart, shouldForcePopularVoteDisplayOnZoom, customDefaultMargins, customVotesharePrefix, customVoteshareSuffix)
  {
    this.id = id
    this.name = name
    this.dataURL = dataURL
    this.homepageURL = homepageURL
    this.iconURL = iconURL
    this.columnMap = columnMap
    this.cycleYear = cycleYear
    this.candidateNameToPartyIDMap = candidateNameToPartyIDMap && this.cycleYear ? candidateNameToPartyIDMap[this.cycleYear] : candidateNameToPartyIDMap
    this.shortCandidateNameOverride = shortCandidateNameOverride && this.cycleYear ? shortCandidateNameOverride[this.cycleYear] : shortCandidateNameOverride
    this.regionNameToIDMap = regionNameToIDMap
    this.regionIDToLinkMap = regionIDToLinkMap
    this.heldRegionMap = heldRegionMap
    this.shouldFilterOutDuplicateRows = shouldFilterOutDuplicateRows
    this.addDecimalPadding = addDecimalPadding
    this.filterMapDataFunction = organizeMapDataFunction
    this.viewingDataFunction = viewingDataFunction || ((mapData) => {
      return mapData
    })
    this.zoomingDataFunction = zoomingDataFunction
    this.splitVoteDataFunction = splitVoteDataFunction || ((mapData) => {
      return mapData
    })
    this.splitVoteDisplayOptions = splitVoteDisplayOptions
    this.getFormattedRegionName = getFormattedRegionName
    this.customOpenRegionLinkFunction = customOpenRegionLinkFunction
    this.updateCustomMapFunction = updateCustomMapFunction
    this.convertMapDataRowToCSVFunction = convertMapDataRowToCSVFunction
    this.isCustomMap = isCustomMap == null ? false : isCustomMap
    this.shouldClearDisabled = shouldClearDisabled == null ? true : shouldClearDisabled
    this.shouldShowVoteshare = shouldShowVoteshare == null ? false : shouldShowVoteshare
    this.voteshareCutoffMargin = voteshareCutoffMargin
    this.overrideSVGPath = overrideSVGPath
    this.shouldSetDisabledWorthToZero = shouldSetDisabledWorthToZero == null ? false : true
    this.shouldUseOriginalMapDataForTotalsPieChart = shouldUseOriginalMapDataForTotalsPieChart == null ? false : shouldUseOriginalMapDataForTotalsPieChart
    this.shouldForcePopularVoteDisplayOnZoom = shouldForcePopularVoteDisplayOnZoom == null ? false : shouldForcePopularVoteDisplayOnZoom
    this.customDefaultMargins = customDefaultMargins
    this.customVoteshareSuffix = customVoteshareSuffix
    this.customVotesharePrefix = customVotesharePrefix
  }

  // id,
  // name,
  // dataURL,
  // homepageURL,
  // iconURL,
  // columnMap,
  // cycleYear,
  // candidateNameToPartyIDMap,
  // shortCandidateNameOverride,
  // regionNameToIDMap,
  // regionIDToLinkMap,
  // heldRegionMap,
  // shouldFilterOutDuplicateRows,
  // addDecimalPadding,
  // organizeMapDataFunction,
  // viewingDataFunction,
  // zoomingDataFunction,
  // splitVoteDataFunction,
  // splitVoteDisplayOptions,
  // getFormattedRegionName,
  // customOpenRegionLinkFunction,
  // updateCustomMapFunction,
  // convertMapDataRowToCSVFunction,
  // isCustomMap,
  // shouldClearDisabled,
  // shouldShowVoteshare,
  // voteshareCutoffMargin,
  // overrideSVGPath,
  // shouldSetDisabledWorthToZero
  // shouldUseOriginalMapDataForTotalsPieChart
  // shouldForcePopularVoteDisplayOnZoom
  // customDefaultMargins
  // customVotesharePrefix
  // customVoteshareSuffix

  async loadMap(reloadCache, onlyAttemptLocalFetch, resetCandidateNames)
  {
    var self = this
    
    reloadCache = reloadCache ? true : (self.dataURL ? !(await CSVDatabase.isSourceUpdated(self.id)) : false)
    resetCandidateNames = resetCandidateNames != null ? resetCandidateNames : true

    if ((self.rawMapData == null || reloadCache) && (self.dataURL || self.textMapData))
    {
      var textData
      if (self.dataURL)
      {
        textData = await self.loadMapCache(self, reloadCache, onlyAttemptLocalFetch)
      }
      else
      {
        textData = self.textMapData
      }
      if (textData == null) { return false }
      
      if (isString(self.dataURL) || self.dataURL.type == csvSourceType)
      {
        self.rawMapData = await self.convertCSVToArray(self, textData)
      }
      else if (self.dataURL.type == jsonSourceType && isString(textData) && !self.isCustomMap)
      {
        self.rawMapData = JSON.parse(textData)
      }
      else
      {
        self.rawMapData = textData
      }
    }

    if (self.rawMapData == null) { return false }

    self.mapDates = (isString(self.dataURL) || self.dataURL.type == csvSourceType) ? Object.keys(self.rawMapData) : [Date.now()]
    for (let dateNum in self.mapDates)
    {
      self.mapDates[dateNum] = parseInt(self.mapDates[dateNum])
    }
    self.mapDates.sort((mapDate1, mapDate2) => (mapDate1-mapDate2))

    let filterMapDataCallback = self.filterMapDataFunction(self.rawMapData, self.mapDates, self.columnMap, self.cycleYear, self.candidateNameToPartyIDMap, self.regionNameToIDMap, self.heldRegionMap, self.shouldFilterOutDuplicateRows, self.isCustomMap, self.voteshareCutoffMargin, !self.isCustomMap || self.editingMode == EditingMode.voteshare)
    self.mapData = filterMapDataCallback.mapData

    if (filterMapDataCallback.candidateNameData != null && resetCandidateNames)
    {
      if (self.candidateNameData != null)
      {
        for (let date in filterMapDataCallback.candidateNameData)
        {
          self.candidateNameData[date] = mergeObject(self.candidateNameData[date], filterMapDataCallback.candidateNameData[date])
        }
      }
      else
      {
        self.candidateNameData = filterMapDataCallback.candidateNameData
      }
    }
    for (let date in self.candidateNameData)
    {
      if (self.candidateNameData[date] == null) { continue }
      if (Object.keys(self.candidateNameData[date]).length == 0)
      {
        self.candidateNameData[date] = cloneObject(self.shortCandidateNameOverride)
      }
    }

    if (filterMapDataCallback.mapDates != null)
    {
      self.mapDates = filterMapDataCallback.mapDates
    }

    return true
  }

  async loadMapCache(self, reloadCache, onlyAttemptLocalFetch)
  {
    self = self || this

    if (!reloadCache)
    {
      var savedCSVText = await CSVDatabase.fetchFile(this.id)
      if (savedCSVText != null)
      {
        return savedCSVText
      }
      else if (onlyAttemptLocalFetch)
      {
        return null
      }
    }

    var fetchMapDataPromise = new Promise((resolve) => {
      createCSVParsingIndicator(downloadIndicatorColor)
      $.ajax({
        xhr: () => {
          let xhr = new window.XMLHttpRequest()
          self.cancelXHR = () => {
            xhr.abort()
            resolve(null)
          }

          xhr.addEventListener("progress", function(evt) {
            if (evt.lengthComputable) {
              let percentComplete = evt.loaded / evt.total
              updateCSVParsingIndicator(percentComplete)
            }
          }, false)

          xhr.overrideMimeType("text/plain; charset=UTF-8")

          return xhr
        },
        type: 'GET',
        url: isString(self.dataURL) ? self.dataURL : self.dataURL.url,
        data: {},
        success: (data) => {
          hideCSVParsingIndicator()

          CSVDatabase.insertFile(self.id, data)
          resolve(data)
        },
        fail: () => {
          hideCSVParsingIndicator()

          resolve(null)
        }
      })
    })

    return fetchMapDataPromise
  }

  cancelDownload()
  {
    if (!this.cancelXHR) return
    this.cancelXHR()
    this.cancelXHR = null

    hideCSVParsingIndicator()
  }

  convertCSVToArray(self, strData)
  {
    let csvTextSize = new Blob([strData]).size
    const chunkSize = 1*1024*1024
    let chunkPercentage = chunkSize/csvTextSize

    let shouldDisplayIndicator = chunkPercentage < 0.5

    shouldDisplayIndicator && createCSVParsingIndicator(csvParseIndicatorColor)

    let csvReadPromise = new Promise(resolve => {
      let chunkOn = 1
      let unsortedData = []

      Papa.parse(strData, {
        header: true,
        worker: true,
        skipEmptyLines: true,
        complete: () => {
          let finalArray = {}

          for (let rowDataArray of unsortedData)
          {
            let rowModelDate = new Date(rowDataArray[self.columnMap.date])
            if (!finalArray[rowModelDate.getTime()])
            {
              finalArray[rowModelDate.getTime()] = []
            }
            finalArray[rowModelDate.getTime()].push(rowDataArray)
          }

          shouldDisplayIndicator && hideCSVParsingIndicator()

          resolve(finalArray)
        },
        chunk: (chunkResults) => {
          unsortedData.push(...chunkResults.data)
          chunkOn += 1

          let percentageDone = chunkPercentage*chunkOn
          if (percentageDone > 1) percentageDone = 1
          shouldDisplayIndicator && updateCSVParsingIndicator(percentageDone)
        },
        chunkSize: chunkSize
      })
    })

    return csvReadPromise
  }

  setTextMapData(textData, self)
  {
    self = self || this
    this.textMapData = textData
  }

  getTextMapData()
  {
    return this.textMapData
  }

  getMapData()
  {
    return this.mapData
  }

  resetMapData()
  {
    this.rawMapData = null
    this.mapData = null
    this.mapDates = null
  }

  clearMapData(shouldFullClear)
  {
    shouldFullClear = shouldFullClear == null ? false : shouldFullClear

    var mapIsClearExceptDisabled = true

    for (var mapDate in this.mapData)
    {
      for (var regionID in this.mapData[mapDate])
      {
        if (!this.mapData[mapDate][regionID].disabled && this.mapData[mapDate][regionID].partyID != TossupParty.getID())
        {
          this.mapData[mapDate][regionID].partyID = TossupParty.getID()
          this.mapData[mapDate][regionID].margin = 0
          this.mapData[mapDate][regionID].partyVotesharePercentages = []

          mapIsClearExceptDisabled = false
        }
      }
    }

    this.textMapData = this.convertArrayToCSV(this.mapData, this.columnMap, this.regionNameToIDMap, this.candidateNameToPartyIDMap, this.convertMapDataRowToCSVFunction)
    this.rawMapData = this.convertCSVToArray(this, this.textMapData)

    if (this.shouldClearDisabled || mapIsClearExceptDisabled || shouldFullClear)
    {
      this.setTextMapData("date\n" + getTodayString("/", false, "mdy"), this)
      this.setIconURL("", this)
      if (this.candidateNameData != null)
      {
        for (var date in this.candidateNameData)
        {
          this.candidateNameData[date] = cloneObject(this.shortCandidateNameOverride)
        }
      }
      dropdownPoliticalPartyIDs = cloneObject(defaultDropdownPoliticalPartyIDs)

      overrideRegionEVs = {}
    }
  }

  getMapDates()
  {
    return this.mapDates
  }

  getRegionData(modelDate, regionID)
  {
    return this.mapData[modelDate][regionID]
  }

  getViewingData(mapDateData)
  {
    return this.viewingDataFunction(mapDateData)
  }

  getZoomingData(mapDateData, zoomRegion)
  {
    return this.zoomingDataFunction(mapDateData, zoomRegion)
  }

  getSplitVoteData(mapDateData)
  {
    return this.splitVoteDataFunction(mapDateData)
  }

  async canZoom(mapDateData, regionID)
  {
    let baseRegionID = regionID ? getBaseRegionID(regionID).baseID : null
    if (baseRegionID && baseRegionID.includes("-"))
    {
      baseRegionID = baseRegionID.split("-")[0]
    }
    return this.zoomingDataFunction != null && (!mapDateData || await this.zoomingDataFunction(mapDateData, baseRegionID, true))
  }

  getSplitVoteDisplayOptions()
  {
    return this.splitVoteDisplayOptions
  }

  openRegionLink(regionID, modelDate)
  {
    if (this.customOpenRegionLinkFunction == undefined)
    {
      if (!this.homepageURL) { return }
      window.open(this.homepageURL + this.regionIDToLinkMap[regionID])
    }
    else
    {
      this.customOpenRegionLinkFunction(this.homepageURL, regionID, this.regionIDToLinkMap, modelDate, false, this.mapData)
    }
  }

  openHomepageLink(modelDate)
  {
    if (this.customOpenRegionLinkFunction == undefined)
    {
      if (!this.homepageURL) { return }
      window.open(this.homepageURL)
    }
    else
    {
      this.customOpenRegionLinkFunction(this.homepageURL, null, null, modelDate, true, this.mapData)
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

  getCandidateNames(date)
  {
    if (this.candidateNameData == null || date == null || this.candidateNameData[date] == null || JSON.stringify(this.candidateNameData[date]) == "{}")
    {
      return this.shortCandidateNameOverride
    }
    else
    {
      return this.candidateNameData[date]
    }
  }

  setCandidateNames(candidateNamesToSet, dateToSet, self)
  {
    self = self || this

    if (self.candidateNameData == null) { self.candidateNameData = {} }
    self.candidateNameData[dateToSet] = cloneObject(candidateNamesToSet)
  }

  getIconURL(shouldGetSmall)
  {
    if (!this.iconURL) { return null }

    if (!shouldGetSmall && this.iconURL.regular)
    {
      return this.iconURL.regular
    }
    if (shouldGetSmall && this.iconURL.mini)
    {
      return this.iconURL.mini
    }
    return this.iconURL
  }

  setIconURL(newIconURL, self)
  {
    self = self || this
    this.iconURL = newIconURL
  }

  hasHomepageURL()
  {
    return this.homepageURL != null
  }

  getAddDecimalPadding()
  {
    return this.addDecimalPadding
  }

  isCustom()
  {
    return this.isCustomMap
  }

  getShouldShowVoteshare()
  {
    return this.editingMode == EditingMode.voteshare || this.shouldShowVoteshare
  }

  getOverrideSVGPath(mapDate)
  {
    var isFunction = (typeof this.overrideSVGPath === 'function')
    if (this.mapData == null) return isFunction ? null : this.overrideSVGPath

    var mapDates = Object.keys(this.mapData)
    var mapDateToUse = mapDate || mapDates[mapDates.length-1]
    return isFunction ? this.overrideSVGPath(mapDateToUse) : this.overrideSVGPath
  }

  getShouldSetDisabledWorthToZero()
  {
    return this.shouldSetDisabledWorthToZero
  }

  getShouldUseOriginalMapDataForTotalsPieChart()
  {
    return this.shouldUseOriginalMapDataForTotalsPieChart && !(currentViewingState == ViewingState.zooming && currentMapType.getMapSettingValue("zoomSeatTotals"))
  }

  getShouldForcePopularVoteDisplayOnZoom()
  {
    return this.shouldForcePopularVoteDisplayOnZoom
  }
  
  getCustomDefaultMargins()
  {
    return this.customDefaultMargins
  }
  
  getVotesharePrefix()
  {
    return this.customVotesharePrefix ?? '+'
  }
  
  getVoteshareSuffix()
  {
    return this.customVoteshareSuffix ?? '%'
  }
  
  getCustomVoteshareSuffix()
  {
    return this.customVoteshareSuffix
  }

  getDropdownPartyIDs()
  {
    return this.dropdownPartyIDs
  }

  setDropdownPartyIDs(partyIDs)
  {
    var dropdownPartyIDs = cloneObject(partyIDs)
    if (dropdownPartyIDs.includes(addButtonPartyID))
    {
      dropdownPartyIDs.splice(dropdownPartyIDs.indexOf(addButtonPartyID), 1)
    }
    this.dropdownPartyIDs = dropdownPartyIDs
  }

  updateMapData(displayRegionArray, dateToUpdate, resetMapData, candidateNames, editingMode)
  {
    this.editingMode = editingMode ?? this.editingMode ?? EditingMode.margin

    if (!this.mapData || resetMapData)
    {
      this.mapData = {}
    }
    if (!(dateToUpdate in this.mapData))
    {
      this.mapData[dateToUpdate] = {}
    }

    if (this.updateCustomMapFunction)
    {
      this.updateCustomMapFunction(displayRegionArray, this.mapData[dateToUpdate])
    }
    else
    {
      for (let regionID in displayRegionArray)
      {
        if (regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) { continue }

        let regionData = displayRegionArray[regionID]
        regionData.region = regionID

        this.mapData[dateToUpdate][regionID] = cloneObject(regionData)
      }
    }

    if (candidateNames)
    {
      this.candidateNameToPartyIDMap = invertObject(candidateNames)
    }
    this.textMapData = this.convertArrayToCSV(this.mapData, this.columnMap, this.regionNameToIDMap, this.candidateNameToPartyIDMap, this.convertMapDataRowToCSVFunction)
    this.rawMapData = null
  }

  convertArrayToCSV(mapData, columnMap, regionNameToID, candidateNameToPartyIDs, convertMapDataRowToCSVFunction)
  {
    let csvText = ""

    let columnTitles = Object.values(columnMap)
    for (let titleNum in columnTitles)
    {
      csvText += columnTitles[titleNum]
      if (titleNum < columnTitles.length-1)
      {
        csvText += ","
      }
    }
    csvText += "\n"

    for (let mapDate in mapData)
    {
      let mapDateObject = new Date(parseInt(mapDate))
      let mapDateString = (mapDateObject.getMonth()+1) + "/" + mapDateObject.getDate() + "/" + mapDateObject.getFullYear()
      for (let regionID in mapData[mapDate])
      {
        let regionData = mapData[mapDate][regionID]

        let candidatesToAdd = regionData.partyVotesharePercentages && this.editingMode == EditingMode.voteshare ? regionData.partyVotesharePercentages.reduce((candidateMap, partyPercentage) =>
        {
          return {...candidateMap, [partyPercentage.candidate]: partyPercentage.partyID}
        }, {}) : cloneObject(candidateNameToPartyIDs)

        if (regionData.partyID && regionData.partyID != TossupParty.getID() && !getKeyByValue(candidatesToAdd, regionData.partyID))
        {
          candidatesToAdd[regionData.candidateName || politicalParties[regionData.partyID].getNames()[0]] = regionData.partyID
        }

        if (regionData.margin == 0 && regionData.partyID == TossupParty.getID())
        {
          candidatesToAdd[IndependentGenericParty.getNames()[0]] = IndependentGenericParty.getID()
        }

        for (let candidateName in candidatesToAdd)
        {
          if (candidatesToAdd[candidateName] != regionData.partyID && regionData.margin != 0 && !regionData.partyVotesharePercentages) { continue }
          if (regionData.margin == 0 && regionData.partyID == TossupParty.getID() && candidatesToAdd[candidateName] != IndependentGenericParty.getID()) { continue }

          for (let columnTitleNum in columnTitles)
          {
            let columnKey = getKeyByValue(columnMap, columnTitles[columnTitleNum])
            csvText += convertMapDataRowToCSVFunction(columnKey, mapDateString, regionID, regionNameToID, candidateName, candidatesToAdd[candidateName], regionData, this.editingMode == EditingMode.voteshare)

            if (columnTitleNum < columnTitles.length-1)
            {
              csvText += ","
            }
          }

          csvText += "\n"
        }
      }
    }

    csvText = csvText.slice(0, -1)

    var rowCount = csvText.split("\n").length
    if (rowCount == 1)
    {
      var mapDates = []
      if (mapData)
      {
        mapDates = Object.keys(mapData)
      }
      var dateToUse = new Date()
      if (mapDates.length > 0)
      {
        dateToUse = new Date(parseInt(mapDates[0]))
      }
      csvText = "date\n" + (dateToUse.getMonth()+1) + "/" + dateToUse.getDate() + "/" + dateToUse.getFullYear()
    }

    return csvText
  }

  getEditingMode()
  {
    return this.editingMode
  }
}

const nationalPopularVoteID = "NPV"
const statePopularVoteDistrictID = "PV"

const jsonSourceType = "JSON"
const csvSourceType = "CSV"

var mainTwoPartyIDsToNames = {}
mainTwoPartyIDsToNames[DemocraticParty.getID()] = DemocraticParty.getNames()[0]
mainTwoPartyIDsToNames[RepublicanParty.getID()] = RepublicanParty.getNames()[0]

var NullMapSource = new MapSource(
  "None", // id
  "None", // name
  null, // dataURL
  null, // homepageURL
  null, // iconURL
  null, // columnMap
  null, // cycleYear
  invertObject(mainTwoPartyIDsToNames), // candidateNameToPartyIDMap
  mainTwoPartyIDsToNames // shortCandidateNameOverride
)
