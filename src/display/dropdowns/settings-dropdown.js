function createSettingsDropdownItems()
{
  $("#settingsButton").removeClass('active')
  $("#settingsDropdownContainer").html("")

  let didBeginGlobalSettings = false
  for (let settingNum in currentMapType.getMapSettingsLayout())
  {
    let settingLayout = currentMapType.getMapSettingsLayout()[settingNum]
    if (!didBeginGlobalSettings && globalMapSettings.some(setting => setting.id == settingLayout.id))
    {
      $("#settingsDropdownContainer").append("<div class='dropdown-separator-big'></div>")

      didBeginGlobalSettings = true
    }
    $("#settingsDropdownContainer").append("<div class='dropdown-separator'></div>")
    switch (settingLayout.type)
    {
      case MapSettingType.optionCycle:
      $("#settingsDropdownContainer").append("<a id=" + settingLayout.id + " style='min-width: 270rem; display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 15px;' onclick='cycleMapSetting(\"" + settingLayout.id + "\", this, 1)' oncontextmenu='cycleMapSetting(\"" + settingLayout.id + "\", this, -1); return false'></a>")
      cycleMapSetting(settingLayout.id, $("#" + settingLayout.id), 0)
      break
    }
  }
}

function cycleMapSetting(settingID, settingDiv, incrementAmount)
{
  let currentMapSettings = currentMapType.getMapSettings()
  let settingsLayout = currentMapType.getMapSettingLayout(settingID)
  let settingOptions = currentMapType.getMapSettingOptions(settingID)
  let currentValueID = currentMapSettings[settingID]

  let optionIndex = 0
  for (let optionNum in settingOptions)
  {
    if (settingOptions[optionNum].id == currentValueID)
    {
      optionIndex = parseInt(optionNum)
      break
    }
  }

  optionIndex += incrementAmount == null ? 1 : incrementAmount
  if (optionIndex >= settingOptions.length)
  {
    optionIndex = 0
  }
  else if (optionIndex < 0)
  {
    optionIndex = settingOptions.length-1
  }

  let newValueID = settingOptions[optionIndex].id
  let newValueTitle = settingOptions[optionIndex].title
  $(settingDiv).html("<span>" + settingsLayout.title + "</span><span>" + newValueTitle + "</span>")

  if (settingsLayout.shouldShowActive != null)
  {
    let showActive = settingsLayout.shouldShowActive(settingOptions[optionIndex].value)
    if (showActive)
    {
      $(settingDiv).addClass("active")
      $("#settingsButton").addClass("active")
    }
    else
    {
      $(settingDiv).removeClass("active")
      if ($(settingDiv).parent().find(".active").length == 0)
      {
        $("#settingsButton").removeClass("active")
      }
    }
  }

  currentMapSettings[settingID] = newValueID
  currentMapType.setMapSettings(currentMapSettings)

  switch (settingsLayout.reloadType)
  {
    case MapSettingReloadType.display:
    if (showingDataMap)
    {
      displayDataMap()
    }
    break

    case MapSettingReloadType.data:
    if (showingDataMap)
    {
      loadDataMap()
    }
    break

    case MapSettingReloadType.custom:
    if (settingsLayout.customReloadFunction)
    {
      settingsLayout.customReloadFunction(settingOptions[optionIndex].value)
    }
    break
  }
}

function toggleMapSettingDisable(settingID, disableOverride)
{
  if (($("#" + settingID).hasClass("topnavdisable") && disableOverride == null) || (disableOverride != null && disableOverride == false))
  {
    $("#" + settingID).removeClass("topnavdisable")
  }
  else
  {
    $("#" + settingID).addClass("topnavdisable")
  }
}
