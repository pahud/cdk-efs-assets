import json
import logging
import os
import subprocess

logger = logging.getLogger()
logger.setLevel(logging.INFO)

repo = os.environ.get('REPOSITORY_URI')
mount_target = os.environ.get('MOUNT_TARGET', '/mnt/efsmount')

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
  reponame = repo.split('/')[-1].split('.')[0]
  subprocess.check_call([ 'rm', '-rf', '{}/{}'.format(mount_target, reponame) ])
  subprocess.check_call([ 'git', 'clone', repo, '{}/{}'.format(mount_target, reponame) ])
