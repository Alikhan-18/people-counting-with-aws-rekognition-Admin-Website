## API Usage

This prototype includes a minimal API at the end of the [deploy](deployment.md) you will be presented with a API endpoint and API key for usage.


### Get Current Counts

```
curl -X GET -H "x-api-key: YOUR_API_KEY" \
 -H "Content-Type: application/json"  \
 --data '{ "getCurrentCounts" : "true" }' \ 
 https://YOUR-END-POINT
```

***Response example:***
```json
{
	"statusCode": 200,
	"body": {
		"Items": [{
			"count": {
				"N": "5"
			},
			"zone": {
				"S": "zone1"
			},
			"id": {
				"S": "Grill"
			},
			"countHour": {
				"S": "17"
			},
			"timestamp": {
				"S": "2021-05-03-17:00:25"
			}
		}, {
			"count": {
				"N": "9"
			},
			"zone": {
				"S": "zone2"
			},
			"id": {
				"S": "Grill"
			},
			"countHour": {
				"S": "13"
			},
			"timestamp": {
				"S": "2021-05-03-17:00:24"
			}
		}],
		"Count": 2,
		"ScannedCount": 2,
		"ResponseMetadata": {
			"RequestId": "23UEINCPO2JOA0LGSNI5HQ7S77VV4KQNSO5AEMVJF66Q9ASUAAJG",
			"HTTPStatusCode": 200,
			"HTTPHeaders": {
				"server": "Server",
				"date": "Tue, 04 May 2021 13:28:04 GMT",
				"content-type": "application/x-amz-json-1.0",
				"content-length": "284",
				"connection": "keep-alive",
				"x-amzn-requestid": "23UEINCPO2JOA0LGSNI5HQ7S77VV4KQNSO5AEMVJF66Q9ASUAAJG",
				"x-amz-crc32": "3397731302"
			},
			"RetryAttempts": 0
		}
	}
}
```


### Get Average Counts

The following gives the average counts per hour.


```
curl -X GET -H "x-api-key: YOUR_API_KEY" \
 -H "Content-Type: application/json"  \
 --data '{ "getAverageCounts" : "true" }' \ 
 https://YOUR-END-POINT
```

***Response example:***
```json
{
	"statusCode": 200,
	"body": {
		"Items": [{
			"hour": {
				"S": "22"
			},
			"avgCount": {
				"S": "20.0201550387596899"
			}
		}, {
			"hour": {
				"S": "18"
			},
			"avgCount": {
				"S": "44.06201550387596899"
			}
		}, {
			"hour": {
				"S": "16"
			},
			"avgCount": {
				"S": "225.0"
			}
		}, {
			"hour": {
				"S": "00"
			},
			"avgCount": {
				"S": "0.0"
			}
		}, {
			"hour": {
				"S": "23"
			},
			"avgCount": {
				"S": "0.0"
			}
		}, {
			"hour": {
				"S": "19"
			},
			"avgCount": {
				"S": "0.0"
			}
		}, {
			"hour": {
				"S": "20"
			},
			"avgCount": {
				"S": "0.0"
			}
		}, {
			"hour": {
				"S": "21"
			},
			"avgCount": {
				"S": "90.038461538461538464"
			}
		}, {
			"hour": {
				"S": "17"
			},
			"avgCount": {
				"S": "120.0"
			}
		}],
		"Count": 9,
		"ScannedCount": 9,
		"ResponseMetadata": {
			"RequestId": "PLJN9OQ9P3SQUH9LUTDO9P24MBVV4KQNSO5AEMVJF66Q9ASUAAJG",
			"HTTPStatusCode": 200,
			"HTTPHeaders": {
				"server": "Server",
				"date": "Tue, 04 May 2021 21:28:33 GMT",
				"content-type": "application/x-amz-json-1.0",
				"content-length": "458",
				"connection": "keep-alive",
				"x-amzn-requestid": "PLJN9OQ9P3SQUH9LUTDO9P24MBVV4KQNSO5AEMVJF66Q9ASUAAJG",
				"x-amz-crc32": "382844578"
			},
			"RetryAttempts": 0
		}
	}
}

```
