Here's everything that was done to fix the Node version issue:

Diagnosis commands (read-only, no changes):

which node && node --version
nvm alias default
nvm current
nvm ls
brew list --versions node
cat ~/.zshrc
These revealed two things:

/usr/local/bin/node (v16.17.0) was a stray system install, separate from nvm
nvm's default alias was set to lts/\*, which wasn't resolving to an installed version — so nvm fell back to "system" (that v16 binary)
Fix #1 — set nvm's default alias to a real installed version:

nvm alias default 20.18.0
Fix #2 — edit ~/.zshrc to force that default to win at shell startup. The file had /usr/local/bin hardcoded near the front of PATH early on, and a conda init block at the very end that re-shuffles PATH again — so even with the alias fixed, later startup steps could still override it. Added this at the very end of the file, after the conda init block:

# Force nvm's default Node version to win PATH precedence over /usr/local/bin,

# since conda/pyenv init above can re-prepend their own paths ahead of nvm's.

nvm use default --silent
