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
function commaNum(val) {
  while (/(\d+)(\d{3})/.test(val.toString())) {
    val = val.toString().replace(/(\d+)(\d{3})/, "$1" + "," + "$2");
  }
  return val;
}
function rucoyToObject(str) {
  var obj = {
    name: 0,
    level: 0,
    guild: 0,
    last_online: 0,
    born: 0
  };
  var newStr = str
    .split("\n")
    .map(x => x.trim())
    .filter(function(x) {
      return x != null;
    })
    .filter(function(x) {
      return x != "";
    });
  newStr.forEach(function(v) {
    if (v === "Name") {
      obj["name"] = 1;
    } else if (obj["name"] == 1) {
      obj["name"] = v;
    } else if (v === "Level") {
      obj["level"] = 1;
    } else if (obj["level"] == 1) {
      obj["level"] = v;
    } else if (v === "Guild") {
      obj["guild"] = 1;
    } else if (obj["guild"] == 1) {
      obj["guild"] = v;
    } else if (v === "Last online") {
      obj["last_online"] = 1;
    } else if (obj["last_online"] == 1) {
      obj["last_online"] = v;
    } else if (v === "Born") {
      obj["born"] = 1;
    } else if (obj["born"] == 1) {
      obj["born"] = v;
    }
  });
  return obj;
}

/* ACTUAL COMMAND */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('player')
		.setDescription('Look up a Rucoy character!')
    .addStringOption(option => option.setName('name').setDescription("The character you're looking up").setRequired(true)),

	async execute(interaction) {
    let char = interaction.options.getString('name')

    request(`https://www.rucoyonline.com/characters/${char}`, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const charHeading = $("h3");
        const charInfo = $("tbody").first();
        const pvpInfo = $("tbody").last();

        let character = rucoyToObject(charInfo.text());

        if (character.name == 0) {
          return interaction.reply({content: "Character not found.", ephemeral: true}).catch(console.error);
        }

        let urlname = character.name.replaceAll(" ", "%20");
        let color = "#00ff00";
        if (charHeading.text().includes("Supporter")) color = "#00bfff";
        if (charHeading.text().includes("Banned")) color = "#ff0000";
        if (character.name === "Seikatsu Crazy" || character.name === "Not Seikatsu") color = "#b273eb";
        if (!character.born || !character.last_online && !charHeading.text().includes("Game Master")) {
          character.last_online = "Level one characters with"
          character.born = "no guild break the bot."
        }
        
        if (character.level === "Guild" || character.level === "Last online") character.level = "1"
        
        if (charHeading.text().includes("Game Master")) {
          var charEmbed = new Discord.MessageEmbed()
            .setTitle(character.name)
            .setURL(`https://www.rucoyonline.com/characters/${urlname}`)
            .setColor("#ffff00")
            .addField("Guild", `[${character.guild}](https://www.rucoyonline.com/guild/${character.guild.replaceAll(" ","%20")})`)
            .addField("Born", character.born, true);
        } else if (character.guild != 0) {
          var charEmbed = new Discord.MessageEmbed()
            .setTitle(character.name)
            .setURL(`https://www.rucoyonline.com/characters/${urlname}`)
            .setColor(color)
            .addField("Level", character.level)
            .addField("Guild", `[${character.guild}](https://www.rucoyonline.com/guild/${character.guild.replaceAll(" ","%20")})`)
            .addField("Last Online", character.last_online, true)
            .addField("Born", character.born, true);
        } else {
          var charEmbed = new Discord.MessageEmbed()
            .setTitle(character.name)
            .setURL(`https://www.rucoyonline.com/characters/${urlname}`)
            .setColor(color)
            .addField("Level", character.level)
            .addField("Last Online", character.last_online, true)
            .addField("Born", character.born, true);
        }

         interaction.reply({ embeds: [charEmbed] }).catch(console.error);

      } else {
          interaction.reply({content: "There was an error fetching the character:\n```js\n" + error + "\n```", ephemeral: true}).catch(console.error);
        }
      }
    );
	},
};