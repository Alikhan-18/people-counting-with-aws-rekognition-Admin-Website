import json
import boto3
import os
from botocore.exceptions import ClientError

AWS_REGION = os.environ['AWS_REGION']
IOT_TOPIC = os.environ['IOT_TOPIC']
IMAGE_CACHE_BUCKET_NAME = os.environ['IMAGE_CACHE_BUCKET_NAME']
CONTROL_IMAGE_BUCKET_NAME = os.environ['CONTROL_IMAGE_BUCKET_NAME']
EXPIRATION = os.environ['PRESIGNED_URL_EXPIRATION_IN_SEC']
iotdataclient = boto3.client('iot-data', AWS_REGION)

def create_presigned_url(bucketLogicalName, key, conditions = None):
    """Generate a presigned URL to share an S3 object

    :param bucket_name: string
    :param object_name: string
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """
    params = {
        'x-amz-server-side-encryption': 'AES256'
    }
    conditions = [
        {'x-amz-server-side-encryption': 'AES256'}
    ]
    # Generate a presigned URL for the S3 object
    s3_client = boto3.client('s3', region_name=AWS_REGION)
    try:
        response = s3_client.generate_presigned_post(bucketLogicalName,
                                                     key,
                                                     Fields=params,
                                                     Conditions=conditions,
                                                     ExpiresIn=int(EXPIRATION))
    except ClientError as e:
        logging.error(e)
        return None

    # The response contains the presigned URL
    return response

def sendPresignedURL(event):
    bucketLogicalName = IMAGE_CACHE_BUCKET_NAME
    if event["bucketLogicalName"] == "controlBucket":
        bucketLogicalName = CONTROL_IMAGE_BUCKET_NAME
    url = create_presigned_url(bucketLogicalName, event["key"])
    message = {
        "url" : url
    }
    print(message)
    print(IOT_TOPIC +  "-" + event["deviceID"])
    iotdataclient.publish(
        topic=IOT_TOPIC +  "-" + event["deviceID"],
        payload=json.dumps(message)
        )

def lambda_handler(event, context):
    print(event)
    sendPresignedURL(event)
    return {
        'statusCode': 200,
        'body': json.dumps(event)
    }