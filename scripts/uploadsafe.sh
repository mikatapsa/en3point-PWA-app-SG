#!/bin/bash

BUCKET="en3point-app-sg"
TARGET="PWA-app"
BACKUP="backup-$(date +%Y%m%d-%H%M%S)"
DISTRIBUTIONID = "E1H1IRXWA8X8DS"

# Default: create backup (pass --no-backup to skip)
CREATE_BACKUP=false

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --backup)
      CREATE_BACKUP=false
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--backup]"
      exit 1
      ;;
  esac
done

if [ "$CREATE_BACKUP" = true ]; then
  echo "Backing up current /website to /$BACKUP ..."
  aws s3 sync s3://$BUCKET/$TARGET s3://$BUCKET/$BACKUP
else
  echo "Skipping backup (--no-backup flag provided) ..."
fi

echo "Uploading new version ..."
aws s3 sync ./PWA-app s3://$BUCKET/$TARGET --delete

if [ "$CREATE_BACKUP" = true ]; then
  echo "Done. Backup stored at: s3://$BUCKET/$BACKUP"
else
  echo "Done. No backup created."
fi

echo "invadating cloudfront cache ..."
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTIONID \
    --paths "/*"
echo "done, wait a few minutes for cache to be fully invalidated."
