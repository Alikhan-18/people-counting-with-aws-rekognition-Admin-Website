#!/bin/bash
admintableName=$( aws resourcegroupstaggingapi get-resources --tag-filters Key=user:Application,Values="admintest1" Key=user:Stack,Values="dev" --resource-type-filters dynamodb --query 'ResourceTagMappingList[*].[ResourceARN]' --output text | awk -F'table/' '{print $2}')
echo "Parameter1 : ${admintableName}"
aws ssm put-parameter \
    --name "peopleCountingAmplifyAdminTable" \
    --type "String" \
    --value "${admintableName}" \
    --overwrite
controlBucketName=$( aws resourcegroupstaggingapi get-resources --tag-filters Key=user:Application,Values="admintest1" Key=aws:cloudformation:logical-id,Values="DeploymentBucket" Key=user:Stack,Values="dev" --resource-type-filters s3 --query 'ResourceTagMappingList[*].[ResourceARN]' --output text | awk -F':::' '{print $2}')
aws ssm put-parameter \
    --name "controlBucketNameAmplifyAdmin" \
    --type "String" \
    --value "${controlBucketName}" \
    --overwrite
echo "Parameter2 : ${controlBucketName}"
#Create a IoT thing for the latter part of the instructions
aws iot create-thing-type --thing-type-name "RPI"
