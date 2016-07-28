'use strict';
const pokeApi = require('pokemon-go-api');
const slackApi = require('node-slack');
const pokemonInfo = require('./pokemons.json').pokemon;
const config = require('./config.json');

const ignoredPokemon = config.ignoredPokemon || 'caterpie,weedle,pidgey,rattata,spearow,zubat';
const username = config.account.username;
const password = config.account.password;
const provider = config.account.type;
const location = config.location;
const slackTitle = config.slack.messageTitle;

let slack = new slackApi(config.slack.webhookUrl);
let slackMessageDefaults = {
    channel: config.slack.channel,
    username: slack.username
};
let nearby = [];

pokeApi.login(username, password, provider)
  .then(function() {
    return pokeApi.location.set('address', location)
      .then(pokeApi.getPlayerEndpoint);
  })
  .then(pokeApi.mapData.getNearby)
  .then(function(data) {
    data.forEach(function(x) {
        if (x.catchable_pokemon && x.catchable_pokemon.length > 0) {
            nearby = nearby.concat(x.catchable_pokemon);
        }
    });
    reportPokemonToSlack(nearby);
  })
  .catch(function(error) {
    console.log('error', error.stack);
  });

function reportPokemonToSlack(pokemon) {
    let attachments = getAttachments(pokemon);

    if (attachments.length > 0) {
        let slackMessage = {
            attachments: attachments,
            text: slackTitle
        };
        Object.assign(slackMessage, slackMessageDefaults);
        slack.send(slackMessage);
    }
}

function getAttachments(pokemon) {
    let attachments = [];
    pokemon.forEach(function(poke) {
        let pokeInfo = getPokemonInfo(poke.pokemon_id);
        if (ignoredPokemon.indexOf(pokeInfo.name.toLowerCase()) === -1) {
            let pokemonAttachment = {
                title: pokeInfo.name,
                title_link: 'http://maps.google.com/?q=' + poke.latitude + ',' + poke.longitude,
                thumb_url: pokeInfo.img
            };

            attachments.push(pokemonAttachment);
        }
    });
    return attachments;
}

function getPokemonInfo(pokedexNumber) {
    return pokemonInfo.filter(function(poke) {
        return poke.id == pokedexNumber;
    })[0];
}
