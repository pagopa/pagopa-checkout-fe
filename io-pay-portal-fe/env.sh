#!/usr/bin/env bash

# Recreate config file and assignment
echo "window._env_ = {" > ./src/env-config.js

# Loop on environment variables prefixed with
# io_pay_portal_var and add them to env-config.js
for io_pay_portal_var in $(env | grep -i io_pay); do
    varname=$(printf '%s\n' "$io_pay_portal_var" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$io_pay_portal_var" | sed -e 's/^[^=]*=//')

    echo "  $varname: \"$varvalue\"," >> ./src/env-config.js
done

echo "}" >> ./src/env-config.js
