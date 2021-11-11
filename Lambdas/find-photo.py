import json
from requests_aws4auth import AWS4Auth
import boto3
from elasticsearch import Elasticsearch, RequestsHttpConnection
from botocore.vendored import requests


def lambda_handler(event, context):
    # TODO implement
    labels = event['queryStringParameters']['search-labels']
    print(labels)
    lex = boto3.client('lex-runtime')
    response_lex = lex.post_text(
    botName='photo_finder',
    botAlias="findPhoto",
    userId="test",
    inputText= labels)
    keywords = []
    print(response_lex)
    slots = response_lex['slots']
    print(slots)
    keywords = [v for _, v in slots.items() if v]
    print(keywords)
    delim = ','
    keys = delim.join(keywords)
    print(keys)
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
    # print(es)


    endpoint = 'https://search-photos-gg4gdku7fjltpovyhngdpmqtj4.us-west-2.es.amazonaws.com'
    headers = {'Content-Type': 'application/json'}
    prepq = []


    # for lbl in labels:
    #     prepq.append({"match": {"labels": lbl}})

    query = {"query": {"match": {"labels": keys}}}
    es_resultdata = es.search(index="object-key", body=query)
    #r = requests.post(endpoint, headers=headers, data=json.dumps(query))
    # print(es_resultdata)

    result_img = []
    for each in es_resultdata['hits']['hits']:
        objKey = each['_source']['object-key']
        bucket = "photo-bucket-b2"
        # image_url = "https://" + bucket + ".s3.amazonaws.com/" + objKey
        url = boto3.client('s3').generate_presigned_url(
        ClientMethod='get_object',
        Params={'Bucket': 'photo-bucket-b2', 'Key': objKey},
        ExpiresIn=3600)
        result_img.append(url)
        print(each['_source']['labels'])
    # print(result_img)




    return {
        'statusCode': 200,
        'body': json.dumps({"results": result_img}),
        'headers': {
            "Access-Control-Allow-Origin":"*",
            "Access-Control-Allow-Headers":"*",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,GET"
        }

    }
