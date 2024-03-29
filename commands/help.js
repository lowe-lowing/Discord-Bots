const Discord = require('discord.js');
const { prefix } = require('../config.json');
module.exports = {
    name: 'help',
    description: 'A list of all the commands',
    aliases: ['commands', 'h'],
    usage: '[command name]',
    cooldown: 5,
    args: true,
    argsNeeded: false,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            const embed = new Discord.MessageEmbed()
                .setTitle('Here\'s a list of all my commands:')
                .setColor("#0036FF")
                .setDescription(commands.map(command => command.name).join(', '))
                .setFooter("You can send \`${prefix}help [command name]\` to get info on a specific command!");
            // data.push('Here\'s a list of all my commands:');
            // data.push(commands.map(command => command.name).join(', '));
            // data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

            return message.channel.send(embed)
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
	        return message.reply('that\'s not a valid command!');
        }
        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        const embed = new Discord.MessageEmbed()
                .setTitle(`**Command:** ${command.name}`)
                .setColor("#0036FF")
                .setDescription(data)

        message.channel.send(embed);
    },
};