var isEnteringShiftAmount = false

async function addConstantMarginToMap(baseMarginToAdd, partyToShift, partyToTake, shouldShiftNPV = true)
{
  if (!baseMarginToAdd) { return }
  partyToShift = partyToShift || selectedParty
  if (partyToShift.getID() == TossupParty.getID()) { return }

  if (currentEditingState != EditingState.editing || partyToShift == null || partyToShift.getID() == TossupParty.getID()) { return }

  for (var regionID in displayRegionDataArray)
  {
    let marginToAdd = baseMarginToAdd
    
    if ((regionID == nationalPopularVoteID && !shouldShiftNPV) || regionID.endsWith(subregionSeparator + statePopularVoteDistrictID)) { continue }

    if (displayRegionDataArray[regionID].disabled) { continue }

    let regionData = displayRegionDataArray[regionID]

    if (regionData.partyVotesharePercentages)
    {
      marginToAdd /= 2
      
      let candidateDataToIncreaseMargin = regionData.partyVotesharePercentages.find(candidateData => candidateData.partyID == partyToShift.getID())
      if (!candidateDataToIncreaseMargin)
      {
        candidateDataToIncreaseMargin = {partyID: partyToShift.getID(), voteshare: 0}

        regionData.partyVotesharePercentages.push(candidateDataToIncreaseMargin)
      }

      if (partyToTake)
      {
        let candidateDataToDecreaseMargin = regionData.partyVotesharePercentages.find(candidateData => candidateData.partyID == partyToTake.getID())
        if (candidateDataToDecreaseMargin)
        {
          candidateDataToDecreaseMargin.voteshare = Math.max(candidateDataToDecreaseMargin.voteshare-marginToAdd, 0)
        }
      }
      else
      {
        for (let candidateData of regionData.partyVotesharePercentages)
        {
          if (getRegionCandidateName(candidateData.partyID, regionData, candidateData) == getRegionCandidateName(candidateDataToIncreaseMargin.partyID, regionData, candidateDataToIncreaseMargin)) { continue }

          candidateData.voteshare -= marginToAdd*candidateData.voteshare/(100.0-candidateDataToIncreaseMargin.voteshare)
          if (candidateData.voteshare < 0)
          {
            candidateData.voteshare = 0
          }
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
          regionData.flip = false
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
  await loadDataMap(null, null, null, null, false)
  
  updateShiftDropdownText()
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
  var checkedStates = [nationalPopularVoteID]
  while (greatestEVCount >= majorityEVCount)
  {
    var nextClosestState = Object.values(displayRegionDataArray).reduce((min, state) => {
      return (!state.disabled && min.disabled) || (state.margin < min.margin && state.partyID == winnerPartyID && !checkedStates.includes(state.region)) ? state : min
    })
    if (nextClosestState.disabled) return nextClosestState
    
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

function getSortedPoliticalPartyIDs()
{
  const partyTotals = getPartyTotals()
  const sortedParties = Object.keys(partyTotals)
  sortedParties.sort((p1, p2) => partyTotals[p2] - partyTotals[p1])
  return sortedParties
}

function getTippingPointShift()
{
  let shiftMargin = getTippingPointRegion().margin ?? 0
  const sortedParties = getSortedPoliticalPartyIDs()
  
  return [shiftMargin, politicalParties[sortedParties[1]], politicalParties[sortedParties[0]]]
}

function getNPVShift()
{
  if (!displayRegionDataArray[nationalPopularVoteID]) return
  let npvData = displayRegionDataArray[nationalPopularVoteID]
  
  let npvLeader = politicalParties[npvData.partyID]
  let npvRunnerUp
  let shiftMargin
  
  if (currentEditingMode == EditingMode.voteshare)
  {
    shiftMargin = npvData.margin
    npvData.partyVotesharePercentages.sort((cand1, cand2) => cand2.voteshare-cand1.voteshare)
    npvRunnerUp = politicalParties[npvData.partyVotesharePercentages[1].partyID]
  }
  else
  {
    shiftMargin = npvData.margin
    const sortedParties = getSortedPoliticalPartyIDs()
    npvRunnerUp = politicalParties[sortedParties[0] == npvLeader.getID() ? sortedParties[1] : sortedParties[0]]
  }
  
  return [shiftMargin, npvRunnerUp, npvLeader, true]
}

function updateShiftDropdownText()
{
  let shiftTippingPoint = getTippingPointShift()
  $('#shiftTextTippingPoint').html(`+${decimalPadding(roundValue(shiftTippingPoint[0], 1), 1)}`)
  $('#shiftTextTippingPoint').css('color', shiftTippingPoint[1].getMarginColors().likely)
  
  let npvTippingPoint = getNPVShift()
  $('#shiftTextNPV').html(`+${decimalPadding(roundValue(npvTippingPoint[0], 1))}`)
  $('#shiftTextNPV').css('color', npvTippingPoint[1].getMarginColors().likely)
}