#!/bin/bash
# just set few variable
HOST_BASE_DIR=$PWD
HOST_PROJECT_DIR="project"
DOCKER_PROJECT_DIR="/home/form"
DS="/"
HOST_FULL_PATH="$HOST_BASE_DIR$DS$HOST_PROJECT_DIR"
EXPOSED_PORTS="80:80"
NETWORK_NAME="host"
# myframework:1 = nodejs/npm/tsc/apache2
# myframework:2 = nodejs/npm/tsc/apache2/php/phpmyadmin/mysql
IMAGE_NAME="shadowvzs/dev_container:v2"
CONTAINER_ALIAS="dev_container"
ENTRY_POINT="/bin/bash"

# Exposed ports
#-p $EXPOSED_PORTS 

# give permission for project
sudo chmod -R 777 $HOST_FULL_PATH

# Show the command :)
sudo docker run -v $HOST_FULL_PATH:$DOCKER_PROJECT_DIR -it --rm --network=$NETWORK_NAME --privileged --name $CONTAINER_ALIAS $IMAGE_NAME $ENTRY_POINT


