#!/bin/sh
# Installs this repo's tracked git hooks into .git/hooks (not itself
# versioned by git). Runs automatically on `npm install` via the
# "prepare" script.
set -e
mkdir -p .git/hooks
cp scripts/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "Git hooks installed."
