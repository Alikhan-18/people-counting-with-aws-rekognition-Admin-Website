// dependencies
const AWS = require('aws-sdk');
const util = require('util');
const sharp = require('sharp');
const size = require('s3-image-size');

// get reference to S3 client
const s3 = new AWS.S3();
// Create the DynamoDB service object
var ddb = new AWS.DynamoDB();

const ADMIN_TABLE_NAME = process.env.ADMIN_TABLE_NAME
const DESTINATION_BUCKET_NAME = process.env.DESTINATION_BUCKET

async function cropImage(origimage, cropParams, imgW, dstKey){
    console.log("cropImage", cropParams, imgW)
    for(const item of cropParams){
        if(item === undefined)
            continue
        // Use the Sharp module to resize the image and save in a buffer.
        let x1 = parseInt(item["X1"]["N"])
        let x2 = parseInt(item["X2"]["N"])
        let y1 = parseInt(item["Y1"]["N"])
        let y2 = parseInt(item["Y2"]["N"])
        let width = x2-x1
        let height = y2-y1
        if(width < 0){
            x1 = x1 - Math.abs(width)
        }
        if(height < 0){
            y1 = y1 - Math.abs(height)
        }
        let zone = item["name"]["S"].split(" ").join("")
        console.log(x1,y1,y2,x2, width, height, imgW)
        try {
            var buffer = await sharp(origimage.Body).resize(imgW).extract({ width: Math.abs(width), height: Math.abs(height), left: x1, top: y1 }).toBuffer();
        } catch (error) {
            console.log(error);
            return;
        }

        // Upload the thumbnail image to the destination bucket
        try {
            const destparams = {
                Bucket: DESTINATION_BUCKET_NAME,
                Key: zone + "-" + dstKey,
                Body: buffer,
                ServerSideEncryption: 'AES256',
                ContentType: "image"
            };

            const putResult = await s3.putObject(destparams).promise();
            console.log("result", putResult)
        } catch (error) {
            console.log(error);
            return;
        }
    }
}

async function deleteImage(srcBucket, srcKey){
    const deleteParams = {
        Bucket: srcBucket,
        Key: srcKey
    };
    try {
        const result = await s3.deleteObject(deleteParams).promise();
        console.log("deleteImage", result)
    } catch (err) {
        console.error(err);
    }

}

async function getCropParams(id) {
    let params = {
        TableName: ADMIN_TABLE_NAME,
        Key: {
            id: {S: id}
        }
    };
    let toReturn = {}
    let result = await ddb.getItem(params).promise();
    try {
        console.log("Success", result.Item);
        let imgW = parseInt(result.Item["W"]["N"])
        let cropParams = result.Item["zones"]["L"].map((el) => {
            if (!el["NULL"]) {
                return el["M"]
            }
        })
        toReturn["imgW"] = imgW
        toReturn["cropParams"] = cropParams
    } catch (err) {
        console.log("getCropParams", err)
    }
    return toReturn
}
exports.handler = async (event, context, callback) => {
    // Read options from the event parameter.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    const srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    console.log(srcKey, srcBucket)
    const dstKey    = "transformed-" + srcKey;
    console.log(dstKey)
    // Infer the image type from the file suffix.
    const typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        console.log("Could not determine the image type.");
        return;
    }

    // Check that the image type is supported
    const imageType = typeMatch[1].toLowerCase();
    if (imageType != "jpg" && imageType != "png") {
        console.log(`Unsupported image type: ${imageType}`);
        return;
    }
    const split = srcKey.split(".")
    console.log("needhere", split)

    try {
        const params = {
            Bucket: srcBucket,
            Key: srcKey
        };
        // Call DynamoDB to read the item from the table
        let DBparams = await getCropParams(split[0])
        console.log("dbParams", DBparams)
        let origimage = await s3.getObject(params).promise()
        await cropImage(origimage, DBparams["cropParams"], DBparams["imgW"], dstKey)
        await deleteImage(srcBucket, srcKey)
    } catch (error) {
        console.log("Error", error);
        return;
    }



    console.log('Successfully cropped ' + srcBucket + '/' + srcKey +
        ' and uploaded to ' + DESTINATION_BUCKET_NAME + '/' + dstKey);

};