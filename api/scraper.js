const axios = require('axios')
const StoreItem = require('./db/StoreItem')
const fs = require('fs')
require('dotenv').config()

const getStoreItemsAndConsolidate = async () => {
  console.log('Starting scraping job...')
  let numOfReq = 1
  let moreToReturn
  let lastAppId
  const storedStoreItems = []
  try {
    const response = await axios.get(`https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${process.env.STEAM_API_KEY}&include_dlc=true&max_results=50000`)
    storedStoreItems.push(...response.data.response.apps)
    console.log(`Total Steam Apps Returned After Request #${numOfReq} - ${storedStoreItems.length}`)
    lastAppId = response.data.response.last_appid
    moreToReturn = response.data.response.have_more_results
    while (moreToReturn === true) {
      const response = await axios.get(`https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${process.env.STEAM_API_KEY}&include_dlc=true&last_appid=${lastAppId}&max_results=50000`)
      numOfReq += 1
      storedStoreItems.push(...response.data.response.apps)
      console.log(`Total Steam Apps Returned After Request #${numOfReq} - ${storedStoreItems.length}`)
      lastAppId = response.data.response.last_appid
      moreToReturn = response.data.response.have_more_results
    }
    console.log(`All Steam Apps Returned. Number of Requests Needed: ${numOfReq}. Total Apps Returned: ${storedStoreItems.length}`)

    const itemsToJSON = JSON.stringify(storedStoreItems, null, 2)
    const writeStream = fs.createWriteStream('storeData.json')

    const overWatermark = writeStream.write(itemsToJSON)

    if (!overWatermark) {
      await new Promise((resolve) => writeStream.once('drain', resolve))
    }

    writeStream.end()

    return storedStoreItems
  }
  catch (err) {
    console.error('Error calling or saving store data:', err)
  }
}

const scrapeSteamStoreAndSave = async () => {
  let newRecordsAdded = 0
  await getStoreItemsAndConsolidate()
    .then(storeItems => {
      storeItems.forEach(item => {
        StoreItem.findOne({ appid: item.appid })
          .then(async (itemFound, err) => {
            if (err) {
              console.error(err)
            }

            if (!itemFound) {
              await StoreItem.insertOne(item)
              console.log('New Store Item saved to DB')
              newRecordsAdded += 1
            }
          })
      })
      return newRecordsAdded
    })
}

module.exports = scrapeSteamStoreAndSave
