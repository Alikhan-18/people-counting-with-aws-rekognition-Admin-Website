import json
import boto3
import os
ADMIN_TABLE_NAME = os.environ['ADMIN_TABLE_NAME']
AWS_REGION = os.environ['AWS_REGION']
IOT_TOPIC = os.environ['IOT_TOPIC']

iotdataclient = boto3.client('iot-data', AWS_REGION)
client = boto3.client('iot')
dynamodb = boto3.resource('dynamodb')


###
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
        IOT_TOPIC : True
    }
    iotdataclient.publish(
        topic=IOT_TOPIC,
        payload=json.dumps(message)
        )
    print(IOT_TOPIC)

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
    response = client.list_things(
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

def lambda_handler(event, context):
    if "listCurrentDevices" in event:
        response = listCurrentDevices()
        return {
            'statusCode': 200,
            'body': response
        }
    if "takePhoto" in event:
        takePhoto()
    if "changeDeviceShadow" in event:
        update_shadow(event)
    return {
        'statusCode': 200,
        'body': json.dumps(event)
    }