class MapSource
{
  constructor(id, name, dataURL, homepageURL, iconURL, columnMap, cycleYear, candidateNameToPartyIDMap, shortCandidateNameOverride, regionNameToIDMap, regionIDToLinkMap, heldRegionMap, shouldFilterOutDuplicateRows, addDecimalPadding, organizeMapDataFunction, viewingDataFunction, zoomingDataFunction, splitVoteDataFunction, splitVoteDisplayOptions, getFormattedRegionName, customOpenRegionLinkFunction, updateCustomMapFunction, convertMapDataRowToCSVFunction, isCustomMap, shouldClearDisabled, shouldShowVoteshare, voteshareCutoffMargin, overrideSVGPath, shouldSetDisabledWorthToZero, shouldUseOriginalMapDataForTotalsPieChart, shouldForcePopularVoteDisplay, customDefaultMargins, customVotesharePrefix, customVoteshareSuffix)
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
    this.isCompareMap = false
    this.shouldClearDisabled = shouldClearDisabled == null ? true : shouldClearDisabled
    this.shouldShowVoteshare = shouldShowVoteshare == null ? false : shouldShowVoteshare
    this.voteshareCutoffMargin = voteshareCutoffMargin
    this.overrideSVGPath = overrideSVGPath
    this.shouldSetDisabledWorthToZero = shouldSetDisabledWorthToZero == null ? false : true
    this.shouldUseOriginalMapDataForTotalsPieChart = shouldUseOriginalMapDataForTotalsPieChart == null ? false : shouldUseOriginalMapDataForTotalsPieChart
    this.shouldForcePopularVoteDisplay = shouldForcePopularVoteDisplay == null ? false : shouldForcePopularVoteDisplay
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
  // shouldForcePopularVoteDisplay
  // customDefaultMargins
  // customVotesharePrefix
  // customVoteshareSuffix

  async loadMap(reloadCache, onlyAttemptLocalFetch, resetCandidateNames)
  {
    reloadCache = reloadCache ? true : (this.dataURL ? !(await CSVDatabase.isSourceUpdated(this.id)) : false)
    resetCandidateNames = resetCandidateNames != null ? resetCandidateNames : true

    if ((this.rawMapData == null || reloadCache) && (this.dataURL || this.textMapData))
    {
      let textData
      if (this.dataURL)
      {
        textData = await this.loadMapCache(this, reloadCache, onlyAttemptLocalFetch)
      }
      else
      {
        textData = this.textMapData
      }
      if (textData == null) { return false }
      
      if (isString(this.dataURL) || this.dataURL.type == csvSourceType)
      {
        this.rawMapData = await this.convertCSVToArray(this, textData)
      }
      else if (this.dataURL.type == jsonSourceType && isString(textData) && !this.isCustomMap)
      {
        this.rawMapData = JSON.parse(textData)
      }
      else
      {
        this.rawMapData = textData
      }
    }

    if (this.rawMapData == null) { return false }

    this.mapDates = (isString(this.dataURL) || this.dataURL.type == csvSourceType) ? Object.keys(this.rawMapData) : [Date.now()]
    for (let dateNum in this.mapDates)
    {
      this.mapDates[dateNum] = parseInt(this.mapDates[dateNum])
    }
    this.mapDates.sort((mapDate1, mapDate2) => (mapDate1-mapDate2))

    let filterMapDataCallback = await this.executeFilter(this.rawMapData, this.mapDates, this)
    this.mapData = filterMapDataCallback.mapData
    
    if (this.mapData)
    {
      for (const mapDate in this.mapData)
      {
        this.setFlipData(this.mapData[mapDate])
      }
    }

    if (filterMapDataCallback.candidateNameData != null && resetCandidateNames)
    {
      if (this.candidateNameData != null)
      {
        for (let date in filterMapDataCallback.candidateNameData)
        {
          this.candidateNameData[date] = mergeObject(this.candidateNameData[date], filterMapDataCallback.candidateNameData[date])
        }
      }
      else
      {
        this.candidateNameData = filterMapDataCallback.candidateNameData
      }
    }
    for (let date in this.candidateNameData)
    {
      if (this.candidateNameData[date] == null) { continue }
      if (Object.keys(this.candidateNameData[date]).length == 0)
      {
        this.candidateNameData[date] = cloneObject(this.shortCandidateNameOverride)
      }
    }

    if (filterMapDataCallback.mapDates != null)
    {
      this.mapDates = filterMapDataCallback.mapDates
    }

    return true
  }
  
  setFlipData(mapDateData)
  {
    for (const regionID in mapDateData)
    {
      const regionData = mapDateData[regionID]
      
      const currentPartyID = regionData.partyID
      const previousPartyID = regionData.previousPartyID
      
      if (!currentPartyID)
      {
        continue
      }
      
      regionData.flip = regionData.flip
        ?? (
          regionData.flipOverride
          || (
            previousPartyID != null
            && previousPartyID != TossupParty.getID()
            && currentPartyID != previousPartyID
            && !politicalParties[currentPartyID].isDescendant(politicalParties[previousPartyID])
          )
        )
    }
  }
  
  async executeFilter(rawData, mapDates, self = this, ...args)
  {
    return await self.filterMapDataFunction(rawData, mapDates, self.columnMap, self.cycleYear, self.candidateNameToPartyIDMap, self.regionNameToIDMap, self.heldRegionMap, self.shouldFilterOutDuplicateRows, self.isCustomMap, self.voteshareCutoffMargin, !self.isCustomMap || self.editingMode == EditingMode.voteshare, ...args)
  }

  async loadMapCache(self, reloadCache, onlyAttemptLocalFetch)
  {
    self = self || this

    if (!reloadCache)
    {
      let savedCSVText = await CSVDatabase.fetchFile(this.id)
      if (savedCSVText != null)
      {
        return savedCSVText
      }
      else if (onlyAttemptLocalFetch)
      {
        return null
      }
    }

    let fetchMapDataPromise = new Promise((resolve) => {
      addLoader(LoaderType.progress, downloadIndicatorColor)
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
          removeLoader(LoaderType.progress)

          CSVDatabase.insertFile(self.id, data)
          resolve(data)
        },
        fail: () => {
          removeLoader(LoaderType.progress)

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

    removeLoader(LoaderType.progress)
  }

  convertCSVToArray(self, strData)
  {
    let csvTextSize = new Blob([strData]).size
    const chunkSize = 1*1024*1024
    let chunkPercentage = chunkSize/csvTextSize

    let shouldDisplayIndicator = chunkPercentage < 0.5

    shouldDisplayIndicator && addLoader(LoaderType.progress, csvParseIndicatorColor)

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

          shouldDisplayIndicator && removeLoader(LoaderType.progress)

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

    let mapIsClearExceptDisabled = true

    for (let mapDate in this.mapData)
    {
      for (let regionID in this.mapData[mapDate])
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
        for (let date in this.candidateNameData)
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

  async getViewingData(mapDateData)
  {
    const viewingData = await this.viewingDataFunction(mapDateData)
    this.setFlipData(viewingData)
    return viewingData
  }

  async getZoomingData(mapDateData, zoomRegion, date)
  {
    const zoomingData = await this.zoomingDataFunction(mapDateData, zoomRegion, false, date)
    this.setFlipData(zoomingData)
    return zoomingData
  }

  async getSplitVoteData(mapDateData)
  {
    const splitVoteData = await this.splitVoteDataFunction(mapDateData)
    this.setFlipData(splitVoteData)
    return splitVoteData
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

  getRegionLink(regionID, modelDate)
  {
    if (this.customOpenRegionLinkFunction == undefined)
    {
      if (!this.homepageURL) { return false }
      return this.homepageURL + (this.regionIDToLinkMap?.[regionID] ?? "")
    }
    else
    {
      return this.customOpenRegionLinkFunction(this.homepageURL, regionID, this.regionIDToLinkMap, modelDate, false, this.mapData)
    }
  }

  openRegionLink(regionID, modelDate, isCheck = false)
  {
    let linkData = this.getRegionLink(regionID, modelDate)
    
    let linkToOpen = null
    let linkIcon = null
    if (typeof linkData === 'object')
    {
      linkToOpen = linkData.link
      linkIcon = linkData.icon
    }
    else
    {
      linkToOpen = linkData
    }
    
    !isCheck && linkToOpen && window.open(linkToOpen)
    return !!linkToOpen ? (isCheck && linkIcon ? linkIcon : true) : false
  }

  openHomepageLink(modelDate, isCheck = false)
  {
    let linkToOpen = null
    if (this.customOpenRegionLinkFunction == undefined)
    {
      if (!this.homepageURL) { return }
      linkToOpen = this.homepageURL
    }
    else
    {
      linkToOpen = this.customOpenRegionLinkFunction(this.homepageURL, null, null, modelDate, true, this.mapData)
    }
    
    !isCheck && linkToOpen && window.open(linkToOpen)
    return linkToOpen != null
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
    if (isString(this.iconURL))
    {
      return this.iconURL
    }
    
    return null
  }

  setIconURL(newIconURL, self)
  {
    self = self || this
    this.iconURL = newIconURL
  }
  
  getIconOverlayText()
  {
    if (this.iconURL != null && this.iconURL.getOverlayText != null)
    {
      return this.iconURL.getOverlayText()
    }
    return null
  }

  hasHomepageURL()
  {
    return this.homepageURL != null
  }
  
  getCycleYear()
  {
    return this.cycleYear ?? allYearsCycle
  }

  getAddDecimalPadding(regionData)
  {
    const isFunction = (typeof this.addDecimalPadding === 'function')
    return isFunction ? this.addDecimalPadding(regionData) : this.addDecimalPadding
  }

  isCustom()
  {
    return this.isCustomMap
  }
  
  isCompare()
  {
    return this.isCompareMap
  }

  getShouldShowVoteshare(regionData)
  {
    const isFunction = (typeof this.shouldShowVoteshare === 'function')
    return this.editingMode == EditingMode.voteshare || (isFunction ? this.shouldShowVoteshare(regionData) : this.shouldShowVoteshare)
  }

  getOverrideSVGPath(mapDate)
  {
    let isFunction = (typeof this.overrideSVGPath === 'function')
    if (this.mapData == null) return isFunction ? null : this.overrideSVGPath

    let mapDates = Object.keys(this.mapData)
    let mapDateToUse = mapDate || mapDates[mapDates.length-1]
    return isFunction ? this.overrideSVGPath(mapDateToUse) : this.overrideSVGPath
  }

  getShouldSetDisabledWorthToZero()
  {
    return this.shouldSetDisabledWorthToZero
  }

  getShouldUseOriginalMapDataForTotalsPieChart()
  {
    return this.shouldUseOriginalMapDataForTotalsPieChart && !(currentViewingState == ViewingState.zooming && currentMapType.getMapSettingValue("zoomSeatTotals")) && !currentMapType.getMapSettingValue("showAllDistricts")
  }

  getShouldForcePopularVoteDisplay()
  {
    return this.shouldForcePopularVoteDisplay
  }
  
  getCustomDefaultMargins()
  {
    const isFunction = (typeof this.customDefaultMargins === 'function')
    return isFunction ? this.customDefaultMargins() : this.customDefaultMargins
  }
  
  getVotesharePrefix(regionData)
  {
    const isFunction = (typeof this.customVotesharePrefix === 'function')
    return (isFunction ? this.customVotesharePrefix(regionData) : this.customVotesharePrefix) ?? '+'
  }
  
  getVoteshareSuffix(regionData)
  {
    return this.getCustomVoteshareSuffix(regionData) ?? '%'
  }
  
  getCustomVoteshareSuffix(regionData)
  {
    const isFunction = (typeof this.customVoteshareSuffix === 'function')
    return isFunction ? this.customVoteshareSuffix(regionData) : this.customVoteshareSuffix
  }

  getDropdownPartyIDs()
  {
    return this.dropdownPartyIDs
  }

  setDropdownPartyIDs(partyIDs)
  {
    let dropdownPartyIDs = cloneObject(partyIDs)
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
    columnTitles.forEach((title, titleNum) => {
      csvText += title
      if (titleNum < columnTitles.length-1)
      {
        csvText += ","
      }
    })
    csvText += "\n"
    
    const partyIDToCandidateNames = invertObject(candidateNameToPartyIDs)

    for (let mapDate in mapData)
    {
      let mapDateObject = new Date(parseInt(mapDate))
      let mapDateString = (mapDateObject.getMonth()+1) + "/" + mapDateObject.getDate() + "/" + mapDateObject.getFullYear()
      for (let regionID in mapData[mapDate])
      {
        let regionData = mapData[mapDate][regionID]

        let candidatesToAdd = regionData.partyVotesharePercentages && this.editingMode == EditingMode.voteshare ? regionData.partyVotesharePercentages.reduce((candidateMap, partyPercentage) =>
        {
          return {...candidateMap, [getRegionCandidateName(partyPercentage.partyID, regionData, partyPercentage, partyIDToCandidateNames)]: partyPercentage.partyID}
        }, {}) : cloneObject(candidateNameToPartyIDs)

        if (regionData.partyID && regionData.partyID != TossupParty.getID() && !getKeyByValue(candidatesToAdd, regionData.partyID))
        {
          candidatesToAdd[getRegionCandidateName(regionData.partyID, regionData, null, partyIDToCandidateNames)] = regionData.partyID
        }

        if (regionData.margin == 0 && regionData.partyID == TossupParty.getID())
        {
          candidatesToAdd[IndependentGenericParty.getNames()[0]] = IndependentGenericParty.getID()
        }

        for (let candidateName in candidatesToAdd)
        {
          if (candidatesToAdd[candidateName] != regionData.partyID && regionData.margin != 0 && !regionData.partyVotesharePercentages) { continue }
          if (regionData.margin == 0 && regionData.partyID == TossupParty.getID() && candidatesToAdd[candidateName] != IndependentGenericParty.getID()) { continue }

          columnTitles.forEach((columnTitle, columnTitleNum) => {
            let columnKey = getKeyByValue(columnMap, columnTitle)
            csvText += convertMapDataRowToCSVFunction(columnKey, mapDateString, regionID, regionNameToID, candidateName, candidatesToAdd[candidateName], regionData, this.editingMode == EditingMode.voteshare)

            if (columnTitleNum < columnTitles.length-1)
            {
              csvText += ","
            }
          })

          csvText += "\n"
        }
      }
    }

    csvText = csvText.slice(0, -1)

    let rowCount = csvText.split("\n").length
    if (rowCount == 1)
    {
      let mapDates = []
      if (mapData)
      {
        mapDates = Object.keys(mapData)
      }
      let dateToUse = new Date()
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

let mainTwoPartyIDsToNames = {}
mainTwoPartyIDsToNames[DemocraticParty.getID()] = DemocraticParty.getNames()[0]
mainTwoPartyIDsToNames[RepublicanParty.getID()] = RepublicanParty.getNames()[0]

const NullMapSource = new MapSource(
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
