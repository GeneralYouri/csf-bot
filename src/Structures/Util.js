const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const Command = require('./Command.js');
const SlashCommand = require('./SlashCommand.js');
const Event = require('./Event.js');

module.exports = class Util {
    constructor(client) {
        this.client = client;
    }

    get directory() {
        return `${path.dirname(require.main.filename)}${path.sep}`;
    }

    isClass(input) {
        return (
            typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class'
        );
    }

    removeDuplicates(arr) {
        return [...new Set(arr)];
    }

    async loadCommands() {
        return glob(`${this.directory}Commands/**/*.js`).then((commands) => {
            for (const commandFile of commands) {
                delete require.cache[commandFile];
                const { name } = path.parse(commandFile);
                const File = require(commandFile);
                if (!this.isClass(File))
                    throw new TypeError(`Command ${name} doesn't export a class.`);
                const command = new File(this.client, name.toLowerCase());
                if (!(command instanceof Command))
                    throw new TypeError(`Command ${name} is not a Command.`);
                this.client.commands.set(command.name, command);
                if (command.aliases.length) {
                    for (const alias of command.aliases) {
                        this.client.aliases.set(alias, command.name);
                    }
                }
            }
        });
    }

    async loadSlashCommands() {
        return glob(`${this.directory}SlashCommands/**/*.js`).then((commands) => {
            for (const commandFile of commands) {
                delete require.cache[commandFile];
                const { name } = path.parse(commandFile);
                const File = require(commandFile);
                if (!this.isClass(File))
                    throw new TypeError(`Slash Command ${name} doesn't export a class.`);
                const command = new File(this.client, name.toLowerCase());
                if (!(command instanceof SlashCommand))
                    throw new TypeError(`Slash Command ${name} is not a Slash Command.`);
                this.client.slashcommands.set(command.name, command);
                if (command.aliases.length) {
                    for (const alias of command.aliases) {
                        this.client.slashaliases.set(alias, command.name);
                    }
                }
            }
        });
    }

    async loadEvents() {
        return glob(`${this.directory}Events/**/*.js`).then((events) => {
            for (const eventFile of events) {
                delete require.cache[eventFile];
                const { name } = path.parse(eventFile);
                const File = require(eventFile);
                if (!this.isClass(File))
                    throw new TypeError(`Event ${name} doesn't export a class!`);
                const event = new File(this.client, name);
                if (!(event instanceof Event))
                    throw new TypeError(`Event ${name} is not an Event`);
                this.client.events.set(event.name, event);
                event.emitter[event.type](name, (...args) => event.run(...args));
            }
        });
    }
};
