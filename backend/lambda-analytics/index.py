import boto3
import time
import os
import json

dynamodb = boto3.resource('dynamodb')
# Environment Variables
DATABASE = os.environ['DATABASE']
TABLE = os.environ['TABLE']
DYNAMODBNAME = os.environ['DYNAMODBNAME']
# Top X Constant
TOPX = 5
# S3 Constant
S3_OUTPUT = f's3://{os.environ["BUCKET_NAME"]}/query_results/'
# Number of Retries
RETRY_COUNT = 10

def putItemToDB(hour, avgCount):
    table = dynamodb.Table(DYNAMODBNAME)
    response = table.put_item(
       Item={
            'hour': hour,
            'avgCount': avgCount,
        }
    )
    print(response)

def lambda_handler(event, context):
    client = boto3.client('athena')
    # query variable with two environment variables and a constant
    query = f"""
        SELECT countHour, AVG(count) AS AvgCount
        FROM "{DATABASE}"."{TABLE}"
        GROUP BY countHour;
    """
    response = client.start_query_execution(
        QueryString=query,
        QueryExecutionContext={ 'Database': DATABASE },
        ResultConfiguration={'OutputLocation': S3_OUTPUT}
    )
    query_execution_id = response['QueryExecutionId']
    print(response)
    # Get Execution Status
    for i in range(0, RETRY_COUNT):
        # Get Query Execution
        query_status = client.get_query_execution(
            QueryExecutionId=query_execution_id
        )
        exec_status = query_status['QueryExecution']['Status']['State']
        if exec_status == 'SUCCEEDED':
            print(f'Status: {exec_status}')
            break
        elif exec_status == 'FAILED':
            raise Exception(f'STATUS: {exec_status}')
        else:
            print(f'STATUS: {exec_status}')
            time.sleep(i)
    else:
        client.stop_query_execution(QueryExecutionId=query_execution_id)
        raise Exception('TIME OVER')
    # Get Query Results
    result = client.get_query_results(QueryExecutionId=query_execution_id)
    print(result['ResultSet']['Rows'])
    result = result['ResultSet']['Rows']
    col1 = ''
    col2 = ''
    for i in range(0, len(result)):
        col1 = result[i]['Data'][0]['VarCharValue']
        col2 = result[i]['Data'][1]['VarCharValue']
        print(col1,col2)
        if i != 0:
            putItemToDB(col1, col2)
    # Function can return results to your application or service
    # return result['ResultSet']['Rows']
