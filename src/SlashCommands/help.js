const { MessageEmbed, EmbedBuilder } = require('discord.js');
const SlashCommand = require('../Structures/SlashCommand');

module.exports = class extends SlashCommand {
    constructor(...args) {
        super(...args, {
            aliases: [],
            description: 'Displays all the commands in the bot',
            category: 'Utilities',
            usage: '[command]',
        });
    }

    async run(interaction) {
        const command = interaction?.options?.get('command')?.value;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setThumbnail(this.client.user.displayAvatarURL())
            .setFooter({
                text: `Requested by ${interaction.author.username}`,
                iconUrl: interaction.author.displayAvatarURL(),
            })
            .setTimestamp();

        if (command) {
            const cmd =
                this.client.slashcommands.get(command) ||
                this.client.slashcommands.get(this.client.slashaliases.get(command));

            if (!cmd)
                return interaction.reply({
                    content: `Invalid Command named. \`${command}\``,
                    ephemeral: true,
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

            return interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        } else {
            embed.setAuthor({
                name: `${interaction.guild.name} Help Menu`,
                iconURL: interaction.guild.iconURL(),
            });
            embed.setDescription(
                `These are the available commands for ${interaction.guild.name}\n\
                The bot's prefix is: ${this.client.prefix}\n\
                Command Parameters: \`<>\` is strict & \`[]\` is optional`
            );
            let categories;
            if (!this.client.owners.includes(interaction.author.id)) {
                categories = this.client.utils.removeDuplicates(
                    this.client.slashcommands
                        .filter((cmd) => cmd.category !== 'Owner')
                        .map((cmd) => cmd.category)
                );
            } else {
                categories = this.client.utils.removeDuplicates(
                    this.client.slashcommands.map((cmd) => cmd.category)
                );
            }

            for (const category of categories) {
                embed.addFields([{
                    name:`**${category}**`,
                    value: this.client.slashcommands
                        .filter((cmd) => cmd.category === category)
                        .map((cmd) => `\`${cmd.name}\``)
                        .join(' ')
                }]);
            }
            return interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    }
};
