const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')
const request = require("request");
const cheerio = require("cheerio");

/* FUNCTION HELL */ // TODO: Import this shit from another file
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
		.setName('guild')
		.setDescription('Look up a Rucoy guild!')
    .addStringOption(option => option.setName('name').setDescription("The guild you're looking up").setRequired(true)),

	async execute(interaction) {

    let guild = toTitleCase(interaction.options.getString('name'))
    let urlname = guild.replaceAll(" ", "%20");

    request(`https://www.rucoyonline.com/guild/${urlname}`, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const guildName = $("h3").text();
        const guildDescription = $("p").text().substring(0,$("p").text().indexOf("Founded on"));
        const guildFounded = $("p").text().substring($("p").text().indexOf("Founded on") + 11,$("p").text().length);
        const guildMembers = $("tbody").find("tr").length;

        let leader = "no-leader?";
          $("tr").each(function() {
            $(this).find("td").each(function() {
              if ($(this).text().includes("(Leader)")) leader = $(this).text().substring(0,$(this).text().indexOf("(")).trim();
            });
          });

        if (leader === "no-leader?") {
          return interaction.reply({content: "Guild not found.", ephemeral: true}).catch(console.error)
        }

        let guildEmbed = new Discord.MessageEmbed()
          .setTitle(guild)
          .setDescription(guildDescription)
          .addField("Founded", guildFounded, true)
          .addField("Members", guildMembers.toString(), true)
          .addField("Leader", `[${leader}](https://www.rucoyonline.com/characters/${leader.replaceAll(" ", "%20")})`, true)
          .setColor("#21ba45")
          .setURL(`https://www.rucoyonline.com/guild/${urlname}`);

        interaction.reply({embeds: [guildEmbed]}).catch(console.error)

        } else return interaction.reply({content: "There was an error finding that guild:\n```" + error + "```", ephemeral: true}).catch(console.error);
      }
    );
	},
};