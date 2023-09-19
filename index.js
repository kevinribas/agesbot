const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');

// set up dotenv
const dotenv = require('dotenv');
dotenv.config();
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// set up fs and path
const fs = require('node:fs');
const path = require('node:path');

// set up client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// set up commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// load commands
for (const file of commandFiles) {
    console.log(`Carregando comando ${file}`)
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`Erro ao carregar comando em ${filePath} está sem data ou execute`);
    }
}

// bot log in
client.once(Events.ClientReady, c => {
	console.log(`Pronto! Login realizado como ${c.user.tag}`);
});
client.login(TOKEN);

// set up interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Comando não encontrado`);
        return;
    }
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
    }
});