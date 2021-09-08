function zeroPadding(num)
{
  if (num < 10)
  {
    return "0" + num
  }
  return num
}

function decimalPadding(num, shouldAddDecimalPadding)
{
  if (shouldAddDecimalPadding == null)
  {
    shouldAddDecimalPadding = true
  }

  if (num-Math.floor(num) == 0 && shouldAddDecimalPadding)
  {
    return num + ".0"
  }
  return num.toString()
}

function getKeyByValue(object, value)
{
  return Object.keys(object).find(key => object[key] == value)
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
  var newObject = JSON.parse(JSON.stringify(objectToClone))

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

function getTodayString(delimiter, includeTime)
{
  var currentTimeDate = new Date()
  return getMDYDateString(currentTimeDate, delimiter, includeTime)
}

function getMDYDateString(date, delimiter, includeTime)
{
  delimiter = delimiter || "/"

  var dateString = (date.getMonth()+1) + delimiter + date.getDate() + delimiter + date.getFullYear()

  if (includeTime)
  {
    dateString += delimiter + zeroPadding(date.getHours()) + delimiter + zeroPadding(date.getMinutes())
  }

  return dateString
}

String.prototype.toTitle = function() {
  if (this.length == 0) { return "" }
  if (this.length == 1) { return this.toUpperCase() }
  return this.charAt(0).toUpperCase() + this.slice(1)
}
