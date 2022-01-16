const express = require('express');
const server = express();
server.all('/', (req, res)=>{
    res.send('Seikatsu was here')
})

function keepAlive(){
    server.listen(3000, ()=>{console.log("Server is Ready!")});
}
////////////////////////////////////////////////////////////////////
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const config = require("./config.json")

/* COMMAND HANDLER */
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

/* STARTUP STUFF */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

/* COMMAND EXECUTION */
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!\n```\n' + error + "\n```", ephemeral: true });
	}
});

keepAlive();
client.login(process.env.TOKEN);
