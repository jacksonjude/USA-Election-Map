const sourceUpdatedTimesURL = "https://map.jacksonjude.com/csv-sources/source-updated-times.json"

class CSVDatabase
{
  static initilize(databaseName, databaseVersion)
  {
    this.databaseName = databaseName
    this.databaseVersion = databaseVersion

    const request = indexedDB.open(this.databaseName, this.databaseVersion)

    request.onupgradeneeded = function(event) {
      var db = event.target.result

      var store = db.createObjectStore('CSVFiles')
    }
  }

  static async openDatabase()
  {
    var openDatabasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, this.databaseVersion)

      request.onerror = function(event) {
        console.error(`Database error: ${event.target.errorCode}`)
      }

      request.onsuccess = function(event) {
        var db = event.target.result
        resolve(db)
      }
    })

    return openDatabasePromise
  }

  static async insertCSV(sourceID, csvText)
  {
    try
    {
      var db = await CSVDatabase.openDatabase()
      var transaction = db.transaction('CSVFiles', 'readwrite')
      var store = transaction.objectStore('CSVFiles')

      store.put({text: csvText, updatedAt: Date.now()}, sourceID)

      transaction.oncomplete = function() {
        db.close()
      }
    }
    catch (error)
    {
      console.log(error)
    }
  }

  static async fetchCSV(sourceID)
  {
    var self = this

    var fetchCSVPromise = new Promise(async (resolve, reject) => {
      try
      {
        var db = await CSVDatabase.openDatabase()
        var transaction = db.transaction('CSVFiles', 'readonly')
        var store = transaction.objectStore('CSVFiles')

        var query = store.get(sourceID)

        query.onsuccess = function(event) {
          var textResult = query.result ? query.result.text : null
          var updatedTime = query.result ? query.result.updatedAt : null

          if (Date.now()-self.lastSourceUpdateCheck < 1000*60*5)
          {
            resolve(textResult)
            return
          }

          $.getJSON(sourceUpdatedTimesURL, null, data => {
            // console.log(updatedTime, data[sourceID], updatedTime != null && updatedTime >= data[sourceID])
            self.lastSourceUpdateCheck = (new Date()).getTime()
            if (updatedTime && updatedTime >= data[sourceID])
            {
              resolve(textResult)
            }
            else
            {
              resolve(null)
            }
          }).fail((callback, error) => {
            console.log(error)
            resolve(textResult)
          })
        }

        query.onerror = function(event) {
          console.log(event.target.errorCode)
          resolve(null)
        }

        transaction.oncomplete = function() {
          db.close()
        }
      }
      catch (error)
      {
        console.log(error)
        resolve(null)
      }
    })

    return fetchCSVPromise
  }

  static async hasCSV(sourceID)
  {
    var hasCSVPromise = new Promise(async (resolve, reject) => {
      try
      {
        var db = await CSVDatabase.openDatabase()
        var transaction = db.transaction('CSVFiles', 'readonly')
        var store = transaction.objectStore('CSVFiles')

        var query = store.getAllKeys()

        query.onsuccess = function(event) {
          resolve(query.result.includes(sourceID))
        }

        query.onerror = function(event) {
          console.log(event.target.errorCode)
        }

        transaction.oncomplete = function() {
          db.close()
        }
      }
      catch (error)
      {
        console.log(error)
        resolve(false)
      }
    })

    return hasCSVPromise
  }

  static async isSourceUpdated(sourceID)
  {
    var self = this
    var isSourceUpdatedPromise = new Promise(async (resolve, reject) => {
      var result = await self.fetchCSV(sourceID)
      resolve(result != null)
    })

    return isSourceUpdatedPromise
  }
}


const csvDatabaseName = "CSVDatabase"
const csvDatabaseVersion = 1

//indexedDB.deleteDatabase(csvDatabaseName)

CSVDatabase.initilize(csvDatabaseName, csvDatabaseVersion)
