#!/bin/sh -l

USER_EMAIL="$1"
USER_NAME="$2"
SOURCE_REPO="$3"
SOURCE_BRANCH="$4"
DEST_REPO="$5"
DEST_BRANCH="$6"

set -e  # if a command fails it stops the execution
set -u  # script fails if trying to access to an undefined variable

if [ -n "${SSH_DEPLOY_KEY:=}" ]
then
	mkdir --parents "$HOME/.ssh"
	DEPLOY_KEY_FILE="$HOME/.ssh/deploy_key"
	echo "${SSH_DEPLOY_KEY}" > "$DEPLOY_KEY_FILE"
	chmod 600 "$DEPLOY_KEY_FILE"

	SSH_KNOWN_HOSTS_FILE="$HOME/.ssh/known_hosts"
	ssh-keyscan -H github.com > "$SSH_KNOWN_HOSTS_FILE"

	export GIT_SSH_COMMAND="ssh -i "$DEPLOY_KEY_FILE" -o UserKnownHostsFile=$SSH_KNOWN_HOSTS_FILE"
else
	echo "::error::SSH_DEPLOY_KEY is empty."
fi

git config --global user.email "$USER_EMAIL"
git config --global user.name "$USER_NAME"
git clone --single-branch --branch "$DEST_BRANCH" "git@github.com:$USER_NAME/$DEST_REPO.git"
cd "$DEST_REPO"
git fetch "https://github.com/$USER_NAME/$SOURCE_REPO.git" "$SOURCE_BRANCH" && git merge FETCH_HEAD --allow-unrelated-histories
git push -u "git@github.com:$USER_NAME/$DEST_REPO.git" "$DEST_BRANCH"
