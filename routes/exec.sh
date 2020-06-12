#!/bin/bash

# script the compiles the cpp file
exefile=$1
logfile=$2
source /opt/intel/inteloneapi/setvars.sh --force && $exefile > $logfile 2>&1
