function createSettingsDropdownItems()
{
  $("#settingsDropdownContainer").html("")

  var didBeginGlobalSettings = false
  for (var settingNum in currentMapType.getMapSettingsLayout())
  {
    var settingLayout = currentMapType.getMapSettingsLayout()[settingNum]
    if (!didBeginGlobalSettings && globalMapSettings.some(setting => setting.id == settingLayout.id))
    {
      $("#settingsDropdownContainer").append("<div class='dropdown-separator'></div>")
      $("#settingsDropdownContainer").append("<div class='dropdown-separator'></div>")
      $("#settingsDropdownContainer").append("<div class='dropdown-separator'></div>")

      didBeginGlobalSettings = true
    }
    $("#settingsDropdownContainer").append("<div class='dropdown-separator'></div>")
    switch (settingLayout.type)
    {
      case MapSettingType.optionCycle:
      $("#settingsDropdownContainer").append("<a id=" + settingLayout.id + " style='padding-top: 14px; min-height: 25px;' onclick='cycleMapSetting(\"" + settingLayout.id + "\", this, 1)' oncontextmenu='cycleMapSetting(\"" + settingLayout.id + "\", this, -1); return false'></a>")
      cycleMapSetting(settingLayout.id, $("#" + settingLayout.id), 0)
      break
    }
  }
}

function cycleMapSetting(settingID, settingDiv, incrementAmount)
{
  var currentMapSettings = currentMapType.getMapSettings()
  var settingsLayout = currentMapType.getMapSettingLayout(settingID)
  var settingOptions = currentMapType.getMapSettingOptions(settingID)
  var currentValueID = currentMapSettings[settingID]

  var optionIndex = 0
  for (var optionNum in settingOptions)
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

  var newValueID = settingOptions[optionIndex].id
  var newValueTitle = settingOptions[optionIndex].title
  $(settingDiv).html(settingsLayout.title + "<span style='float: right'>" + newValueTitle + "</span>")

  if (settingsLayout.shouldShowActive != null)
  {
    var showActive = settingsLayout.shouldShowActive(settingOptions[optionIndex].value)
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
  if (($("#" + settingID).hasClass("topnavdisable2") && disableOverride == null) || (disableOverride != null && disableOverride == false))
  {
    $("#" + settingID).removeClass("topnavdisable2")
  }
  else
  {
    $("#" + settingID).addClass("topnavdisable2")
  }
}
