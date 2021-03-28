import json
import boto3
import os

client = boto3.client('dynamodb')
CURRENT_COUNTS_TABLE_NAME = os.environ['CURRENT_COUNTS_TABLE_NAME']
AVERAGE_COUNTS_TABLE_NAME = os.environ['AVERAGE_COUNTS_TABLE_NAME']
def lambda_handler(event, context):
    if "getCurrentCounts" in event:
        response = client.scan(TableName=CURRENT_COUNTS_TABLE_NAME)
        return {
            'statusCode': 200,
            'body': response
        }
    if "getAverageCounts" in event:
        response = client.scan(TableName=AVERAGE_COUNTS_TABLE_NAME)
        return {
            'statusCode': 200,
            'body': response
        }
    response = {}
    return {
        'statusCode': 200,
        'body': response
    }