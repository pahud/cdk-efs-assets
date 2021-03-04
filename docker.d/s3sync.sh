#!/bin/bash
set -xe
#
# This script helps copy S3 object to local EFS mount and extract it into the mount target directory($MOUNT_TARGET).
#
# We receive the following env vars from CDK
# MOUNT_TARGET: The mount target i.e. '/mnt/efsmount',
# BUCKET_NAME: The s3 bucke tname
# ZIPPED_KEY: The zip object key
# SYNC_PATH: The local destination path
#

echo "start s3 sync"

FULL_PATH="${MOUNT_TARGET}${SYNC_PATH}"
BASENAME="$(basename ${ZIPPED_KEY})"

if [[ "${SYNC_PATH}" == "/" ]]; then
  rm -rf ${FULL_PATH}*
else
  rm -rf ${FULL_PATH}
  # directory must exist to unzip into
  mkdir -p ${FULL_PATH}
fi

cd ${FULL_PATH}
aws s3 cp s3://${BUCKET_NAME}/${ZIPPED_KEY} ./ && \
unzip $BASENAME && rm -f $BASENAME

ls -al 

