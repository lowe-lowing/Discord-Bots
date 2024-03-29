const fs = require('fs');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const { prefix, token } = require('./config.json');
const { data } = require('./chema.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.MemberStatus = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();
let msg;
client.once('ready', async () => {
    // console.log(client);
    console.log(`Logged in as ${client.user.tag}!`)
    setInterval(() => {
        joinChannel();
    }, 1000);
    
    // // delete one message in lesson channels
    // client.channels.cache.get("811539777722515456").bulkDelete(1, true).catch(err => {console.error(err);});
    
    // // Send message & Store reference to the message
    // const embed = new Discord.MessageEmbed()
    //     .setTitle("Starting soon...")
    // msg = await client.channels.cache.get("811539777722515456").send(embed);

    // setInterval(() => {
    //     checklesson();
    // }, 10000);
});

client.login(token)

function joinChannel() {
    // console.log(client.guilds.cache.length);
    const serverCache = client.guilds.cache.array()
    serverCache.forEach(server => {
        const firstChannelinServer = server.channels.cache.filter((c) => c.type == 'voice').array()[0];
        const playersInChannel = [];
        firstChannelinServer.members.forEach((member) => { // For every member
        playersInChannel.push(member.user.username)
        });
        if (playersInChannel.length == 1 && playersInChannel[0] == client.user.username) {
            firstChannelinServer.leave();
        }
    });
}
client.on('voiceStateUpdate', (oldMember, newMember) => {
    try {
        const firstChannelinServer = newMember.guild.channels.cache.filter((c) => c.type == 'voice').array()[0];
        if (oldMember.channelID === null && newMember.id != client.user.id) {
            // firstChannelinServer.join();
            const user = firstChannelinServer.members.find(user => user.id === newMember.id)
            console.log(`${user.nickname || user.user.username} joined`);
            client.commands.get("voice").execute(user, newMember.guild)
        }
        else if (newMember.channelID === null && oldMember.id != client.user.id) {
           console.log("someone left");
        }
    } catch (error) {
        console.log(error);
    }
  })

client.on('message', async message => {	
    if (message.content.includes("fortnite")) {
        if (message.member.voice.channel) {
            let connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=hjSlY2iBXuw',
            {filter: 'audioonly'}));
            
            //dispatcher.setVolume(0.3);
            
            dispatcher.on("finish", finish => {
                connection = message.member.voice.channel.leave();
            });
            
        }  else {
            message.reply('You need to join a voice channel first!');
        }
    }
    if (message.content.substring(0, 1) == prefix) {
        const args = message.content.slice(prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.guildOnly && message.channel.type === 'dm') {
            return message.reply('I can\'t execute that command inside DMs!');
        }

        if (command.args && !args.length && command.argsNeeded == true) {
            let reply = `You didn't provide any arguments, ${message.author}!`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }

            return message.channel.send(reply);
            //return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
            //---------------------------------------- alla send functioner behöver fixas ------------------------------------------------------
        }

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`please wait ${timeLeft.toFixed(1)} more seconds before reusing the \`${command.name}\` command.\nCooldown: ${command.cooldown} Seconds`);
            }
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!')
        }
    }
    
});

// <--------------------------------------------------- Check Lesson -------------------------------------------->
// this function is not in use due to summer break and no lessons
function checklesson(){
    // date and time conficuration
    var date = new Date();
    var day = date.getDay();
    var h = date.getHours();
    var min = date.getMinutes();

    // the amount of minutes that has passed;
    var current = (h*60) + min + 120;

    // array of all lesson objects
    const LessonInfo = data.lessonInfo

    // ordered and unordered lists
    var orderedLesTime = [];
    var unorderedLesTime = [];
    var orderedLesEnd = [];
    var orderedLessons = [];
    var unordedLessons = [];
    var StartTimeInNormalTime = [];
    var EndTimeInNormalTime = [];


    LessonInfo.forEach(element => {
        const dayOfWeek = element.dayOfWeekNumber;
        const lesson = element.texts[0];

        // here i need to get hours and minutes into minutes
        const timeStart = element.timeStart.split(":");
        const StartInMinutes = +timeStart[0]*60 + +timeStart[1];

        const timeEnd = element.timeEnd.split(":");
        const EndInMinutes = +timeEnd[0]*60 + +timeEnd[1]

        if (day == dayOfWeek) {
            orderedLesTime.push(StartInMinutes)
            unorderedLesTime.push(StartInMinutes)
            orderedLesEnd.push(EndInMinutes)
            unordedLessons.push(lesson)
            StartTimeInNormalTime.push(element.timeStart.substring(0, element.timeStart.length-3));
            EndTimeInNormalTime.push(element.timeEnd.substring(0, element.timeEnd.length-3));
        }
    });

    // Sort the time in minutes lists
    orderedLesTime.sort(function(a, b) {
        return a - b;
    });
    orderedLesEnd.sort(function(a, b) {
        return a - b;
    });
    // remove distansundervisning
    if (orderedLesTime[0] == 480) {
        orderedLesTime.shift()
    }
    if (orderedLesEnd[orderedLesEnd.length-1] == 1020){
        orderedLesEnd.pop(orderedLesEnd[orderedLesEnd.length-1]);
    }
    // sort normal time lists
    StartTimeInNormalTime.sort(function(a, b) {
        return a.localeCompare(b);
    });
    EndTimeInNormalTime.sort(function(a, b) {
        return a.localeCompare(b);
    });
    // remove distansundervisning
    if (StartTimeInNormalTime[0] == '08:00') {
        StartTimeInNormalTime.shift()
    }
    if (EndTimeInNormalTime[EndTimeInNormalTime.length-1] == '17:00'){
        EndTimeInNormalTime.pop(EndTimeInNormalTime[EndTimeInNormalTime.length-1]);
    }
    

    for (let i = 0; i < orderedLesTime.length; i++) {
        const element = orderedLesTime[i];
        const currentObj = element;
        if (orderedLesTime[i] == orderedLesTime[i-1]) {
        }else {
            for (let i = 0; i < unorderedLesTime.length; i++) {
                const element = unorderedLesTime[i];
                if (element == currentObj) {
                    orderedLessons.push(unordedLessons[i])
                }
            }
        }
    }
    for (let i = 0; i < orderedLesTime.length; i++) {
        let lessonStarttime = orderedLesTime[i];
        let lessonEndtime = orderedLesEnd[i];
        let previousLessonEndtime = orderedLesEnd[i-1];
        if ((current >= previousLessonEndtime && current <= lessonStarttime) || current == 0) {
            const embed = new Discord.MessageEmbed()
                .setColor("#0036FF")
                .setTitle("Lektioner:")
                .addFields(
                    { name: "Kommande Lektion: ", value: `--------------------------\n**${orderedLessons[i]}**\nBörjar: ${StartTimeInNormalTime[i]}`, inline: true},
                    )
            return msg.edit(embed);
        }
        else if (current >= lessonStarttime && current <= lessonEndtime) {
            if (orderedLessons[i+1] == undefined) {
                const embed = new Discord.MessageEmbed()
                    .setColor("#0036FF")
                    .setTitle("Lektioner:")
                    .addFields(
                        { name: "Nuvarande Lektion: ", value: `--------------------------\n**${orderedLessons[i]}**\nSlutar: ${EndTimeInNormalTime[i]}`, inline: true},
                        { name: "Nästa Lektion:", value: `--------------------------\n**Slut på dagen**`, inline: true},
                        )
                return msg.edit(embed);
            }
            else {
                const embed = new Discord.MessageEmbed()
                    .setColor("#0036FF")
                    .setTitle("Lektioner:")
                    .addFields(
                        { name: "Nuvarande Lektion: ", value: `--------------------------\n**${orderedLessons[i]}**\nSlutar: ${EndTimeInNormalTime[i]}`, inline: true},
                        { name: "Nästa Lektion:", value: `--------------------------\n**${orderedLessons[i+1]}**\nBörjar: ${StartTimeInNormalTime[i+1]}`, inline: true},
                        )
                return msg.edit(embed);
            }           
        } else if (current >= orderedLesEnd[orderedLesEnd.length - 1]) {
            const embed = new Discord.MessageEmbed()
                .setColor("#0036FF")
                .setTitle("Lektioner:")
                .setDescription("**Inga fler lektioner idag**")
            return msg.edit(embed);
        }
    }
}
