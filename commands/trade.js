const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')
const request = require("request");
const cheerio = require("cheerio");

/* FUNCTION HELL */
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/* ACTUAL COMMAND */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('trade')
		.setDescription('Make a post to the cross-server market!')
    .addStringOption(option => 
      option
      .setName("type")
      .setDescription("Want to buy, or sell?")
      .addChoices([
        ['I want to sell', 'sell'],
        ['I want to buy', 'buy']
      ])
      .setRequired(true)
    )
    .addStringOption(option =>
      option
      .setName("item")
      .setDescription("What do you want to buy/sell?")
      .setRequired(true)
    )
    .addStringOption(option => 
      option
      .setName("offer")
      .setDescription("What are you offering in return?")
      .setRequired(true)
    )
    .addStringOption(option =>
      option
      .setName("ign")
      .setDescription("The in game name of your Rucoy account?")
    ),

	async execute(interaction) {
    let tradeType = interaction.options.getString("type")
    let item = interaction.options.getString("item")
    let offer = interaction.options.getString("offer")

    if(tradeType === "sell") { var color = "#00FF00" } else { var color = "#FF0000" }

    if(item.toLowerCase().includes("acc") || item.toLowerCase().includes("account") || offer.toLowerCase().includes("acc") || offer.toLowerCase().includes("account")) {
      return interaction.reply({content: "Sorry, account trading is not allowed. Trying to evade this filter will result in a permanent ban from market commands.", ephemeral: true})
    }

    let tradeEmbed = new Discord.MessageEmbed()
    .addField("Offer", offer)
    .setColor(color)
    .setFooter({ text: `Posted by ${interaction.user.tag}`})

    if(tradeType === "sell") {
      tradeEmbed.setTitle(`Selling ${item}`)
    } else {
      tradeEmbed.setTitle(`Buying ${item}`)
    }

    if(interaction.options.getString("ign")) {
      tradeEmbed.addField("Poster's IGN", `[${toTitleCase(interaction.options.getString("ign"))}](https://www.rucoyonline.com/characters/${toTitleCase(interaction.options.getString("ign")).replaceAll(" ", "%20")})`)
    }

    interaction.client.guilds.cache.forEach(guild => {
      let sellchannel = guild.channels.cache.find(c => c.name === 'market' || c.name === "trade-board" || c.name === "🛒-trade-chat");
      let sellchannelid = sellchannel ? sellchannel.id : null;
      if(sellchannelid != null) {
        if(sellchannel.permissionsFor(guild.members.cache.get(interaction.client.user.id)).has(['EMBED_LINKS', 'SEND_MESSAGES'])) {
          try{
            guild.channels.cache.get(sellchannelid).send({embeds: [tradeEmbed]})
          } catch(err) {
            console.log(err)
          }
        }
      } 
    })
    interaction.reply({content: "Your trade is being posted!", ephemeral: true})
	},
};