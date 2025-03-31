#!/bin/bash

# reload after sync/deployment
if [ "$ENDPOINT" = "" ]; then
  echo Nothing to run after deploy
else
  if [ "$CONTAINER_NAME" != "" ]; then
    sudo docker exec $CONTAINER_NAME drumee start $ENDPOINT
    sudo docker exec $CONTAINER_NAME drumee start $ENDPOINT/service
  else
    if [ "$DEST_HOST" = "" ]; then
      sudo drumee start $ENDPOINT
      sudo drumee start $ENDPOINT/service
    else
      if [ "$DEST_USER" = "" ]; then
        ssh $DEST_HOST sudo drumee start $ENDPOINT
        ssh $DEST_HOST sudo drumee start $ENDPOINT/service
      elif [ "$CONTAINER_NAME" != "" ]; then
        sudo docker exec $CONTAINER_NAME drumee start $ENDPOINT
        sudo docker exec $CONTAINER_NAME drumee start $ENDPOINT/service
      else
        ssh $DEST_USER@$DEST_HOST sudo drumee start $ENDPOINT
        ssh $DEST_USER@$DEST_HOST sudo drumee start $ENDPOINT/service  
      fi
    fi
  fi
fi