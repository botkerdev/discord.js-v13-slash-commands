const { token, prefix } = require('./config.json')
const { Client, Intents, Collection, MessageEmbed, Interaction } = require('discord.js')
const client = new Client({ intents: 32767 })
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs")
module.exports = client;
client.login(token)
client.slashcommands = new Collection()
client.once('ready', () => {
    let number = 0
    setInterval(() => {
        const list = [`!도움말ㅣ${client.guilds.cache.size}개의 서버에서 일`]
        if (number == list.length) number = 0
        client.user.setActivity(list[number], {
            type: "PLAYING"
        })
        number++
    }, 5000)
    console.log("봇이 준비되었습니다")
})
//슬커 핸들
let slashcommands = [];
const slashcommandsFile = fs
  .readdirSync("./slashcommands")
  .filter((file) => file.endsWith(".js"));
for (const file of slashcommandsFile) {
  const slashcommand = require(`./slashcommands/${file}`);
  client.slashcommands.set(slashcommand.name, slashcommand);
  slashcommands.push({ name: slashcommand.name, description: slashcommand.description });
}
const rest = new REST({ version: "9" }).setToken(token);
// REST 부분(봇 아이디 꼭 입력하세요. 아이디 불러오면 안되더라고요.
rest
  .put(Routes.applicationCommands("본인 봇 아이디"), { body: slashcommands })
  .then(() => console.log("Command Pushed on all servers"))
  .catch(console.error);
  
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const slashcommand = client.slashcommands.get(interaction.commandName);
  if (!slashcommand) return;
  try {
    await slashcommand.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply(
      new discord.MessageEmbed()
        .setTitle("오류가 발생했습니다")
        .setDescription("오류가 발생하였습니다.신속한 조치 취하도록 하겠습니다")
    );
  }
});

// 오류 무시
process.on("unhandledRejection", err => {
    if(err == "DiscordAPIError: Missing Access") return console.log("봇 오류.(Discord API 슬커 푸쉬 오류)")
    console.error(err)
})
// 일커 핸들
client.commands = new Collection()

const commandsFile = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandsFile) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix)) return
    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift()
    const command = client.commands.get(commandName)
    if (!command) return
    try {
        command.execute(message, args)
    } catch (error) {
        console.error(error)
    }
})
