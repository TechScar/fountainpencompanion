#!/bin/bash

echo
echo Run FPC Backend tests
echo =====================
echo

docker-compose exec -T app bundle exec rspec
