var countdownTimes = {}
var currentCountdownTimeName

function createCountdownDropdownItems()
{
  $("#countdownsDropdownContainer").html("")
  
  if (Object.keys(countdownTimes).length <= 0)
  {
    $("#countdownsDropdownContent").hide()
    return
  }
  else
  {
    $("#countdownsDropdownContent").show()
  }
  
  for (var timeName in countdownTimes)
  {
    $("#countdownsDropdownContainer").append("<div class='dropdown-separator'></div>")
    $("#countdownsDropdownContainer").append("<a id='" + timeName + "-countdown' style='padding-top: 14rem; min-height: 25rem;' onclick='selectCountdownTime(\"" + timeName + "\", this)'>" + timeName + "</a>")
  }

  updateCountdownTimer()
  $("[id='" + currentCountdownTimeName + "-countdown']").addClass("active")
  $("#countdownDisplay").attr('href', countdownTimes[currentCountdownTimeName].url)
}

function selectCountdownTime(countdownTimeName, countdownButtonDiv)
{
  $("#countdownsDropdownContainer .active").removeClass("active")
  $(countdownButtonDiv).addClass("active")

  currentCountdownTimeName = countdownTimeName
  $("#countdownDisplay").attr('href', countdownTimes[currentCountdownTimeName].url)
  updateCountdownTimer()
}

function updateCountdownTimer()
{
  var currentDate = new Date()

  var countdownTime
  if (currentCountdownTimeName != null && countdownTimes[currentCountdownTimeName])
  {
    countdownTime = countdownTimes[currentCountdownTimeName].time
  }
  else
  {
    countdownTime = Object.values(countdownTimes).map((timeData) => {return timeData.time}).sort().slice(-1)[0]
    for (let timeName in countdownTimes)
    {
      if (currentDate.getTime() < countdownTimes[timeName].time)
      {
        countdownTime = countdownTimes[timeName].time
        break
      }
    }

    for (let timeName in countdownTimes)
    {
      if (countdownTime == countdownTimes[timeName].time)
      {
        currentCountdownTimeName = timeName
        break
      }
    }
  }

  var timeUntilDay = Math.abs(countdownTime-currentDate.getTime())
  var timeHasPassed = Math.sign(countdownTime-currentDate.getTime()) == -1

  var daysUntilDay = Math.floor(timeUntilDay/(1000*60*60*24))
  var hoursUntilDay = Math.floor(timeUntilDay/(1000*60*60)%24)
  var minutesUntilDay = Math.floor(timeUntilDay/(1000*60)%60)
  var secondsUntilDay = Math.floor(timeUntilDay/1000%60)

  $("#countdownDisplay").html((timeHasPassed ? "+" : "–") + " " + daysUntilDay + "<span style='font-size: 16rem;'> day" + (daysUntilDay == 1 ? "" : "s") + "</span>&nbsp;&nbsp;" + zeroPadding(hoursUntilDay) + "<span style='font-size: 16rem;'> hr" + (hoursUntilDay == 1 ? "" : "s") + "</span>&nbsp;&nbsp;" + zeroPadding(minutesUntilDay) + "<span style='font-size: 16rem;'> min" + (minutesUntilDay == 1 ? "" : "s") + "</span>&nbsp;&nbsp;" + zeroPadding(secondsUntilDay) + "<span style='font-size: 16rem;'> s" + "</span>")
}
