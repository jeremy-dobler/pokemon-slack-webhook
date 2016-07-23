'use strict';

var pokeApi = require('pokemon-go-node-api');
var slackApi = require('node-slack');

var location = {
    type: 'name',
    name: '200 S Hanley rd, Clayton, MO'
};
var username = 'anoddthought';
var password = 'Marvel4Life';
var provider = 'ptc';
var ignorePokemon = 'pidgey,rattata,meowth';

var slack = new slackApi('https://hooks.slack.com/services/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');
var slackMessageDefaults = {
    channel: '#pokemongo',
    username: 'pokebot'
};

var pokemonToReport = [];

pokeApi.init(username, password, location, provider, function(err) {
    if (err) throw err;

    pokeApi.Heartbeat(function(err, hb) {
        if (err) throw err;

        pokemonToReport = getPokemon(hb.cells);

        var rarePokemon = hideCommonPokemon(pokemonToReport);

        reportPokemonToSlack(rarePokemon);
    });
});

function getPokemon(cells) {
    var pokemon = [];
    for (var i = cells.length - 1; i >= 0; i--) {
        if (cells[i].WildPokemon && cells[i].WildPokemon.length > 0) {
            pokemon = pokemon.concat(cells[i].WildPokemon);
        }
        if (cells[i].NearbyPokemon && cells[i].NearbyPokemon.length > 0) {
            pokemon = pokemon.concat(cells[i].NearbyPokemon);
        }
        if (cells[i].MapPokemon && cells[i].MapPokemon.length > 0) {
            pokemon = pokemon.concat(cells[i].MapPokemon);
        }
    }
    return pokemon;
}

function hideCommonPokemon(pokemon) {
    var rarePoke = [];
    for (var i = pokemon.length - 1; i >= 0; i--) {
        var pokedexNumber = pokemon[i].PokedexNumber || pokemon[i].PokedexTypeId || pokemon[i].pokemon.PokemonId;
        var pokeDetails = getPokemonDetails(pokedexNumber);
        pokemon[i].name = pokeDetails.name;
        pokemon[i].imgUrl = pokeDetails.img;
        if (ignorePokemon.indexOf(pokemon[i].name.toLowerCase()) == -1) {
            rarePoke.push(pokemon[i]);
        }
    }
    console.log(pokemon);
    return rarePoke;
}

function getPokemonDetails(pokedexNumber) {
    return pokeApi.pokemonlist[parseInt(pokedexNumber) - 1];
}

function reportPokemonToSlack(pokemon) {
    // create the header of the message
    let text = 'There are some pokemon nearby!';

    // create the attachments displayed on the question
    // let attachments = [ this.getSlackQuestion(question) ];

    let slackMessage = {
        attachments: getAttachments(pokemon),
        text: text
    };
    slackMessage = Object.assign(slackMessageDefaults, slackMessage);
    slack.send(slackMessageDefaults);
}

function getAttachments(pokemon) {
    var attachments = [];
    pokemon.forEach(function(poke) {
        var pokemonAttachment = {
            title: poke.name,
            thumb_url: poke.imgUrl
        };

        attachments.push(pokemonAttachment);
    });
    return attachments;
}

// function getLocation(pokemon) {
//     var location = '';
//     if (poke.EncounterId) {
        
//     } else {

//     }
// }

// function getCardinalDirection(encounterId) {

// }

function getMapLink(pokemon) {
    return 'http://maps.google.com/?q=' + pokemon.EncounterId + ',<lng>'
}