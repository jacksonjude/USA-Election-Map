const browserName = bowser.getParser(navigator.userAgent).getResult().browser.name

function zeroPadding(num)
{
  if (num < 10)
  {
    return "0" + num
  }
  return num
}

function decimalPadding(num, places = 1)
{
  num = num.toString()

  for (let i=1; i <= places; i++)
  {
    if (!num.includes("."))
    {
      num += "."
    }
    if (num.split(".")[1].length < i)
    {
      num += "0"
    }
  }

  return num
}

function roundValue(valueToRound, decimalPlaceToRound)
{
  return Math.round(valueToRound*Math.pow(10, decimalPlaceToRound))/Math.pow(10, decimalPlaceToRound)
}

function roundValueToPlace(valueToRound, figuresToInclude)
{
  var decimalPlaceToRound = Math.floor(-Math.log(valueToRound)/Math.log(10)+figuresToInclude)
  if (decimalPlaceToRound <= 0 || !isFinite(decimalPlaceToRound))
  {
    decimalPlaceToRound = 1
  }

  return roundValue(valueToRound, decimalPlaceToRound)
}

function addCommaFormatting(num)
{
  let numString = ""
  let rawNumString = num.toString()
  for (let i=0; i < rawNumString.length; i++)
  {
    numString += rawNumString.slice(i, i+1)
    if (i != rawNumString.length-1 && (rawNumString.length-1-i) % 3 == 0)
    {
      numString += ","
    }
  }

  return numString
}

function getKeyByValue(object, value, shouldStringifyToCompare)
{
  return Object.keys(object).find(key => shouldStringifyToCompare ? JSON.stringify(object[key]) == JSON.stringify(value) : object[key] == value)
}

function getKeyForMaxValue(object, returnEvenKeys, minValue)
{
  var largestValue = minValue || 0
  var largestKey = []
  Object.keys(object).forEach(key => {
    if (object[key] > largestValue)
    {
      largestKey = [key]
      largestValue = object[key]
    }
    else if (object[key] == largestValue)
    {
      largestKey.push(key)
    }
  })

  return largestKey.length > 1 && returnEvenKeys ? largestKey : largestKey[0]
}

function invertObject(object)
{
  var newObject = {}
  var keys = Object.keys(object)
  for (var i in keys)
  {
    newObject[object[keys[i]]] = keys[i]
  }

  return newObject
}

function multiplyBrightness(hexColorString, brightnessFactor)
{
  var rgb = hexToRGB(hexColorString)
  if (!rgb) { return }

  var hsv = RGBtoHSV(rgb)
  hsv.v *= brightnessFactor

  return RGBToHex(HSVtoRGB(hsv))
}

function adjustBrightness(hexColorString, minBrightness)
{
  var rgb = hexToRGB(hexColorString)
  if (!rgb) { return }

  var hsv = RGBtoHSV(rgb)
  if (hsv.v < minBrightness)
  {
    hsv.v = minBrightness
  }

  return RGBToHex(HSVtoRGB(hsv))
}

function multiplySaturation(hexColorString, saturationFactor)
{
  var rgb = hexToRGB(hexColorString)
  if (!rgb) { return }

  var hsv = RGBtoHSV(rgb)
  hsv.s *= saturationFactor

  return RGBToHex(HSVtoRGB(hsv))
}

function hexToRGB(hex)
{
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function componentToHex(c) {
  var hex = c.toString(16)
  return hex.length == 1 ? "0" + hex : hex
}

function RGBToHex(rgb) {
  return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b)
}

function RGBtoHSV(r, g, b) {
  if (arguments.length === 1) {
    g = r.g
    b = r.b
    r = r.r
  }
  var max = Math.max(r, g, b), min = Math.min(r, g, b),
    d = max - min,
    h,
    s = (max === 0 ? 0 : d / max),
    v = max / 255

  switch (max) {
    case min: h = 0; break
    case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break
    case g: h = (b - r) + d * 2; h /= 6 * d; break
    case b: h = (r - g) + d * 4; h /= 6 * d; break
  }

  return {
    h: h,
    s: s,
    v: v
  }
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t
  if (arguments.length === 1) {
    s = h.s
    v = h.v
    h = h.h
  }
  i = Math.floor(h * 6)
  f = h * 6 - i
  p = v * (1 - s)
  q = v * (1 - f * s)
  t = v * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0:
    r = v
    g = t
    b = p
    break

    case 1:
    r = q
    g = v
    b = p
    break

    case 2:
    r = p
    g = v
    b = t
    break

    case 3:
    r = p
    g = q
    b = v
    break

    case 4:
    r = t
    g = p
    b = v
    break

    case 5:
    r = v
    g = p
    b = q
    break
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

function cloneObject(objectToClone)
{
  var newObject = JSON.parse(JSON.stringify(objectToClone) || "{}")

  return newObject
}

function mergeObject(object1, object2)
{
  var newObject = cloneObject(object1)
  object2 = cloneObject(object2)

  for (var key in object2)
  {
    newObject[key] = object2[key]
  }

  return newObject
}

function setCookie(cname, cvalue, exdays)
{
  exdays = exdays || 365*5

  var d = new Date()
  d.setTime(d.getTime() + (exdays*24*60*60*1000))
  var expires = "expires="+ d.toUTCString()
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
}

function getCookie(cname)
{
  var name = cname + "="
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  for (var i = 0; i < ca.length; i++)
  {
    var c = ca[i]
    while (c.charAt(0) == ' ')
    {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0)
    {
      return c.substring(name.length, c.length)
    }
  }
  return null
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr
  if (this.length === 0) return hash
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i)
    hash  = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

function moveLastToFirst(array, times)
{
  if (array.length <= 0) { return }

  for (i=0; i < times; i++)
  {
    var lastElement = array.pop()
    array.unshift(lastElement)
  }
}

function getTodayString(delimiter, includeTime, overrideDateFormat)
{
  var currentTimeDate = new Date()
  return getDateString(currentTimeDate, delimiter, includeTime, false, overrideDateFormat)
}

function getDateString(date, delimiter, includeTime, useZeroPadding, overrideDateFormat)
{
  delimiter = delimiter || "/"

  var dateString
  switch (overrideDateFormat || currentMapType.getMapSettings()["dateFormat"])
  {
    case "dmy":
    dateString = (useZeroPadding ? zeroPadding(date.getDate()) : date.getDate()) + delimiter + (useZeroPadding ? zeroPadding(date.getMonth()+1) : (date.getMonth()+1)) + delimiter + date.getFullYear()
    break

    case "ymd":
    dateString = date.getFullYear() + delimiter + (useZeroPadding ? zeroPadding(date.getMonth()+1) : (date.getMonth()+1)) + delimiter + (useZeroPadding ? zeroPadding(date.getDate()) : date.getDate())
    break

    case "mdy":
    default:
    dateString = (useZeroPadding ? zeroPadding(date.getMonth()+1) : (date.getMonth()+1)) + delimiter + (useZeroPadding ? zeroPadding(date.getDate()) : date.getDate()) + delimiter + date.getFullYear()
    break
  }

  if (includeTime)
  {
    dateString += delimiter + zeroPadding(date.getHours()) + delimiter + zeroPadding(date.getMinutes())
  }

  return dateString
}

function getDecadeFromDate(dateForDecade)
{
  return Math.floor(((dateForDecade || new Date()).getFullYear()-1)/10)*10
}

String.prototype.toTitle = function() {
  if (this.length == 0) { return "" }
  if (this.length == 1) { return this.toUpperCase() }
  return this.charAt(0).toUpperCase() + this.slice(1)
}

Date.prototype.getUTCAdjustedTime = function() {
  return this.getTime()-1000*60*this.getTimezoneOffset()
}
