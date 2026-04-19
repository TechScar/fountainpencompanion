#!/bin/bash

echo
echo Run FPC Frontend tests
echo ======================
echo

docker-compose exec -T app yarn test

# TODO: Fix the warnings about unhandled requests, and the worker process as seen below:
# A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.