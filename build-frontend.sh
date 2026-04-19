#!/bin/bash

echo
echo Build FPC Frontend
echo ==================
echo

docker-compose exec app yarn build
