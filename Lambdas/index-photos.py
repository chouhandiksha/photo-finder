import json
import boto3
from requests_aws4auth import AWS4Auth
from elasticsearch import Elasticsearch, RequestsHttpConnection
from datetime import datetime


def lambda_handler(event, context):
    # TODO implement

    print('This has been triggered',event)
    s3 = boto3.resource('s3', region_name='us-west-2')#Replace with your region name
    labels = []
    
    
    client1 = boto3.client('s3',region_name = 'us-west-2')
    
    #Requesting for head object
    
    
    
    customLabelsHead= []
    
    #Loops through every file uploaded
    for record in event['Records']:
        bucket_name = record['s3']['bucket']['name']
        bucket = s3.Bucket(bucket_name)
        file_name = str(record['s3']['object']['key'])
        print(record['s3']['object'])
    client2 = boto3.client('rekognition',region_name = 'us-west-2')
    
    custL=[]
    response2 = client2.detect_labels(Image = {"S3Object":{"Bucket": "photo-bucket-b2", "Name":file_name}}, MaxLabels = 10,MinConfidence= 50)
    response1 = client1.head_object(
    Bucket='photo-bucket-b2',
    Key=file_name)
    if(response1['Metadata']):
        print("labels are",response1['Metadata']['customlabels'])
        custL = response1['Metadata']['customlabels']
    if custL:
        customLabelsHead = response1['Metadata']['customlabels'].split(',')
    
    #Append detected Labels into a list
    for res in response2['Labels']:
        labels.append(res['Name'])
    
    #append custom header labels into rekognition label list
    if customLabelsHead:
        labels.extend(customLabelsHead)
        
    for label in labels:
        print(label)
    
    
    host = "search-photos-gg4gdku7fjltpovyhngdpmqtj4.us-west-2.es.amazonaws.com"
    region = "us-west-2"
    service = "es"
    credentials = boto3.Session().get_credentials()
    
    awsauth = AWS4Auth("", "", region, service)
    
    es = Elasticsearch(
        hosts=[{'host': host, 'port': 443}],
        http_auth=awsauth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection
    )
    
    
    
    
    
    
    
    doc = {
            "object-key": file_name,
            "bucket": "photo-bucket-b2",
            "createdTimeStamp" : datetime.now(),
            "labels" : labels
            }
        
    es.index(
        index= "object-key",
        doc_type="Labels",
        id=file_name,
        body=doc)
    
    
    
    
    check = es.get(index="object-key", doc_type="Labels", id=file_name)
    if check["found"]:
        print("Index %s succeeded" % file_name)
    
    
    print(es)
    print(labels)
    
    return "Success"
