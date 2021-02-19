import json
import logging
import os
import subprocess
import boto3
import json
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

repo = os.environ.get('REPOSITORY_URI')
mount_target = os.environ.get('MOUNT_TARGET', '/mnt/efsmount')
sync_path = os.environ.get('SYNC_PATH')
github_secret_id = os.environ.get('GITHUB_SECRET_ID')
github_secret_key = os.environ.get('GITHUB_SECRET_KEY')

def get_secret_value(id, key):
  session = boto3.session.Session()
  client = session.client(
    service_name='secretsmanager'
  )
  try:
    json_secret_value = json.loads(client.get_secret_value(SecretId=id).get('SecretString'))
  except ClientError as e:
    print(e.response['Error']['Code'])
    return None
  return json_secret_value.get(key)

if github_secret_id and github_secret_key:
  github_oauth_token = get_secret_value(github_secret_id, github_secret_key)
  repo = repo.format(token=github_oauth_token)

def on_event(event, context):
  print(event)
  request_type = event['RequestType']
  if request_type == 'Create': return on_create(event)
  if request_type == 'Update': return on_update(event)
  if request_type == 'Delete': return on_delete(event)
  raise Exception("Invalid request type: %s" % request_type)

def on_create(event):
  props = event["ResourceProperties"]
  print("create new resource with props %s" % props)

  # add your create code here...
  # physical_id = ...

  sync(repo, mount_target)

  ok_result = {'status': 'ok'}

  return { 'Data': ok_result }

  # return { 'PhysicalResourceId': physical_id }

def on_update(event):
  physical_id = event["PhysicalResourceId"]
  props = event["ResourceProperties"]
  print("update resource %s with props %s" % (physical_id, props))
  # ...

def on_delete(event):
  physical_id = event["PhysicalResourceId"]
  print("delete resource %s" % physical_id)
  # ...


def sync(repo, target_path):
  full_path = '{}{}'.format(mount_target, sync_path)

  if sync_path == '/':
    # delete all contents from root directory, but not root directory itself
    os.chdir(full_path)
    subprocess.check_call('rm -rf {}*'.format(full_path), shell=True)
  else:
    subprocess.check_call([ 'rm', '-rf', full_path ])

  subprocess.check_call([ 'git', 'clone', repo, full_path ])
