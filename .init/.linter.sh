#!/bin/bash
cd /home/kavia/workspace/code-generation/mine-sweeper-139346-139406/MineSweeperMonolithicApplication
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

