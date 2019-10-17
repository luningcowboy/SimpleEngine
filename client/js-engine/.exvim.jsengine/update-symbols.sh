#!/bin/bash
export DEST="./.exvim.jsengine"
export TOOLS="/Users/tu/.vim/tools/"
export TMP="${DEST}/_symbols"
export TARGET="${DEST}/symbols"
sh ${TOOLS}/shell/bash/update-symbols.sh
