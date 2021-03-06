#!/bin/bash
set -e
#
# This script helps git clone from github repo to local EFS mount target
#

if [[ -n $OAUTH_TOKEN ]]; then
  echo "got oauth_token - generating the private repo URI"
  REPOSITORY_URI="https://${OAUTH_TOKEN}@${REPOSITORY_URI##https://}"
fi

echo "start git clone"

git clone ${REPOSITORY_URI} ${MOUNT_TARGET}${SYNC_PATH};

echo "list the content"

ls -al ${MOUNT_TARGET}${SYNC_PATH}


