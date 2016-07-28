# pokemon-slack-webhook

## Initial setup
### 1. Clone repoistory or download zip and extract
### 2. Download and install https://nodejs.org/en/
### 3. In pokemon-slack-webhook/, run npm install
### 4. Change config.json file
#### a. ignoredPokemon - comma delimited list of Pokemon names(lowercase)
#### b. account - google account information. (Pokemon Trainer Account does not work with current api)
#### c. location - address that you want the api to check
#### d. slack channel information - https://my.slack.com/services/new/incoming-webhook/
##### i. channel name
##### ii. username to post as
##### iii. webhookUrl
##### iv. messageTitle - Title of Slack message. I redirect to pokevision.com with the latitude and longitude 
### 5. Run Node PokemonSlack.js 
#### a. you can setup a cron job in windows to do this in the background
