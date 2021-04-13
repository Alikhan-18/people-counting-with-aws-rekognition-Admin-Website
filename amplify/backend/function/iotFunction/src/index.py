def handler(event, context):
  print('received event:')
  print(event)
  response = {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Credentials": True,
            "Access-Control-Allow-Origin": "*",
        },
        "body": "Hello",
  }
  return response
