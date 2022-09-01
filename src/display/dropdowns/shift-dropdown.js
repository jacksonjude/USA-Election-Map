var isEnteringShiftAmount = false

function addConstantMarginToMap(marginToAdd, partyToShift)
{
  if (!marginToAdd) { return }
  var partyToShift = partyToShift || selectedParty
  if (partyToShift.getID() == TossupParty.getID()) { return }

  if (currentEditingState != EditingState.editing || partyToShift == null || partyToShift.getID() == TossupParty.getID()) { return }

  for (var regionID in displayRegionDataArray)
  {
    if (regionID == nationalPopularVoteID || regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) { continue }

    if (displayRegionDataArray[regionID].disabled) { continue }

    let regionData = displayRegionDataArray[regionID]

    if (regionData.partyVotesharePercentages)
    {
      let candidateDataToIncreaseMargin = regionData.partyVotesharePercentages.find(candidateData => candidateData.partyID == partyToShift.getID())
      if (!candidateDataToIncreaseMargin)
      {
        let candidateNames = currentMapSource.getCandidateNames(currentSliderDate.getTime())
        let candidateNameToUse
        if (candidateNames)
        {
          candidateNameToUse = candidateNames[partyToShift.getID()]
        }
        else
        {
          candidateNameToUse = partyToShift.getNames()[0]
        }

        candidateDataToIncreaseMargin = {candidate: candidateNameToUse, partyID: partyToShift.getID(), voteshare: 0}

        regionData.partyVotesharePercentages.push(candidateDataToIncreaseMargin)
      }

      for (let candidateData of regionData.partyVotesharePercentages)
      {
        if (candidateData.candidate == candidateDataToIncreaseMargin.candidate) { continue }

        candidateData.voteshare -= marginToAdd*candidateData.voteshare/(100.0-candidateDataToIncreaseMargin.voteshare)
        if (candidateData.voteshare < 0)
        {
          candidateData.voteshare = 0
        }
      }

      candidateDataToIncreaseMargin.voteshare += marginToAdd
    }
    else
    {
      if (regionData.partyID != partyToShift.getID())
      {
        regionData.margin -= marginToAdd

        if (regionData.margin < 0)
        {
          regionData.margin *= -1
          regionData.partyID = partyToShift.getID()
        }
      }
      else
      {
        regionData.margin += marginToAdd
      }

      if (regionData.margin > 100)
      {
        regionData.margin = 100
      }
    }
  }

  currentCustomMapSource.updateMapData(displayRegionDataArray, getCurrentDateOrToday(), false)
  loadDataMap(null, null, null, null, false)
}

function getTippingPointRegion()
{
  var partyTotals = getPartyTotals()
  partyTotals[TossupParty.getID()] = 0

  var greatestEVCount = Math.max.apply(null, Object.values(partyTotals))
  var majorityEVCount = Math.floor(getCurrentTotalEV()/2)+1

  if (Math.max.apply(null, Object.values(partyTotals)) < majorityEVCount) // If candidate with most EVs is less than 1/2 +1 of total, return 0
  {
    return 0
  }

  var winnerPartyID = getKeyByValue(partyTotals, greatestEVCount)
  var tippingPointRegion
  var checkedStates = []
  while (greatestEVCount >= majorityEVCount)
  {
    var nextClosestState = Object.values(displayRegionDataArray).reduce((min, state) => {
      return (state.margin < min.margin && state.partyID == winnerPartyID && !checkedStates.includes(state.region)) ? state : min
    })
    tippingPointRegion = nextClosestState
    greatestEVCount -= currentMapType.getEV(getCurrentDecade(), nextClosestState.region, displayRegionDataArray[nextClosestState.region], currentMapSource.getShouldSetDisabledWorthToZero(), currentMapSource.isCustom())
    checkedStates.push(nextClosestState.region)
  }

  return tippingPointRegion
}

function getCurrentTotalEV()
{
  var totalEV = 0
  for (var regionID in displayRegionDataArray)
  {
    if (regionID == nationalPopularVoteID || regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) { continue }
    totalEV += currentMapType.getEV(getCurrentDecade(), regionID, displayRegionDataArray[regionID])
  }
  return totalEV
}

function toggleEnteringShiftAmount()
{
  if (!isEnteringShiftAmount && !selectedParty) { return }

  isEnteringShiftAmount = !isEnteringShiftAmount

  if (isEnteringShiftAmount)
  {
    $("#shift-other").html("<span style='float: left'>Shift All by </span><span style='font-family: \"Bree5erif-Mono\"'><input class='textInput' type='text' id='shift-other-text' value='0.0'></span>")
    $("#shift-other-text").focus()

    $("#shiftButton").addClass('active')
  }
  else
  {
    var amountToShift = parseFloat($("#shift-other-text").val())
    if (amountToShift)
    {
      addConstantMarginToMap(amountToShift)
    }

    $("#shift-other").html("Shift All by other")
    $("#shiftButton").removeClass('active')
  }
}
