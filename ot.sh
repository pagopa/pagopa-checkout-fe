#!/usr/bin/env bash
# Useful to copy the "right" OneTrust folder in dist
# id in PROD we use "production", otherwise "test"
# this script must be called using a syntax like
# ./ot.sh $CHECKOUT_ENV

# if env is not setted
if [[ -z "$1" ]]; then
  OT_FOLDER="test"
else
  OT_FOLDER=$([[ "$1" == "PROD" ]] && echo "production" || echo "test")
fi
cp -R "./ot/$OT_FOLDER" "./dist/ot"