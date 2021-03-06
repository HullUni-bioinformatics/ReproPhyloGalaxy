ReproPhyloGalaxy
================

A Galaxy instance with ReproPhylo tools

# ReproPhylo: Reproducible Phylogenetics

ReproPhylo is a reproducible phylogenetics pipeline written in python and making use of BioPython and other open tools. This is a Galaxy instance with ReproPhylo tools.

## Galaxy version:
Galaxy was cloned and updated to 'stabe' on 27 Nov 2014 using  
`hg clone https://bitbucket.org/galaxy/galaxy-dist/`  
`cd galaxy-dist && hg update stable`
   
## Licence
ReproPhylo is in the public domain under a [CC0 licence](http://creativecommons.org/publicdomain/zero/1.0/). This is a 'no copyright' licence and you are free to use, modify and repurpose any part of our work as you see fit. See the [documentation](https://docs.google.com/document/d/1Q-8B0cvkZw2zMkuP0Af4zZ7FiAvBQPDdGbrLLMgtx_4/edit?usp=sharing) for licences of dependencies.

## Documentation
Docs and guides are available in a public [Google Doc](https://docs.google.com/document/d/1Q-8B0cvkZw2zMkuP0Af4zZ7FiAvBQPDdGbrLLMgtx_4/edit?usp=sharing), and you are encouraged to edit, extend and improve these docs if you wish. The manual includes a Galaxy tutorial.

## Contributions
We welcome your additions and improvements, just fork the repository on GitHub and then send a pull request.

## Installation on a Ubuntu 14.10 machine
### (for the Galaxy instance including the ReproPhylo tools and the dependencies)

1. clone or downlad and extract this repository
2. cd ReproPhyloGalaxy
3. ./INSTALL.sh  
  
You will be asked for sudo password

*Note*: After the installation is done the repository directory can be removed

## Running Galaxy

1. cd ~/galaxy-dist
2. sudo sh run.sh
3. In a web browser, go to https://localhost:8080
  
The first start-up takes a while because galaxy will fetch online eggs and will conduct tests. Subsequent start-ups are quick.  
  
*Note*: If you have troubles shutting down galaxy with ctrl+c, restart the machine and use sudo sh run.sh **--reload**. You will then be able to stop galaxy using ctrl+c
