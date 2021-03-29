#!/bin/bash
cd ../backend/lambda-transform-s3
npm ci
cd ../lambda-iot
zip lambda-iot.zip index.py
#Update the function code with the zip files
aws lambda update-function-code \
    --function-name  lambda-iot \
    --zip-file fileb://lambda-iot.zip

cd ../lambda-presigned-url-handler
zip lambda-presigned-url-handler.zip index.py
aws lambda update-function-code \
    --function-name  lambda-presigned-url-handler \
    --zip-file fileb://lambda-presigned-url-handler.zip

cd ../lambda-rekognition
zip lambda-rekognition.zip index.py
aws lambda update-function-code \
    --function-name  lambda-rekognition \
    --zip-file fileb://lambda-rekognition.zip

cd ../lambda-analytics
zip lambda-analytics.zip index.py
aws lambda update-function-code \
    --function-name  lambda-analytics \
    --zip-file fileb://lambda-analytics.zip

cd ../lambda-developer-endpoints
zip lambda-developer-endpoints.zip index.py
aws lambda update-function-code \
    --function-name  lambda-developer-endpoints \
    --zip-file fileb://lambda-developer-endpoints.zip

cd ../lambda-transform-s3
zip -r Archive.zip .
aws lambda update-function-code \
    --function-name  lambda-transform-s3 \
    --zip-file fileb://Archive.zip



