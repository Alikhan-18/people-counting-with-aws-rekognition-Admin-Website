#!/bin/bash

# Create SSM parameters to prepare for backend deployment
# These parameters are necessary for the backend stack
admintableName=$( aws resourcegroupstaggingapi get-resources --tag-filters Key=user:Application,Values="peopleCounterAdmin" --resource-type-filters dynamodb --query 'ResourceTagMappingList[*].[ResourceARN]' --output text | awk -F'table/' '{print $2}')
echo "Parameter1 : ${admintableName}"
aws ssm put-parameter \
    --name "peopleCountingAmplifyAdminTable" \
    --type "String" \
    --value "${admintableName}"

controlBucketName=$( aws resourcegroupstaggingapi get-resources --tag-filters Key=user:Application,Values="peopleCounterAdmin" Key=aws:cloudformation:logical-id,Values="S3Bucket" --resource-type-filters s3 --query 'ResourceTagMappingList[*].[ResourceARN]' --output text | awk -F':::' '{print $2}')
echo "Parameter2 : ${controlBucketName}"
aws ssm put-parameter \
    --name "controlBucketNameAmplifyAdmin" \
    --type "String" \
    --value "${controlBucketName}"


timezone=$(curl https://ipapi.co/timezone)
echo "Parameter3 : ${timezone}"
aws ssm put-parameter \
    --name "peopleCountingTimezone" \
    --type "String" \
    --value "${timezone}"


# Create an IoT thing for RaspberryPi deployment
aws iot create-thing-type --thing-type-name "RPI"

# Create the layer for the image processing function
cd ../backend/layers/lambda-transform-s3-layer
mkdir -p lib/nodejs
npm install
npm uninstall sharp
npm install --arch=x64 --platform=linux sharp
mv ./node_modules lib/nodejs

# Deploy the stack using sam
cd ../..
sam build
sam deploy -g --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM --tags stackName=peopleCountingStack

# Get the api keys and the urls for admin and user websites
stackName=$( aws resourcegroupstaggingapi get-resources --tag-filters Key=stackName,Values="peopleCountingStack" --resource-type-filters cloudformation --query 'ResourceTagMappingList[*].[ResourceARN]' --output text)
echo "stackName : ${stackName}"
endpoint=$(aws cloudformation describe-stacks --stack-name "${stackName}" | awk '"OutputValue": "https:')
apikey=$(aws cloudformation describe-stacks --stack-name "${stackName}" | awk '/tom|jerry|vivek/')

echo "endpoint : ${endpoint}"
echo "apikey : ${apikey}"

