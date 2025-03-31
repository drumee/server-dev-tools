# Uncomment if you are syncing on a remote host
# Syncing on remote server
# Ensure that you have proper creadentials
# export DEST_HOST=example.org 
# export DEST_USER=$USER

# Syncing on a local Docker container
# export CONTAINER_NAME

# export ENDPOINT 

# DEST_DIR is the location where your local changes will be synced to 

# This is the default setup that matches the Docker Compose file from
# https://github.com/drumee/documentation/blob/main/templates/docker/devel-template.yaml
# You may change to values to your own environment
export CONTAINER_NAME=drumee-dev
export DEST_DIR=${HOME}/.config/${CONTAINER_NAME}
