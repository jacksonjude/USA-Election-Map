class FilesDatabase
{
  async initialize(databaseName, databaseVersion, storeName, sourceUpdatedTimesURL)
  {
    this.databaseName = databaseName
    this.databaseVersion = databaseVersion
    this.storeName = storeName
    this.sourceUpdatedTimesURL = sourceUpdatedTimesURL

    await this.openDatabase(this)
  }

  async openDatabase(self)
  {
    var self = self || this

    var openDatabasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(self.databaseName, self.databaseVersion)

      request.onerror = function(event) {
        console.error(`Database error: ${event.target.errorCode || event.target.error.code}`)
        resolve(null)
      }

      request.onupgradeneeded = function(event) {
        var db = event.target.result

        var store = db.createObjectStore(self.storeName)
      }

      request.onsuccess = function(event) {
        var db = event.target.result
        resolve(db)
      }
    })

    return openDatabasePromise
  }

  async insertFile(sourceID, fileText, self)
  {
    var self = self || this

    try
    {
      var db = await self.openDatabase()
      if (db == null) { return }
      var transaction = db.transaction(self.storeName, 'readwrite')
      var store = transaction.objectStore(self.storeName)

      store.put({text: fileText, updatedAt: Date.now()}, sourceID)

      transaction.oncomplete = function() {
        db.close()
      }
    }
    catch (error)
    {
      console.log(error)
    }
  }

  async fetchFile(sourceID, self)
  {
    var self = self || this

    var fetchFilePromise = new Promise(async (resolve, reject) => {
      try
      {
        var db = await self.openDatabase()
        if (db == null) { return resolve(null) }
        var transaction = db.transaction(self.storeName, 'readonly')
        var store = transaction.objectStore(self.storeName)

        var query = store.get(sourceID)

        query.onsuccess = function(event) {
          var textResult = query.result ? query.result.text : null
          var updatedTime = query.result ? query.result.updatedAt : null

          if (Date.now()-self.lastSourceUpdateCheck < 1000*60*5)
          {
            resolve(textResult)
            return
          }

          $.getJSON(self.sourceUpdatedTimesURL, null, data => {
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

    return fetchFilePromise
  }

  async hasFile(sourceID, self)
  {
    var self = self || this

    var hasFilePromise = new Promise(async (resolve, reject) => {
      try
      {
        var db = await self.openDatabase()
        if (db == null) { return resolve(false) }
        var transaction = db.transaction(self.storeName, 'readonly')
        var store = transaction.objectStore(self.storeName)

        var query = store.getAllKeys()

        query.onsuccess = function(event) {
          resolve(query.result.includes(sourceID))
        }

        query.onerror = function(event) {
          console.log(event.target.errorCode)
          resolve(false)
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

    return hasFilePromise
  }

  async isSourceUpdated(sourceID, self)
  {
    var self = self || this
    var isSourceUpdatedPromise = new Promise(async (resolve, reject) => {
      var result = await self.fetchFile(sourceID)
      resolve(result != null)
    })

    return isSourceUpdatedPromise
  }
}


const csvDatabaseName = "CSVDatabase"
const csvDatabaseVersion = 1
const csvStoreName = "CSVFiles"
const csvSourceUpdatedTimesURL = "https://map.jacksonjude.com/csv-sources/source-updated-times.json"

var CSVDatabase = new FilesDatabase()
CSVDatabase.initialize(csvDatabaseName, csvDatabaseVersion, csvStoreName, csvSourceUpdatedTimesURL)


const svgDatabaseName = "SVGDatabase"
const svgDatabaseVersion = 1
const svgStoreName = "SVGFiles"
const svgSourceUpdatedTimesURL = "https://map.jacksonjude.com/svg-sources/source-updated-times.json"

var SVGDatabase = new FilesDatabase()
SVGDatabase.initialize(svgDatabaseName, svgDatabaseVersion, svgStoreName, svgSourceUpdatedTimesURL)
