#!/bin/bash

echo Copying peerflix server
cp ~/.npm-packages/lib/node_modules/peerflix-server/server/index.js peerflix-index.js

echo Running build
npm run build

echo Removing old version
ssh -t up "rm -rf ~/yify-react/*"

echo Copying new build/server
scp -r build up:~/yify-react/
scp peerflix-index.js up:~/index.js

echo Updating peerflix container
ssh -t up "docker cp ~/index.js peerflix:/home/app/server/ && rm ~/index.js && docker restart peerflix"