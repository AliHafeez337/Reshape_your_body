const util = require('util');
const Cloud = require('@google-cloud/storage');
const path = require('path');
const serviceKey = path.join(__dirname, './reshape-my-body-558a1d40b8cb.json');

const { Storage } = Cloud
const storage = new Storage({
    keyFilename: serviceKey,
    projectId: 'reshape-my-body',
})

const bucket = storage.bucket('reshape-your-body'); // should be your bucket name

const { format } = util

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

const uploadImage = (file) => new Promise((resolve, reject) => {
    const { originalname, buffer } = file

    const blob = bucket.file(originalname.replace(/ /g, "_"))
    const blobStream = blob.createWriteStream({
        resumable: false
    })

    blobStream.on('finish', () => {
        const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        )
        resolve(publicUrl)
    })
        .on('error', () => {
            reject(`Unable to upload image, something went wrong`)
        })
        .end(buffer)

})

module.exports = uploadImage