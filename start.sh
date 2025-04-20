#!/bin/bash

# Update from git if AUTO_UPDATE is enabled
if [[ -d .git ]] && [[ ${AUTO_UPDATE} == "1" ]]; then
    git pull
fi

# Install additional packages if specified
if [[ ! -z ${NODE_PACKAGES} ]]; then
    bun add ${NODE_PACKAGES}
fi

# Remove packages if specified
if [[ ! -z ${UNNODE_PACKAGES} ]]; then
    bun remove ${UNNODE_PACKAGES}
fi

# Install dependencies
if [ -f package.json ]; then
    bun install
fi

# Start the application with Bun
bun run src/index.ts ${NODE_ARGS} 