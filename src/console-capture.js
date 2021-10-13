function initConsoleCapture()
{
  if (console.everything === undefined)
  {
    console.everything = []

    function TS() {
      return (new Date).toLocaleString("sv", { timeZone: 'UTC' }) + "Z"
    }

    window.onerror = function (error, url, line) {
      console.everything.push({
        type: "exception",
        timeStamp: TS(),
        value: { error, url, line }
      })
      return false;
    }
    window.onunhandledrejection = function (e) {
      console.everything.push({
        type: "promiseRejection",
        timeStamp: TS(),
        value: e.reason
      })
    }

    function hookLogType(logType) {
      const original = console[logType].bind(console)
      return function() {
        console.everything.push({
          type: logType,
          timeStamp: TS(),
          value: Array.from(arguments)
        })
        original.apply(console, arguments)
      }
    }

    ['log', 'error', 'warn', 'debug'].forEach(logType => {
      console[logType] = hookLogType(logType)
    })
  }
}

initConsoleCapture() // Begin capturing console output, logs immediately

function downloadConsoleBlob()
{
  var consoleBlob = new Blob([JSON.stringify(console.everything)], {type: "application/json"})

  var downloadLinkDiv = document.createElement("a")

  downloadLinkDiv.style.display = "none"
  downloadLinkDiv.setAttribute('href', window.URL.createObjectURL(consoleBlob))
  downloadLinkDiv.setAttribute('download', "map-jacksonjude-console-output")

  downloadLinkDiv.click()

  downloadLinkDiv.remove()
}
