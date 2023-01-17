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
    self = self || this

    var openDatabasePromise = new Promise((resolve) => {
      const request = indexedDB.open(self.databaseName, self.databaseVersion)

      request.onerror = function(event) {
        console.error(`Database error: ${event.target.errorCode || event.target.error.code}`)
        resolve(null)
      }

      request.onupgradeneeded = function(event) {
        var db = event.target.result

        db.createObjectStore(self.storeName)
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
    self = self || this

    try
    {
      var db = await self.openDatabase()
      if (db == null) { return }
      var transaction = db.transaction(self.storeName, 'readwrite')
      var store = transaction.objectStore(self.storeName)

      store.put({text: fileText, updatedAt: self.sourceUpdatedTimesData ? (self.sourceUpdatedTimesData[sourceID] ? self.sourceUpdatedTimesData[sourceID] : Date.now()) : 0}, sourceID)

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
    self = self || this

    var db = await self.openDatabase()
    if (db == null) { return null }

    var fetchFilePromise = new Promise((resolve) => {
      try
      {
        var transaction = db.transaction(self.storeName, 'readonly')
        var store = transaction.objectStore(self.storeName)

        var query = store.get(sourceID)

        query.onsuccess = function() {
          var textResult = query.result ? query.result.text : null
          var updatedTime = query.result ? query.result.updatedAt : null

          if (!self.sourceUpdatedTimesData || Date.now()-self.lastSourceUpdateCheck >= 1000*60*5)
          {
            $.getJSON(self.sourceUpdatedTimesURL, null, data => {
              self.lastSourceUpdateCheck = Date.now()
              self.sourceUpdatedTimesData = data
            }).fail((_, error) => {
              console.log(error)
              resolve(textResult)
            })
          }

          if (self.sourceUpdatedTimesData && self.sourceUpdatedTimesData[sourceID] == 0)
          {
            resolve(null)
          }
          else if (updatedTime && self.sourceUpdatedTimesData && updatedTime >= self.sourceUpdatedTimesData[sourceID])
          {
            resolve(textResult)
          }
          else if (updatedTime && self.sourceUpdatedTimesData && self.sourceUpdatedTimesData[sourceID] == null && Date.now()-updatedTime < 1000*60*60*24)
          {
            resolve(textResult)
          }
          else
          {
            resolve(null)
          }
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
    self = self || this

    var db = await self.openDatabase()
    if (db == null) { return false }

    var hasFilePromise = new Promise((resolve) => {
      try
      {
        var transaction = db.transaction(self.storeName, 'readonly')
        var store = transaction.objectStore(self.storeName)

        var query = store.getAllKeys()

        query.onsuccess = function() {
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
    self = self || this

    var result = await self.fetchFile(sourceID)
    return result != null
  }
}


const csvDatabaseName = "CSVDatabase"
const csvDatabaseVersion = 1
const csvStoreName = "CSVFiles"
const csvSourceUpdatedTimesURL = "./csv-sources/source-updated-times.json"
var CSVDatabase = new FilesDatabase()


const svgDatabaseName = "SVGDatabase"
const svgDatabaseVersion = 1
const svgStoreName = "SVGFiles"
const svgSourceUpdatedTimesURL = "./svg-sources/source-updated-times.json"
var SVGDatabase = new FilesDatabase()

async function initializeDatabases()
{
  let lastAppVersion = getCookie("appVersion")
  if (lastAppVersion != currentAppVersion)
  {
    await clearDatabases()
    setCookie("appVersion", currentAppVersion)
  }

  await CSVDatabase.initialize(csvDatabaseName, csvDatabaseVersion, csvStoreName, csvSourceUpdatedTimesURL)
  await SVGDatabase.initialize(svgDatabaseName, svgDatabaseVersion, svgStoreName, svgSourceUpdatedTimesURL)
}

async function clearDatabases()
{
  let databases = indexedDB.databases ? await indexedDB.databases() : [{name: "CSVDatabase"}, {name: "SVGDatabase"}]
  for (let database of databases)
  {
    await indexedDB.deleteDatabase(database.name)
  }
}
