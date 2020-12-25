import json
import logging
import os
import subprocess
import boto3
import zipfile
import urllib.parse
from io import BytesIO

logger = logging.getLogger()
logger.setLevel(logging.INFO)

bucket = os.environ['BUCKET_NAME']
zipped_key = os.environ['ZIPPED_KEY']
mount_target = os.environ['MOUNT_TARGET']

s3 = boto3.client('s3')

def on_event(event, context):
  print(event)

  if 'RequestType' in event:
    request_type = event['RequestType']
    if request_type == 'Create': return on_create(event)
    if request_type == 'Update': return on_update(event)
    if request_type == 'Delete': return on_delete(event)

  # else, try to handle as S3 event from CloudTrail
  if 'detail' in event:
    _bucket = event['detail']['requestParameters']['bucketName']
    _key = urllib.parse.unquote_plus(event['detail']['requestParameters']['key'])
    if _bucket == bucket and _key == zipped_key:
      return sync()

  raise Exception("Invalid event type: %s" % event)

def on_create(event):
  props = event["ResourceProperties"]
  print("create new resource with props %s" % props)

  sync()

  ok_result = {'status': 'ok'}

  return { 'Data': ok_result }

def on_update(event):
  # No action to take
  pass

def on_delete(event):
  # No action to take
  pass

def sync():
  _, _, zip_filename = zipped_key.rpartition('/')
  zip_filename_no_ext = zip_filename.split('.')[0]
  subprocess.check_call([ 'rm', '-rf', '{}/{}'.format(mount_target, zip_filename_no_ext) ])
  os.mkdir('{}/{}'.format(mount_target, zip_filename_no_ext))

  s3_buffer = BytesIO(s3.get_object(Bucket=bucket, Key=zipped_key)['Body'].read())
  with zipfile.ZipFile(s3_buffer) as z:
    z.extractall('{}/{}'.format(mount_target, zip_filename_no_ext))
