def handler(event, context):
  print('received event:')
  print(event)
  response = {
          'statusCode': 200,
          'headers': {
              'Access-Control-Allow-Origin': '*'
          },
          'body': json.dumps({'message': 'CORS enabled')
      }
  return response
