async function updateRegionBox(regionID = currentRegionID)
{
  let currentMapDataForDate = currentSliderDate && currentMapSource.getMapData() ? currentMapSource.getMapData()[currentSliderDate.getTime()] : null
  let canZoomCurrently = await currentMapSource.canZoom(currentMapDataForDate, regionID)

  let isDiscreteRegion = viewingDiscreteRegions()

  var regionData = regionID ? getRegionData(regionID).regionData : null

  if (
    regionID == null ||
    regionData == null ||
    regionData.partyID == null ||
    (
      regionData.partyID == TossupParty.getID() &&
      (
        !regionData.partyVotesharePercentages ||
        regionData.partyVotesharePercentages.reduce((s, p) => s+p.voteshare, 0) == 0
      ) &&
      !canZoomCurrently &&
      !editingRegionVotesharePercentages &&
      regionData.reportingPercent == null
    ) ||
    (
      regionData.disabled == true &&
      (
        currentEditingState != EditingState.editing ||
        !altKeyDown
      )
    ) ||
    (
      currentEditingState == EditingState.editing &&
      currentMapSource.getEditingMode() == EditingMode.margin &&
      !shiftKeyDown &&
      !altKeyDown &&
      !editingRegionMarginValue)
    )
  {
    $("#regionboxcontainer").trigger('hide')
    return
  }
  $("#regionboxcontainer").trigger('show')
  
  let showingAltData = false
  if (altKeyDown && regionData.altData)
  {
    regionData = regionData.altData
    showingAltData = true
  }

  var formattedRegionID = mapRegionIDToName[regionID] ?? regionID
  if (currentMapSource.getFormattedRegionName)
  {
    formattedRegionID = currentMapSource.getFormattedRegionName(formattedRegionID)
  }

  if (editingRegionEVs)
  {
    $("#regionbox").html(formattedRegionID + "<div style='height: 10px'></div>" + "EV: <input id='regionEV-text' class='textInput' style='float: none; position: inherit; font-size: 17px' type='text' oninput='applyRegionEVEdit(\"" + regionID + "\")' value='" + currentMapType.getEV(getCurrentDecade(), regionID, regionData) + "'>")
    $("#regionEV-text").focus().select()
    return
  }
  
  const shouldShowVotes = !(showingCompareMap && currentMapSource.isCompare())
  let voteshareSortedData = regionData.partyVotesharePercentages ? cloneObject(regionData.partyVotesharePercentages).sort((voteData1, voteData2) => voteData2.voteshare-voteData1.voteshare) : []
  var roundedMarginValue = shouldShowVotes && shiftKeyDown && voteshareSortedData.length >= 2 && voteshareSortedData.every(voteData => voteData.votes != null)
  ? addCommaFormatting(voteshareSortedData[0].votes-voteshareSortedData[1].votes)
  : getRoundedMarginValue(regionData.margin)
  
  var regionMarginString = getRegionCandidateName(regionData.partyID, regionData) + " " + currentMapSource.getVotesharePrefix()

  if (editingRegionMarginValue)
  {
    $("#regionbox").html(formattedRegionID + "<div style='height: 10px'></div>" + "<span style='color: " + politicalParties[regionData.partyID].getMarginColors().lean + ";'>" + regionMarginString + "<input id='regionMargin-text' class='textInput' style='float: none; position: inherit; font-size: 17px' type='text' oninput='applyRegionMarginValue(\"" + regionID + "\")' value='" + roundedMarginValue + "'></span>")
    $("#regionMargin-text").select()
    return
  }

  if (editingRegionVotesharePercentages)
  {
    let candidateDataToSelect = (selectedParty == null || selectedParty == TossupParty.getID()) ? regionData.partyVotesharePercentages[0] : regionData.partyVotesharePercentages.find(candidateData => candidateData.partyID == selectedParty.getID())
    if (!candidateDataToSelect && selectedParty)
    {
      regionData.partyVotesharePercentages.push({partyID: selectedParty.id, voteshare: 0.0})
      candidateDataToSelect = regionData.partyVotesharePercentages[regionData.partyVotesharePercentages.length-1]
    }

    let regionBoxHTML = formattedRegionID
    regionBoxHTML += "<div style='border-radius: 50px; color: white; font-size: 17px; line-height: 100%; margin-top: 5px; margin-bottom: 8px; display: block;'>"
    for (let candidateOn in regionData.partyVotesharePercentages)
    {
      let candidateData = regionData.partyVotesharePercentages[candidateOn]
      let candidateName = getRegionCandidateName(candidateData.partyID, regionData, candidateData)
      regionBoxHTML += "<div style='display: flex; justify-content: space-between; align-items: center; padding: 1px 4px; margin: 2px 0px; border-radius: " + (candidateOn == 0 ? "3px 3px" : "0px 0px") + (candidateOn == regionData.partyVotesharePercentages.length-1 ? " 3px 3px" : " 0px 0px") + "; background: " + getGradientCSS(politicalParties[candidateData.partyID].getMarginColors().safe, politicalParties[candidateData.partyID].getMarginColors().lean, candidateData.voteshare) + ";'><span style='margin-right: 5px;'>" + candidateName + "</span>"
      regionBoxHTML += "<span><input id='regionVoteshare-" + candidateName.replaceAll(/[\s\.]/g, "_") + "' class='textInput' style='float: none; position: inherit; min-width: 40px; max-height: 20px; font-size: 17px' type='text' oninput='applyRegionVotesharePercentage(this, \"" + regionID + "\")' onclick='this.select()' onselect='selectedVoteshareCandidate = $(this).data(\"candidate\")' value='" + candidateData.voteshare + "' data-candidate='" + candidateName + "'>" + currentMapSource.getVoteshareSuffix() + "</span>"
      regionBoxHTML += "</div>"
    }
    regionBoxHTML += "</div>"

    regionBoxHTML += "<div style='color: gray; font-size: 15px; font-style: italic'>"
    regionBoxHTML += "Click to save voteshare"
    regionBoxHTML += "</div>"
    regionBoxHTML += "<div style='padding-bottom: 3px;'></div>"

    $("#regionbox").html(regionBoxHTML)

    if (candidateDataToSelect)
    {
      $("#regionVoteshare-" + getRegionCandidateName(candidateDataToSelect.partyID, regionData).replaceAll(/[\s\.]/g, "_")).select()
    }

    return
  }

  regionMarginString += roundedMarginValue + (currentMapSource.getCustomVoteshareSuffix() ?? "")

  let regionBoxHTML = (currentEditingState == EditingState.viewing || (isDiscreteRegion && currentMapSource.getEditingMode() == EditingMode.margin)) ? regionMarginString : ""

  let tooltipsToShow = {
    shiftForVotes: [false, "<span class='shifttext'>Shift</span> to show votes"],
    altForAlternateData: [false, "<span class='alttext'>Alt</span> to show " + ((regionData.altData ?? regionData).altText ?? " alt race")],
    shiftClickToEditEVs: [false, "<span class='shifttext'>Shift</span> click to edit EVs"],
    clickToZoom: [false, "<span class='clicktext'>Click</span> to expand"],
    clickToOpenLink: [false, "<span class='clicktext'>Click</span> to open<img style='position: relative; left: 5px; top: 3px; height: 16px; width: 16px;' src='" + currentMapSource.getIconURL(true) + "'>"],
    rightClickToOpenLink: [false, "<span class=''>Right-click</span> to open<img style='position: relative; left: 5px; top: 3px; height: 16px; width: 16px;' src='" + currentMapSource.getIconURL(true) + "'>"],
    clickToEditVoteshare: [false, "<span class='clicktext>Click</span> to edit voteshare"],
    shiftClickToEditMargin: [false, "<span class='shifttext'>Shift</span> <span class='clicktext'>click</span> to edit margin"],
    altClickToFlip: [false, "<span class='alttext'>Alt</span> <span class='clicktext'>click</span> to flip"],
    altShiftClickToDisable: [false, "<span class='alttext'>Alt</span>+<span class='shifttext'>shift</span> <span class='clicktext'>click</span> to disable"]
  }

  if (currentEditingState == EditingState.viewing)
  {
    regionBoxHTML += "<br></span>"
  }
  else
  {
    regionBoxHTML += "</span>"
  }

  if (regionData.chanceChallenger && regionData.chanceIncumbent)
  {
    regionBoxHTML += "<span style='font-size: 17px; padding-top: 5px; padding-bottom: 5px; display: block; line-height: 100%;'>Chances<br>"
    regionBoxHTML += "<span style='color: " + politicalParties[incumbentChallengerPartyIDs.challenger].getMarginColors().lean + ";'>" // Hardcoding challenger first
    regionBoxHTML += decimalPadding(Math.round(regionData.chanceChallenger*1000)/10)
    regionBoxHTML += "%</span>&nbsp;&nbsp;&nbsp;<span style='color: " + politicalParties[incumbentChallengerPartyIDs.incumbent].getMarginColors().lean + ";'>"
    regionBoxHTML += decimalPadding(Math.round(regionData.chanceIncumbent*1000)/10)
    regionBoxHTML += currentMapSource.getVoteshareSuffix() + "</span></span>"
  }

  if (regionData.partyVotesharePercentages && regionData.partyVotesharePercentages.length > 0 && regionData.partyVotesharePercentages.every(candidateData => candidateData.winPercentage != null))
  {
    regionBoxHTML += "<span style='font-size: 17px; padding-top: 8px; padding-bottom: 1px; display: block; line-height: 100%;'>Probability<br></span>"

    let sortedPercentages = regionData.partyVotesharePercentages.sort((voteData1, voteData2) => voteData2.winPercentage-voteData1.winPercentage)
    let filteredSortedPercentages = []
    for (let voteData of sortedPercentages)
    {
      let existingVoteData = filteredSortedPercentages.find(existingVoteData => existingVoteData.partyID == voteData.partyID)
      if (!existingVoteData)
      {
        filteredSortedPercentages.push({...voteData})
      }
      else
      {
        existingVoteData.winPercentage += voteData.winPercentage
      }
    }

    let colorPercentages = []
    colorPercentages = filteredSortedPercentages.map(voteData => {
      return {color: politicalParties[voteData.partyID].getMarginColors().likely, percentage: voteData.winPercentage}
    })

    regionBoxHTML += "<div style='font-size: 17px; padding-top: 2px; padding-bottom: 5px; padding-right: 8px; display: block; line-height: 100%; border-radius: 50px;'>"
    regionBoxHTML += "<span class='regionbox-text-shadow' id='win-percentage-" + regionID + "' style='display: inline-block; padding: 4px; color: #fff; border-radius: 3px; " + "background: " + getGradientCSS(colorPercentages[0].color, (colorPercentages[1] ?? colorPercentages[0]).color, colorPercentages[0].percentage) + "; " + " width: 100%'>"
    regionBoxHTML += "<span style='float: left;'>" + decimalPadding(Math.round(filteredSortedPercentages[0].winPercentage*10)/10, 1) + currentMapSource.getVoteshareSuffix() + "</span>"
    if (filteredSortedPercentages[1])
    {
      regionBoxHTML += "<span style='float: right;'>" + decimalPadding(Math.round(filteredSortedPercentages[1].winPercentage*10)/10, 1) + currentMapSource.getVoteshareSuffix() + "</span>"
    }
    regionBoxHTML += "</span>"
    regionBoxHTML += "</div>"
  }

  if (regionData.partyVotesharePercentages && currentMapSource.getShouldShowVoteshare() == true)
  {
    let sortedPercentages
    if (regionData.partyVotesharePercentages?.[0]?.order != null)
    {
      sortedPercentages = regionData.partyVotesharePercentages.sort((voteData1, voteData2) => {
        return voteData1.order - voteData2.order
      })
    }
    else
    {
      sortedPercentages = regionData.partyVotesharePercentages.sort((voteData1, voteData2) => {
        return voteData2.voteshare - voteData1.voteshare
      })
    }

    if (currentEditingState == EditingState.viewing)
    {
      regionBoxHTML += "<span style='font-size: 17px; padding-top: 5px; padding-bottom: 1px; display: block; line-height: 100%;'>Voteshare<br></span>"
    }

    regionBoxHTML += "<div style='font-size: 17px; padding-top: 2px; padding-bottom: 5px; padding-right: 8px; display: block; line-height: 100%; border-radius: 50px;'>"

    let hasVoteCountsForAll = shouldShowVotes

    sortedPercentages.forEach((voteData, i) => {
      const roundedVoteshare = Math.round(voteData.voteshare*100)/100
      if (roundedVoteshare <= 0 && !currentMapSource.isCustom() && regionData.reportingPercent == null) { return }
      
      const candidateName = getRegionCandidateName(voteData.partyID, regionData, voteData)
      
      regionBoxHTML += "<span class='regionbox-text-shadow' id='voteshare-" + (voteData.partyID + "-" + candidateName.replaceAll(/[\s\.]/g, "_")) + "' style='display: inline-block; padding: 4px; color: #fff; border-radius: " + (i == 0 ? "3px 3px" : "0px 0px") + " " + (i == sortedPercentages.length-1 ? "3px 3px" : "0px 0px") + "; " + "background: " + getGradientCSS(politicalParties[voteData.partyID].getMarginColors().safe, politicalParties[voteData.partyID].getMarginColors().lean, (showingCompareMap && currentMapSource.isCustom() ? 50 : 0) + voteData.voteshare) + "; " + " width: 100%'><span style='float: left;'>" + candidateName + "</span><span style='float: right;'>"
      regionBoxHTML += shiftKeyDown && shouldShowVotes && voteData.votes != null ? addCommaFormatting(voteData.votes) : (showingCompareMap && currentMapSource.isCustom() && voteData.voteshare > 0.0 ? "+" : "") + decimalPadding(roundedVoteshare, 2) + currentMapSource.getVoteshareSuffix()
      regionBoxHTML += "</span></span><br>"

      hasVoteCountsForAll = hasVoteCountsForAll && voteData.votes != null
    })

    tooltipsToShow.shiftForVotes[0] = hasVoteCountsForAll

    regionBoxHTML += "</div>"
  }

  let splitVoteDisplayOptions = currentMapSource.getSplitVoteDisplayOptions()

  if (regionData.voteSplits && regionData.voteSplits.length > 0 && ((canZoomCurrently && splitVoteDisplayOptions.showSplitVotesOnCanZoom) || currentViewingState == ViewingState.splitVote))
  {
    let voteSplitDataToDisplay = regionData.voteSplits
    regionBoxHTML = "</span>"
    
    regionBoxHTML += "<div style='margin-top: 6px; margin-bottom: 6px; font-size: 17px; padding-top: 2px; padding-bottom: 5px; padding-right: 8px; display: block; line-height: 100%; border-radius: 50px;'>"
    
    const totalVotes = voteSplitDataToDisplay.reduce((agg, curr) => agg+curr.votes, 0)
    
    voteSplitDataToDisplay.forEach((candidateSplitVoteData, i) => {
      const candidateName = getRegionCandidateName(candidateSplitVoteData.partyID, regionData, candidateSplitVoteData)
      
      regionBoxHTML += "<span class='regionbox-text-shadow' id='votesplit-" + (candidateSplitVoteData.partyID + "-" + candidateName.replaceAll(/[\s\.]/g, "_")) + "' style='display: inline-block; padding: 4px; color: #fff; border-radius: " + (i == 0 ? "3px 3px" : "0px 0px") + " " + (i == voteSplitDataToDisplay.length-1 ? "3px 3px" : "0px 0px") + "; " + "background: " + getGradientCSS(politicalParties[candidateSplitVoteData.partyID].getMarginColors().safe, politicalParties[candidateSplitVoteData.partyID].getMarginColors().lean, candidateSplitVoteData.votes/totalVotes*100) + "; " + " width: 100%'><span style='float: left;'>" + candidateName + "</span><span style='float: right;'>"
      regionBoxHTML += candidateSplitVoteData.votes
      regionBoxHTML += "</span></span><br>"
    })
    
    regionBoxHTML += "</div>"
  }

  if (regionData.voteSplits && regionData.voteSplits.length > 0 && canZoomCurrently && splitVoteDisplayOptions.showSplitVoteBoxes && currentSliderDate && currentMapSource.getMapData())
  {
    var zoomingData = await currentMapSource.getZoomingData(currentMapDataForDate, currentRegionID)
    if (zoomingData)
    {
      const districtsPerLine = 4

      Object.keys(zoomingData).filter(districtID => !districtID.endsWith(subregionSeparator + statePopularVoteDistrictID)).forEach((districtID, i, districtIDs) => {
        if (i % districtsPerLine == 0 && i != 0)
        {
          regionBoxHTML += "</div>"
        }
        if (i % districtsPerLine == 0)
        {
          var isLastDistrictLine = (i+((districtIDs.length-1) % districtsPerLine)) == districtIDs.length-1
          regionBoxHTML += "<div style='display: flex; justify-content: center; align-items: center; " + (isLastDistrictLine ? "margin-bottom: 6px" : "margin-bottom: 6px") + "; gap: 6px;'>"
        }

        var districtNumber = districtID.split(subregionSeparator)[1]
        var marginIndex = getMarginIndexForValue(zoomingData[districtID].margin, zoomingData[districtID].partyID)
        var marginColor = politicalParties[zoomingData[districtID].partyID].getMarginColors()[marginIndex]

        regionBoxHTML += "<div style='border-radius: 2px; border: solid " + (zoomingData[districtID].flip ? "gold 3px; width: 20px; height: 20px;" : "gray 1px; width: 24px; height: 24px;") + " background-color: " + marginColor + "; display: flex; justify-content: center; align-items: center;'><span class='regionbox-text-shadow' style='margin-bottom: 2px; margin-left: 1px; font-size: 16px;'>" + (districtNumber == 0 ? "AL" : zeroPadding(districtNumber)) + "</span></div>"
      })
    }
    regionBoxHTML += "</div>"
  }
  
  if (regionData.reportingPercent != null)
  {
    regionBoxHTML += "<div style='color: gray; font-size: 16px; margin-top: -5px; margin-bottom: 5px'>" + regionData.reportingPercent + "% reporting" + "</div>"
  }
  
  const canOpenLink = currentEditingState == EditingState.viewing && currentMapSource.openRegionLink(regionID, currentSliderDate, true)
  
  tooltipsToShow.altForAlternateData[0] = regionData.altData || showingAltData
  tooltipsToShow.shiftClickToEditEVs[0] = isDiscreteRegion && currentMapType.getID() == USAPresidentMapType.getID() && currentMapSource.isCustom() && currentEditingState == EditingState.viewing && currentViewingState == ViewingState.viewing
  tooltipsToShow.clickToZoom[0] = canZoomCurrently && currentViewingState == ViewingState.viewing
  tooltipsToShow.clickToOpenLink[0] = openLinksWithLeftClick && canOpenLink && !tooltipsToShow.clickToZoom[0]
  tooltipsToShow.rightClickToOpenLink[0] = canOpenLink && (tooltipsToShow.clickToZoom[0] || !openLinksWithLeftClick)
  tooltipsToShow.clickToEditVoteshare[0] = isDiscreteRegion && currentEditingState == EditingState.editing && currentMapSource.getEditingMode() == EditingMode.voteshare
  tooltipsToShow.shiftClickToEditMargin[0] = isDiscreteRegion && currentEditingState == EditingState.editing && currentMapSource.getEditingMode() == EditingMode.margin && !regionData.disabled
  tooltipsToShow.altClickToFlip[0] = isDiscreteRegion && currentEditingState == EditingState.editing
  tooltipsToShow.altShiftClickToDisable[0] = isDiscreteRegion && currentEditingState == EditingState.editing

  let isShowingSomeTooltip = false
  Object.keys(tooltipsToShow).forEach((tooltipID) => {
    if (tooltipsToShow[tooltipID][0])
    {
      regionBoxHTML += "<div style='color: gray; font-size: 15px; font-style: italic'>"
      regionBoxHTML += tooltipsToShow[tooltipID][1]
      regionBoxHTML += "</div>"
  
      isShowingSomeTooltip = true
    }
  })
  if (isShowingSomeTooltip)
  {
    regionBoxHTML += "<div style='padding-bottom: 3px;'></div>"
  }

  $("#regionbox").html(formattedRegionID + "<br>" + "<span style='color: " + politicalParties[regionData.partyID].getMarginColors().lean + ";'>" + regionBoxHTML + "</span>")

  updateRegionBoxYPosition()
  
  if (shiftKeyDown)
  {
    $(".shifttext").css('font-weight', 'bold').css('color', '#D8D8D8')
  }
  if (altKeyDown)
  {
    $(".alttext").css('font-weight', 'bold').css('color', '#D8D8D8')
  }
  if (mouseIsDown)
  {
    $(".clicktext").css('font-weight', 'bold').css('color', '#D8D8D8')
  }
}

function updateRegionBoxPosition(mouseX, mouseY)
{
  let newRegionBoxXPos = mouseX+5
  newRegionBoxXPos = correctOverflow(newRegionBoxXPos, $("#regionboxcontainer").width(), $(document).width())
  
  $("#regionboxcontainer").css("left", newRegionBoxXPos)
  updateRegionBoxYPosition(mouseY)
}

function updateRegionBoxYPosition(mouseY)
{
  var newRegionBoxYPos = (mouseY+5) || (currentMouseY+5)
  if (!newRegionBoxYPos) { return }

  newRegionBoxYPos = correctOverflow(newRegionBoxYPos, $("#regionboxcontainer").height(), $(document).height())
  $("#regionboxcontainer").css("top", newRegionBoxYPos)
}

function getRoundedMarginValue(fullMarginValue)
{
  let roundedMarginValue = roundValueToPlace(fullMarginValue, 2)
  return currentMapSource.getAddDecimalPadding() ? decimalPadding(roundedMarginValue) : roundedMarginValue
}

function getGradientCSS(fillColor, backgroundColor, fillPercentage, backgroundPercentage = 0)
{
  return "linear-gradient(90deg, " + fillColor + " " + fillPercentage + "%, " + backgroundColor + " " + backgroundPercentage + "%)"
}

function applyRegionEVEdit(regionID)
{
  var regionData = getRegionData(regionID).regionData

  var shouldRefreshEV = false

  var newEV = parseInt($("#regionEV-text").val())
  if ($("#regionEV-text").val() == "")
  {
    delete overrideRegionEVs[regionID]
    shouldRefreshEV = true
  }

  var currentEV = currentMapType.getEV(getCurrentDecade(), regionID, regionData)
  if (!isNaN(newEV) && newEV > 0 && newEV != currentEV)
  {
    overrideRegionEVs[regionID] = newEV
    shouldRefreshEV = true

    $("#regionEV-text").val(newEV)
  }
  else if ($("#regionEV-text").val() != currentEV)
  {
    $("#regionEV-text").val(currentEV)
    $("#regionEV-text").select()
  }

  if (shouldRefreshEV)
  {
    updateMapElectoralVoteText()
    displayPartyTotals()
    updateTotalsPieChart()
  }
}

function toggleRegionMarginEditing()
{
  editingRegionMarginValue = !editingRegionMarginValue

  if (editingRegionMarginValue)
  {
    updateRegionBox()
  }
  else
  {
    $("#regionboxcontainer").trigger('hide')
  }
}

function applyRegionMarginValue(regionID)
{
  var regionDataCallback = getRegionData(regionID)
  var regionIDsToFill = regionDataCallback.linkedRegionIDs
  var regionData = regionDataCallback.regionData

  var newMarginString = $("#regionMargin-text").val()
  var newMargin = parseFloat(newMarginString)
  if (newMarginString == "")
  {
    newMargin = 1
  }
  var newMarginIsValid = /^\d+\.?\d*e?[+-]?\d*$/.test(newMarginString) && !isNaN(newMargin) && newMargin >= 0

  var currentMargin = getRoundedMarginValue(regionData.margin)
  if (newMarginIsValid && newMargin != currentMargin)
  {
    regionData.margin = newMargin

    updateRegionFillColors(regionIDsToFill, regionData, false)
    displayPartyTotals()
    updateTotalsPieChart()
  }
  else if (!newMarginIsValid)
  {
    $("#regionMargin-text").val(currentMargin)
    $("#regionMargin-text").select()
  }
}

function toggleRegionVoteshareEditing(regionID, regionData)
{
  if (editingRegionVotesharePercentages)
  {
    closeRegionVoteshareEditing(voteshareEditRegion)
  }

  let baseRegionID = getBaseRegionID(regionID).baseID
  editingRegionVotesharePercentages = !editingRegionVotesharePercentages || (voteshareEditRegion != baseRegionID && regionData.partyVotesharePercentages)

  if (regionData && (!regionData.partyVotesharePercentages || regionData.partyVotesharePercentages.length == 0))
  {
    regionData.partyVotesharePercentages = [{partyID: IndependentGenericParty.getID(), voteshare: 0.0}]
  }
  regionData && regionData.partyVotesharePercentages.sort((voteshareData1, voteshareData2) => voteshareData2.voteshare-voteshareData1.voteshare)

  if (editingRegionVotesharePercentages)
  {
    if (regionData)
    {
      for (let partyID of dropdownPoliticalPartyIDs)
      {
        if (!regionData.partyVotesharePercentages.some(cand => cand.partyID == partyID))
        {
          regionData.partyVotesharePercentages.push({partyID: partyID, voteshare: 0.0})
        }
      }
    }

    voteshareEditRegion = baseRegionID
    updateRegionBoxPosition(currentMouseX, currentMouseY)
    updateRegionBox()
  }
  else
  {
    updateRegionBox(regionID)
  }
}

function applyRegionVotesharePercentage(textBoxDiv, regionID)
{
  let regionDataCallback = getRegionData(regionID)
  let regionIDsToFill = regionDataCallback.linkedRegionIDs
  let regionData = regionDataCallback.regionData

  let newVoteshareString = $(textBoxDiv).val()
  let newVoteshare = newVoteshareString != "" ? parseFloat(newVoteshareString) : 0
  let newVoteshareIsValid = /^\d+\.?\d*e?[+-]?\d*$/.test(newVoteshareString) && !isNaN(newVoteshare) && newVoteshare >= 0 && newVoteshare <= 100

  let currentVoteshareData = regionData.partyVotesharePercentages.find(voteshareData => getRegionCandidateName(voteshareData.partyID, regionData, voteshareData) == $(textBoxDiv).data("candidate"))
  if (newVoteshareIsValid && newVoteshare != currentVoteshareData.voteshare)
  {
    currentVoteshareData.voteshare = newVoteshare

    let partyVotesharePercentages = regionData.partyVotesharePercentages.concat()
    partyVotesharePercentages.sort((voteshareData1, voteshareData2) => voteshareData2.voteshare-voteshareData1.voteshare)
    regionData.margin = partyVotesharePercentages.length < 2 ? partyVotesharePercentages[0].voteshare : partyVotesharePercentages[0].voteshare-partyVotesharePercentages[1].voteshare
    regionData.partyID = partyVotesharePercentages.some(voteshareData => voteshareData.voteshare != 0) ? partyVotesharePercentages[0].partyID : TossupParty.getID()

    $(textBoxDiv).parent().parent().css("background", getGradientCSS(politicalParties[currentVoteshareData.partyID].getMarginColors().safe, politicalParties[currentVoteshareData.partyID].getMarginColors().lean, currentVoteshareData.voteshare))

    updateRegionFillColors(regionIDsToFill, regionData, false)
    displayPartyTotals()
    updateTotalsPieChart()
  }
  else if (!newVoteshareIsValid)
  {
    $(textBoxDiv).val(currentVoteshareData.voteshare)
    $(textBoxDiv).select()
  }
}

function cycleSelectedRegionVoteshare(directionToCycle)
{
  let regionData = getRegionData(voteshareEditRegion).regionData
  let voteshareIndex = regionData.partyVotesharePercentages.findIndex(voteshareData => getRegionCandidateName(voteshareData.partyID, regionData, voteshareData) == selectedVoteshareCandidate)

  voteshareIndex += directionToCycle
  if (voteshareIndex < 0)
  {
    voteshareIndex = regionData.partyVotesharePercentages.length-1
  }
  else if (voteshareIndex > regionData.partyVotesharePercentages.length-1)
  {
    voteshareIndex = 0
  }
  
  const selectedVoteshareData = regionData.partyVotesharePercentages[voteshareIndex]
  const selectedVoteshareDataCandidate = getRegionCandidateName(selectedVoteshareData.partyID, regionData, selectedVoteshareData)

  $("#regionVoteshare-" + selectedVoteshareDataCandidate.replaceAll(/[\s\.]/g, "_")).select()
}

function closeRegionVoteshareEditing(regionID)
{
  if (!regionID) { return }
  let previousRegionData = getRegionData(regionID).regionData
  previousRegionData.partyVotesharePercentages = previousRegionData.partyVotesharePercentages.filter(candidateData => candidateData.voteshare > 0.0)
}

function getRegionCandidateName(partyID, regionData, voteshareData, partyIDToCandidateNames)
{
  // national races are always one-to-one with candidate & party (for major candidates)
  // non-national races could have multiple candidates per party
  //   however, margin (editing) requires only one candidate per party
  
  // regionData.candidateName: only for winners + non-national
  // voteshareData.candidate: only for non-national + voteshare
  // regionData.candidateMap: only for margin
  // MapSource.getCandidateNames: only for national (but could be used by non-national)
  // PoliticalParty.getNames: fallback for non-national
  
  return (voteshareData != null ? voteshareData.candidate : (regionData.partyID == partyID ? regionData.candidateName : null))
    ?? regionData.candidateMap?.[partyID]
    ?? partyIDToCandidateNames?.[partyID]
    ?? (compareResultCustomMapSource != null && currentMapSource.isCompare() ? compareResultCustomMapSource : currentMapSource).getCandidateNames(getCurrentDateOrToday())[partyID]
    ?? politicalParties[partyID].getNames()[0]
}