#!/bin/bash

# 1) CONFIG – change this to your app root dir name
APP_ROOT="PWA-app"

# 2) Derived names
PLACEHOLDER_DIR="${APP_ROOT}-placeholder"
ZIP_NAME="${APP_ROOT}-placeholder.zip"

# 3) Clean old placeholder dir + zip if they exist
rm -rf "$PLACEHOLDER_DIR" "$ZIP_NAME"

echo "Creating placeholder copy: $PLACEHOLDER_DIR"

# 4) Copy everything EXCEPT image files
rsync -av \
  --exclude='*.png' \
  --exclude='*.jpg' \
  --exclude='*.jpeg' \
  --exclude='*.gif' \
  --exclude='*.webp' \
  --exclude='*.svg' \
  "$APP_ROOT"/ "$PLACEHOLDER_DIR"/

# 5) Recreate image files as EMPTY placeholders
cd "$APP_ROOT"

find . -type f \( \
  -name "*.png" -o \
  -name "*.jpg" -o \
  -name "*.jpeg" -o \
  -name "*.gif" -o \
  -name "*.webp" -o \
  -name "*.svg" \
\) -print0 | while IFS= read -r -d '' file; do
  # create empty file in the placeholder copy at the same path
  touch "../$PLACEHOLDER_DIR/$file"
done

cd ..

# 6) Zip the placeholder version
zip -r "$ZIP_NAME" "$PLACEHOLDER_DIR"

echo "Done. Created $ZIP_NAME"
