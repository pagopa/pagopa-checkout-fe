#!/usr/bin/env bash
# Useful to copy the "right" OneTrust folder in dist
# id in PROD we use "production", otherwise "test"

# if env is not setted
if [[ -z $CHECKOUT_ENV ]]; then
  OT_FOLDER="test"
else
  OT_FOLDER=$([[ $CHECKOUT_ENV == "PROD" ]] && echo "production" || echo "test")
fi
cp -R "./ot/$OT_FOLDER" "./dist/ot"