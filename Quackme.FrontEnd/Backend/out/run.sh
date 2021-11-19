#!/bin/bash

echo set env vars
#export QME_CONFIG="/media/data/git/6.QME/config/prod"
#export QME_OUTPUT="/media/data/git/6.QME/output"
printenv | grep 'QME'

echo run service

cd build

ls

java -XX:+UseG1GC -jar quackme-backend.jar

read press any key to close

