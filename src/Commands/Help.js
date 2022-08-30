const { EmbedBuilder } = require('discord.js');
const Command = require('../Structures/Command');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['halp'],
            description: 'Displays all the commands in the bot',
            category: 'Utilities',
            usage: '[command]',
        });
    }

    async run(message, [command]) {
        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setThumbnail(this.client.user.displayAvatarURL())
            .setFooter({
                text: `Requested by ${message.author.username}`,
                iconUrl: message.author.displayAvatarURL(),
            })
            .setTimestamp();

        if (command) {
            const cmd =
                this.client.commands.get(command) ||
                this.client.commands.get(this.client.aliases.get(command));

            if (!cmd)
                return message.reply({
                    content: `Invalid Command named. \`${command}\``,
                });
            embed.setAuthor({
                name: `${cmd.name} Command Help`,
                iconURL: this.client.user.displayAvatarURL()
            });
            embed.setDescription(
                `**❯ Aliases:** ${
                    cmd.aliases.length
                        ? cmd.aliases.map((alias) => `\`${alias}\``).join(' ')
                        : 'No Aliases'
                }\n\
                **❯ Description:** ${cmd.description}\n\
                **❯ Category:** ${cmd.category}\n\
                **❯ Usage:** ${cmd.usage}`
            );

            return message.reply({
                embeds: [embed],
            });
        } else {
            embed.setAuthor({
                name: `${message.guild.name} Help Menu`,
                iconURL: message.guild.iconURL(),
            });
            embed.setDescription(
                `These are the available commands for ${message.guild.name}\n\
                The bot's prefix is: ${this.client.prefix}\n\
                Command Parameters: \`<>\` is strict & \`[]\` is optional`
            );
            let categories;
            if (!this.client.owners.includes(message.author.id)) {
                categories = this.client.utils.removeDuplicates(
                    this.client.commands
                        .filter((cmd) => cmd.category !== 'Owner')
                        .map((cmd) => cmd.category)
                );
            } else {
                categories = this.client.utils.removeDuplicates(
                    this.client.commands.map((cmd) => cmd.category)
                );
            }

            for (const category of categories) {
                embed.addFields([{
                    name:`**${category}**`,
                    value: this.client.commands
                        .filter((cmd) => cmd.category === category)
                        .map((cmd) => `\`${cmd.name}\``)
                        .join(' ')
                }]);
            }
            return message.reply({
                embeds: [embed],
            });
        }
    }
};
