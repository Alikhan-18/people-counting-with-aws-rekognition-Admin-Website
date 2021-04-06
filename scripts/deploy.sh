#!/bin/bash

# Create SSM parameters to prepare for backend deployment
admintableName=$( aws resourcegroupstaggingapi get-resources --tag-filters Key=user:Application,Values="adminDashboard" Key=user:Stack,Values="dev" --resource-type-filters dynamodb --query 'ResourceTagMappingList[*].[ResourceARN]' --output text | awk -F'table/' '{print $2}')
echo "Parameter1 : ${admintableName}"
aws ssm put-parameter \
    --name "peopleCountingAmplifyAdminTable" \
    --type "String" \
    --value "${admintableName}" \
    --overwrite
controlBucketName=$( aws resourcegroupstaggingapi get-resources --tag-filters Key=user:Application,Values="adminDashboard" Key=aws:cloudformation:logical-id,Values="S3Bucket" Key=user:Stack,Values="dev" --resource-type-filters s3 --query 'ResourceTagMappingList[*].[ResourceARN]' --output text | awk -F':::' '{print $2}')
aws ssm put-parameter \
    --name "controlBucketNameAmplifyAdmin" \
    --type "String" \
    --value "${controlBucketName}" \
    --overwrite
echo "Parameter2 : ${controlBucketName}"

# Create an IoT thing for RaspberryPi deployment
aws iot create-thing-type --thing-type-name "RPI"

# Create the layer for the image processing function
cd ../backend/lambda-transform-s3
npm install
npm uninstall sharp
npm install --arch=x64 --platform=linux sharp
zip -r Archive.zip .
mkdir ../backend/layers
mv ./Archive.zip ../backend/layers/lambda-transform-s3.zip
rm -rf node_modules Archive.zip

