#!/bin/bash

# script the compiles the cpp file
exefile=$1
logfile=$2
source /home/ubuntu/intel/inteloneapi/setvars.sh  && $exefile > $logfile 2>&1
