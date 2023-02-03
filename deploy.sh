git pull origin master
sudo docker container stop $(sudo docker ps -f name=wehcat -q)
sudo docker build . --file Dockerfile --tag wehcat:latest

set -e
export WECHATY_PUPPET_PADLOCAL_TOKEN=puppet_padlocal_92566699b831484f83d6080c84518ff9
export WECHATY_PUPPET_SERVER_PORT=3002
export WECHATY_PUPPET=wechaty-puppet-padlocal
export WECHATY_LOG=verbose

sudo docker run --name nftserve --rm -ti \
  -e WECHATY_LOG \
  -e WECHATY_PUPPET \
  -e WECHATY_PUPPET_PADLOCAL_TOKEN \
  -e WECHATY_PUPPET_SERVER_PORT \
  -e WECHATY_TOKEN="$WECHATY_PUPPET_PADLOCAL_TOKEN" \
  -p "$WECHATY_PUPPET_SERVER_PORT:$WECHATY_PUPPET_SERVER_PORT" \ -d -p 3002:3002 wehcat:latest

sudo docker system prune -af


