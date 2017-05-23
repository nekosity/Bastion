/*
 * Copyright (C) 2017 Sankarsan Kampa
 *                    https://sankarsankampa.com/contact
 *
 * This file is a part of Bastion Discord BOT.
 *                        https://github.com/snkrsnkampa/Bastion
 *
 * This code is licensed under the SNKRSN Shared License. It is free to
 * download, copy, compile, use, study and refer under the terms of the
 * SNKRSN Shared License. You can modify the code only for personal or
 * internal use only. However, you can not redistribute the code without
 * explicitly getting permission fot it.
 *
 * Bastion BOT is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY. See the SNKRSN Shared License for
 * more details.
 *
 * You should have received a copy of the SNKRSN Shared License along
 * with this program. If not, see <https://github.com/snkrsnkampa/Bastion/LICENSE>.
 */

const request = require('request');

exports.run = (Bastion, message, args) => {
  if (args.length < 1) {
    return message.channel.send({
      embed: {
        color: Bastion.colors.yellow,
        title: 'Usage',
        description: `\`${Bastion.config.prefix}${this.help.usage}\``
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }

  request(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|info|pageimages&exsentences=10&exintro=true&explaintext=true&inprop=url&pithumbsize=512&redirects=1&formatversion=2&titles=${args.join(' ')}`, function (err, response, body) {
    let color, description = '', data = [], thumbnail = '';

    if (err) {
      color = Bastion.colors.red;
      description = 'Some error has occured while getting data from the server. Please try again later.';
    }
    else if (response.statusCode === 200) {
      color = Bastion.colors.blue;
      try {
        body = JSON.parse(body).query.pages[0];

        if (body.missing) {
          color = Bastion.colors.red;
          description = `**${args.join(' ')}** was not found in Wikipedia.`;
        }
        else {
          data = [
            {
              name: body.title || args.join(' '),
              value: `${body.extract.length < 1000 ? body.extract : body.extract.slice(0, 950)}... [Read More](${body.fullurl})`
            }
          ];
          thumbnail = body.thumbnail ? body.thumbnail.source : 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png';
        }
      }
      catch (e) {
        Bastion.log.error(e.stack);
        color = Bastion.colors.red;
        description = 'Some error has occured while parsing the received data. Please try again later or contact the developer.';
      }
    }
    else {
      color = Bastion.colors.red;
      description = 'Some error has occured while getting data from the server.';
      data = [
        {
          name: `${response.statusCode}`,
          value: response.statusMessage
        }
      ];
    }

    message.channel.send({
      embed: {
        color: color,
        title: 'Wikipedia',
        description: description,
        fields: data,
        thumbnail: {
          url: thumbnail
        },
        footer: {
          text: 'Powered by Wikipedia'
        }
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  });
};

exports.config = {
  aliases: [ 'wiki' ],
  enabled: true
};

exports.help = {
  name: 'wikipedia',
  description: 'Searches Wikipedia and shows the result.',
  botPermission: '',
  userPermission: '',
  usage: 'wikipedia <text>',
  example: [ 'wikipedia Steve Jobs' ]
};
