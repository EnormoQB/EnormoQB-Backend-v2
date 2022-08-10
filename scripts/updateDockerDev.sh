#!/bin/bash
imageName=enormoqb:dev
containerName=enormoqb-dev

docker build -t $imageName -f Dockerfile  .

echo Delete old container...
docker rm -f $containerName

echo Run new container...
docker run --cpus=0.6 -d -p 5000:8989 --name $containerName $imageName