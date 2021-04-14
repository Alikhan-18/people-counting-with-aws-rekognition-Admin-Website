import json
import boto3
import os

AWS_REGION = os.environ['AWS_REGION']

iotdataclient = boto3.client('iot-data', AWS_REGION)
iotclient = boto3.client('iot')
dynamodb = boto3.resource('dynamodb')
ssmclient = boto3.client('ssm')

ssmresponse = ssmclient.get_parameter(
    Name='peopleCountingAmplifyAdminTable'
)

ADMIN_TABLE_NAME = ssmresponse["Parameter"]["Value"]


def update_shadow(event):
    payload_dict = {
        "state": {
            "desired" : event["state"]
        }
    }
    JSON_payload = json.dumps(payload_dict)
    print("update_shadow", payload_dict, event["thingName"])
    response = iotdataclient.update_thing_shadow(thingName=event["thingName"],payload=JSON_payload)
    res_payload = json.loads(response['payload'].read().decode('utf-8'))
    print(res_payload)

def get_thing_state(thingName):
    response = iotdataclient.get_thing_shadow(thingName=thingName)
    streamingBody = response["payload"]
    jsonState = json.loads(streamingBody.read())
    if "reported" not in jsonState["state"]:
        print(thingName, jsonState,  "thing has no reported state")
        return {}
    return jsonState["state"]["reported"]

def takePhoto():
    message = {
        "takePhoto" : True
    }
    iotdataclient.publish(
        topic="takePhoto",
        payload=json.dumps(message)
        )
    print("takePhoto")

def getLogicalName(id):
    table = dynamodb.Table(ADMIN_TABLE_NAME)
    response = table.get_item(
        Key={
            'id': id
        }
    )
    if "Item" not in response:
        return "No Name"
    return response["Item"]["logicalName"]

def listCurrentDevices():
    response = iotclient.list_things(
        maxResults=100,
        thingTypeName='RPI'
    )
    thingNames = [thing["thingName"] for thing in response["things"]]
    thingStates = []
    for thingName in thingNames:
        thingState = get_thing_state(thingName)
        print(thingState)
        logicalName = getLogicalName(thingName)
        thingState["thingName"] = thingName
        thingState["logicalName"] = logicalName
        thingStates.append(thingState)
    return thingStates

def handler(event, context):
    if "listCurrentDevices" in event["body"]:
        print("HERE")
        response = listCurrentDevices()
        return {
            'statusCode': 200,
            "headers": {
                "Access-Control-Allow-Credentials": True,
                "Access-Control-Allow-Origin": "*",
             },
            'isBase64Encoded': False,
            'body': json.dumps(response)
        }
    if "takePhoto" in event["body"]:
        takePhoto()
    if "changeDeviceShadow" in event["body"]:
        update_shadow(event["body"])
    return {
        'statusCode': 200,
        "headers": {
            "Access-Control-Allow-Credentials": True,
            "Access-Control-Allow-Origin": "*",
        },
        'isBase64Encoded': False,
        'body': json.dumps(event["body"])
    }
