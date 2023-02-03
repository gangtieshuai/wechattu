#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 * Wechaty - Conversational RPA SDK for Chatbot Makers.
 *  - https://github.com/wechaty/wechaty
 */
// https://stackoverflow.com/a/42817956/1123955
// https://github.com/motdotla/dotenv/issues/89#issuecomment-587753552
import 'dotenv/config.js'
import fastify from 'fastify';
import cors from '@fastify/cors';

import {
  Contact,
  Message,
  ScanStatus,
  WechatyBuilder,
  log,
} from 'wechaty'
import fs from 'fs'
import moment from 'moment'
import qrcodeTerminal from 'qrcode-terminal'

const server = fastify({
  // logger: true
})
server.register(cors, {
  // put your options here
})

server.listen({ host: '0.0.0.0' , port: 3002 }, (error: any) => {
  if (error) {
    console.error(error);
    // process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error(err);
});


server.get('/view', async (req: any, res: any) => {
  const jsonData: any = await fs.readFile('./message.json', 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return false;
    }
    const data1 = JSON.parse(data);
    return data1
  });
  let option = `
  <html>
    <head>
      <title>My HTML Page</title>
    </head>
    <body>
      ${Object.keys(jsonData).map((i, j) => (
      `<div key="${j}">
       <h1>${i}</h1>
       ${Object.keys(jsonData[i]).map((ij, jj) => (
        `<div key="${j}${jj}" >
           <h3>${ij}</h3>
           ${jsonData[i][ij].map((ijx, jjx) => (
          `<div style="background: #f5f5f5;
          padding: 5px 10px;
          border-radius: 6px;" key="${j}${jj}${jjx}">
            <p>群名：${ijx['Room']}       时间：${ijx['DateTime']}</p>
            <p>${ijx['Contact']}：${ijx['Says']}</p>
            <p>Says:${ijx['Says']}</p>
            </div>`
        ))}
        </div>`
      ))}
       </div>`
    ))}
    </body>
  </html>
`
  res.send(option);
});




function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin(user: Contact) {
  log.info('StarterBot', '%s login', user)
}

function onLogout(user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

async function onMessage(msg: Message) {
  try {
    if (msg.self()) return
    if (msg.type() !== bot.Message.Type.Text) return
    if (!msg.room()) {
      return;
    }
    log.info('StarterBot', msg.toString())
    console.log('1:'+msg.toString());
    const room: any = msg.room();
    const sender: any = msg.from();
    const senderName = sender.name();
    const senderRemark = sender.alias();
    const msgTime = msg.date();
    const roomName = await room.topic()
    console.log(`
                 Room: ${await room.topic()} 
                 Contact: ${senderName} (${senderRemark}) 
                 Says: ${msg.text()}
                 DateTime: ${msgTime}
                 `);

    fs.readFile('./message.json', 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const jsonData = JSON.parse(data)?JSON.parse(data):{};
      console.log(jsonData);
      const date = moment(msgTime).format('YYYY-MM-DD')
      const option = {
        Room: roomName,
        Contact: roomName,
        Says: roomName,
        DateTime: msgTime,
      }
   if (!jsonData[roomName]) {
      jsonData[roomName] = {
        [date]: []
      }
      jsonData[roomName][date].push(option)
    } else {
      const it = jsonData[roomName]
      if (it[date]) {
        it[date].push(option)
      } else {
        it[date] = []
        it[data].push(option)
      }
      jsonData[roomName] = it
    }
    fs.writeFile('./message.json', JSON.stringify(jsonData), err => {
      if (err) {
        // throw new Error('Error writing file', err)
        console.log('Write File Error');
      } else {
        console.log('Write File ok');
      }
    });
  });


  } catch (e) {
    console.log(`error:${e}`);
  }


}

const bot = WechatyBuilder.build({
  name: 'bot1',
  /**
   * How to set Wechaty Puppet Provider:
   *
   *  1. Specify a `puppet` option when instantiating Wechaty. (like `{ puppet: 'wechaty-puppet-whatsapp' }`, see below)
   *  1. Set the `WECHATY_PUPPET` environment variable to the puppet NPM module name. (like `wechaty-puppet-whatsapp`)
   *
   * You can use the following providers locally:
   *  - wechaty-puppet-wechat (web protocol, no token required)
   *  - wechaty-puppet-whatsapp (web protocol, no token required)
   *  - wechaty-puppet-padlocal (pad protocol, token required)
   *  - etc. see: <https://wechaty.js.org/docs/puppet-providers/>
   */
  // puppet: 'wechaty-puppet-whatsapp'

  /**
   * You can use wechaty puppet provider 'wechaty-puppet-service'
   *   which can connect to remote Wechaty Puppet Services
   *   for using more powerful protocol.
   * Learn more about services (and TOKEN) from https://wechaty.js.org/docs/puppet-services/
   */
  // puppet: 'wechaty-puppet-service'
  // puppetOptions: {
  //   token: 'xxx',
  // }
})

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
