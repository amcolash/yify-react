#!/bin/bash

npm run build
scp -r build up-local:~/yify-react/