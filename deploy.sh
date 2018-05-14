#!/bin/bash

npm run build
ssh -t up-local "rm -rf ~/yify-react/*"
scp -r build up-local:~/yify-react/