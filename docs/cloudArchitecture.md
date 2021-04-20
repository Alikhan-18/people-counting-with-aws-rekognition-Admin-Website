## High level architecture

<img src="./images/diagram.png"  width="600"/>

This solution consists of three major parts. The numbers shown on the diagram above specify the flow of data as it gets processed by those parts.

##Image processing part

1. An image of the monitored space is sent from Raspberry Pi to the “Image Cache” S3 Bucket (all images are deleted 1-2 minutes after they are sent, server side encryption enabled).
2. The “Crop Images” lambda function runs after the image is received in the storage.
3. The “Crop Images” function crops the image using the “Zone Selections” DynamoDB table which contains zone selections.
4. The “Crop Images” function puts the cropped parts of the original image into the “Processed Images” S3 Bucket.
5. This triggers the “Count People” function which is responsible for counting the number of humans on the cropped parts of the original image.
6. AWS Rekognition is called. It returns types of objects depicted in the image along with the counts for each object type.
7. The “Count People” function puts the count for each zone into the “Current Counts” DynamoDB table.

##Analytics Part

1. The “Count People” function also puts the count for each zone into the analytics pipeline.
2. This data is stored in the “Data Lake” S3 Bucket in JSON format.
3. AWS Athena queries the storage from the previous step.
4. The query is specified in the “Query function” lambda. This function is called every 24 hours to update the average count for the entire monitored space for each hour of operation over a period of 7 days.
5. The result of the query is stored in the “Historical Data” DynamoDB table. This contains the average counts mentioned in the previous step.
6. An HTTP request can be sent to a REST API endpoint by a client application (e.g. React.js) to retrieve the data from the “Current Counts” DynamoDB table.
7. An HTTP request can be sent to a REST API endpoint by a client application (e.g. React.js) to retrieve the data from the “Historical Data” DynamoDB table. 

##Administrator Part

1. A request to capture an image of the space from all cameras and send them to the administrator is sent from the administrator website. This is done by sending an HTTP request to a REST API endpoint from the admin website. Same endpoint can be used to update the configuration (e.g. sampling rate) for all devices.
2. This triggers the “IoT” lambda function which contains the logic on how to deal with the request parameters.
3. The “IoT” lambda function calls the AWS IoT service.
4. This service sends a request to capture and send an image of the monitored space to all of the cameras.
5. After receiving the request, the images are sent to the “Control Images” S3 Bucket.
6. The images (labelled with the cameraIDs) are seen by the administrator who makes the zone selections that are stored in the “Zone Selections” DynamoDB table. Each image is labelled by the admin.
7. The zone selections are updated.
