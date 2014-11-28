ReproPhyloGalaxy
================

A Galaxy instance with ReproPhylo tools

# ReproPhylo: Reproducible Phylogenetics

ReproPhylo is a reproducible phylogenetics pipeline written in python and making use of BioPython and other open tools. This is a Galaxy instance with ReproPhylo tools.

## Licence
ReproPhylo is in the public domain under a [CC0 licence](http://creativecommons.org/publicdomain/zero/1.0/). This is a 'no copyright' licence and you are free to use, modify and repurpose any part of our work as you see fit. See the [documentation](https://docs.google.com/document/d/1Q-8B0cvkZw2zMkuP0Af4zZ7FiAvBQPDdGbrLLMgtx_4/edit?usp=sharing) for licences of dependencies.

## Documentation
Docs and guides are available in a public [Google Doc](https://docs.google.com/document/d/1Q-8B0cvkZw2zMkuP0Af4zZ7FiAvBQPDdGbrLLMgtx_4/edit?usp=sharing), and you are encouraged to edit, extend and improve these docs if you wish. The manual include a Galaxy tutorial.

## Contributions
We welcome your additions and improvements, just fork the repository on GitHub and then send a pull request.

## Installation on a Ubuntu 14.10 machine
### (for the Galaxy instance including the ReproPhylo tools and the dependencies)

1. clone or downlad and extract this repository
2. cd ReproPhyloGalaxy
3. ./INSTALL.sh

*Note: After the installation is done the repository directory can be removed*  

## Running Galaxy

1. cd ~/ReproPhyloGalaxy
2. sudo sh run.sh
3. In a web browser, go to https://localhost:8080
  
Note: If you have troubles shutting down galaxy, restart the machine and
us sudo sh run.sh **--reload** from now on. You will then be able to stop
 galaxy using CTRL+c
