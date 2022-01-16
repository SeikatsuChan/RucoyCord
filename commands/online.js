const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')
const request = require("request");
const cheerio = require("cheerio");

/* FUNCTION HELL */
function commaNum(val) {
  while (/(\d+)(\d{3})/.test(val.toString())) {
    val = val.toString().replace(/(\d+)(\d{3})/, "$1" + "," + "$2");
  }
  return val;
}

/* ACTUAL COMMAND */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('online')
		.setDescription('Check how many people are playing Rucoy!'),

	async execute(interaction) {
    request("https://www.rucoyonline.com", (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        let onlineCount = "0";
        let serverCount = "0";
        $("p").each(function() {
          if ($(this).text().includes("characters")) {
            onlineCount = $(this).text().substring(0,$(this).text().indexOf("characters")).trim();
            serverCount = $(this).text().substring($(this).text().indexOf("online") + 10,$(this).text().indexOf("servers")).trim();
          }
        });
        let countEmbed = new Discord.MessageEmbed()
          .setColor("#21ba45")
          .setTitle("Rucoy Online")
          .addField("Players Online", commaNum(onlineCount), true)
          .addField("Servers", serverCount, true)
          .setURL("https://www.rucoyonline.com")
          .setThumbnail("https://www.rucoyonline.com/assets/favicon/favicon-32x32-b4cafe4c726eace2f4165a0f0d185266103ba79598a894886a312e9e6effaa9a.png");

        interaction.reply({embeds: [countEmbed]})
        } else {
          return interaction.reply({content: "There was an error finding the player count:\n```" + error + "```", ephemeral: true});
        }
    });
	},
};