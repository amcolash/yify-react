#!/bin/bash

cp ~/.npm-packages/lib/node_modules/peerflix-server/server/index.js peerflix-index.js
npm run build
ssh -t up-local "rm -rf ~/yify-react/*"
scp -r build up-local:~/yify-react/
scp peerflix-index.js up-local:~/index.js
ssh -t up-local "docker cp ~/index.js peerflix:/home/app/server/ && rm ~/index.js && docker restart peerflix"