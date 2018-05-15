#!/bin/bash

echo "--- Running build ---"
npm run build

echo "--- Removing old version ---"
ssh -t up "rm -rf ~/yify-react/*"

echo "--- Copying new build ---"
scp -r build up:~/yify-react/

# Check if the peerflix server has changed at all
A=~/.npm-packages/lib/node_modules/peerflix-server/server/index.js
B=peerflix-index.js
DIFF=$(diff $A $B)
if [ "$DIFF" ]; then
    echo "--- Copying peerflix server ---"
    cp $A $B
    scp peerflix-index.js up:~/index.js

    echo "--- Updating peerflix container ---"
    ssh -t up "docker cp ~/index.js peerflix:/home/app/server/ && rm ~/index.js && docker restart peerflix"
fi