#!/bin/bash

# script the compiles the cpp file
infile=$1
outfile=$2
logfile=$3
source /opt/intel/inteloneapi/setvars.sh --force && dpcpp $infile -o $outfile > $logfile 2>&1
