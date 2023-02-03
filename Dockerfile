FROM wechaty/wechaty:next

WORKDIR /bot

ADD . /bot

RUN npm config set registry https://registry.npm.taobao.org

RUN jq 'del(.dependencies.wechaty)' package.json | sponge package.json \
    && npm install \
    && sudo rm -fr /tmp/* ~/.npm


RUN npm install -g pm2

EXPOSE 3002

# CMD [ "npm", "start" ]
CMD ["pm2-runtime","start", "examples/robot.ts"] 
