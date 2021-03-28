from decimal import Decimal

import boto3
import os
import json
from datetime import datetime
import dateutil.tz

dynamodb = boto3.resource('dynamodb')
kinesisClient = boto3.client('kinesis')

CURRENT_COUNTS_TABLE_NAME = os.environ['CURRENT_COUNTS_TABLE_NAME']
ADMIN_TABLE_NAME = os.environ['ADMIN_TABLE_NAME']
KINESIS_NAME = os.environ['KINESIS_NAME']
CAMERA_TIMEZONE = os.environ['CAMERA_TIMEZONE']

def putItemToDB(camera, zone, count, hour, timestamp):
    table = dynamodb.Table(CURRENT_COUNTS_TABLE_NAME)
    response = table.put_item(
       Item={
            'id': camera,
            'zone': zone,
            'count': count,
            'countHour': hour,
            'timestamp': timestamp
        }
    )
    print(response)
    return response

def getLogicalName(id):
    table = dynamodb.Table(ADMIN_TABLE_NAME)
    response = table.get_item(
        Key={
            'id': id
        }
    )
    print(response)
    return response["Item"]["logicalName"]

def putIntoKinesis(camera, zone, count, hour, timestamp):
    record = {
            'id': camera,
            'zone': zone,
            'count': count,
            'countHour': hour,
            'timestamp': timestamp
    }
    response = kinesisClient.put_record(
        StreamName=KINESIS_NAME,
        Data=json.dumps(record).replace("}", "}\n"),
        PartitionKey='partitionkey1'
    )
    return response

def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']

        rekognition = boto3.client("rekognition")
        response = rekognition.detect_labels(
            Image={
                "S3Object": {
                    "Bucket": bucket,
                    "Name": key,
                }
            },
            MaxLabels=5,
            MinConfidence=94,
        )

        labels = response.get('Labels', None)
        temp = key.replace("-","")
        arr = temp.split("transformed")
        id = arr[1].split(".")[0]
        zone = arr[0]
        print(id, zone)
        print(labels)
        logicalName = getLogicalName(id)
        eastern = dateutil.tz.gettz(CAMERA_TIMEZONE)
        hour = datetime.now(tz=eastern).strftime('%H')
        print(hour)
        timestamp = datetime.now(tz=eastern).strftime('%Y-%m-%d-%H:%M:%S')
        for label in labels:
            if label['Name'] == "Person":
                arr = label['Instances']
                putItemToDB(logicalName, zone, len(arr), hour, timestamp)
                putIntoKinesis(logicalName, zone, len(arr), hour, timestamp)
                return
        putItemToDB(logicalName, zone, 0, hour, timestamp)
        putIntoKinesis(logicalName, zone, 0, hour, timestamp)
        response = client.delete_object(
            Bucket = bucket,
            Key = key
        )
        print(response)