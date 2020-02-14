#!/bin/bash

# script the compiles the cpp file
infile=$1
outfile=$2
source /home/ubuntu/intel/inteloneapi/setvars.sh  && dpcpp $infile -o $outfile
