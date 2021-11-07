import json
from requests_aws4auth import AWS4Auth
import boto3
from elasticsearch import Elasticsearch, RequestsHttpConnection
from botocore.vendored import requests


def lambda_handler(event, context):
    # TODO implement
    labels = event['queryStringParameters']['search-labels']
    keywords = get_label_keywords(labels)
    print(keywords)
    
    
    
    
    
    host = "search-photos-gg4gdku7fjltpovyhngdpmqtj4.us-west-2.es.amazonaws.com"
    region = "us-west-2"
    service = "es"
    
    awsauth = AWS4Auth("", "", region, service)
    es = Elasticsearch(
        hosts=[{'host': host, 'port': 443}],
        http_auth=awsauth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection
    )
    print(es)
    
    
    endpoint = 'https://search-photos-gg4gdku7fjltpovyhngdpmqtj4.us-west-2.es.amazonaws.com'
    headers = {'Content-Type': 'application/json'}
    prepq = []
    
    
    for lbl in labels:
        prepq.append({"match": {"labels": lbl}})
        
    query = {"query": {"bool": {"should": prepq}}}
    es_resultdata = es.search(index="object-key", body=query)
    #r = requests.post(endpoint, headers=headers, data=json.dumps(query))
    print(es_resultdata)
    
    result_img = []
    for each in es_resultdata['hits']['hits']:
        objKey = each['_source']['object-key']
        bucket = "photo-bucket-b2"
        image_url = "https://" + bucket + ".s3.amazonaws.com/" + objKey
        result_img.append(image_url)
        print(each['_source']['labels'])
    print(result_img)
    
    
    
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True
        },
        'body': json.dumps({"results": result_img})
    }
    
    
    
    
    
    
    
def get_label_keywords(inputText):
    lex = boto3.client('lex-runtime')
    response = lex.post_text(
        botName='photo_finder',
        botAlias='findPhoto',
        userId='user1',
        inputText=inputText)
    print(response)
    # labels_keywords = []
    # slots = response['slots']
    # labels_keywords = [v for _, v in slots.items() if v]
    # print(labels_keywords)
    # return labels_keywords
   
        
        
        
        
        

    