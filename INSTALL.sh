#!/bin/bash

echo Copying Galaxy to $HOME
cp -r galaxy-dist $HOME/.
echo
echo Installing ReproPhylo dependencies
echo
echo Updating Ubuntu PPAs

sudo apt-get update -y -qq --fix-missing

 
 
# Python binary dependencies, developer tools
echo
echo Updating python

sudo apt-get install -y -qq python python-dev python-pip

# biopython
echo
echo Installing Biopython
sudo apt-get install -qq python-setuptools python-numpy python-qt4 python-scipy python-mysqldb python-lxml -y
sudo apt-get install -qq python-biopython -y

# ete2
echo 
echo Installing ETE

sudo pip install -q ete2

# dendropy
echo
echo Installing Dendropy

sudo pip install -q dendropy

# cloud

echo
echo Installing Cloud
sudo pip install -q cloud

# pandas
echo
echo Installing Pandas
echo This takes awhile
sudo pip install -q  pandas

# matplotlib
echo
echo Installing Matplotlib
sudo apt-get build-dep -qq python-matplotlib -y
sudo apt-get install -qq python-matplotlib -y

# mafft
echo
echo Installing mafft
sudo apt-get install -qq -y mafft

echo
echo Cleaning up
sudo apt-get -qq -y autoremove
sudo apt-get -qq -y autoclean

echo DONE
echo
echo "############################################################"
echo To start galaxy do:
echo
echo "$ cd $HOME/galaxy-dist && sudo sh run.sh"
echo "then go to https://localhost:8080"
echo
echo To stop galaxy use ctrl+c
echo "###########################################################"

