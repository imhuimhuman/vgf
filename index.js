const { Client, GatewayIntentBits, Collection, ContextMenuCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token} = require('./config.json');


 

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildVoiceStates,

	],
});
const invsPath = './models/invites.json';
const invitedUsersPath = './models/invitedUsers.json';

function loadInviteData() {
    if (fs.existsSync(invsPath)) {
        const jsonData = fs.readFileSync(invsPath, 'utf8');
        return JSON.parse(jsonData);
    }
    return {};
}

function loadInvitedUsers() {
    if (fs.existsSync(invitedUsersPath)) {
        const jsonData = fs.readFileSync(invitedUsersPath, 'utf8');
        return JSON.parse(jsonData);
    }
    return {};
}

function saveInviteData(data) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(invsPath, jsonData, 'utf8');
}

function saveInvitedUsers(data) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(invitedUsersPath, jsonData, 'utf8');
}


client.cooldowns = new Collection();
const InviteManager = require('discord-invite');
const invClient = new InviteManager(client);



client.on("memberJoin",async(member,inviter,invite) => {
    try {

        if (member.guild.id !== '1234569536913543268') return;

            console.log(`${member.user} joined using invite ${invite.code} from ${inviter.username}`);
            // Check if invite isss vanity
            if (invite.code === member.guild.vanityURLCode) {
                console.log(`${member.user} joined using vanity invite`);

            }
  

            const inviteData = loadInviteData();
            const userInvs = loadInvitedUsers();
            const inviterKey = `${inviter.id}-${member.guild.id}`;

            const accountCreationDate = member.user.createdAt;
            const accountAgeInDays = (Date.now() - accountCreationDate.getTime()) / (24 * 60 * 60 * 1000);

            // Update invite data based on account age
            if (accountAgeInDays < 14) {
                // Handle fake account scenarios
                if (!inviteData[inviterKey]) {
                    inviteData[inviterKey] = { invites: 0, leaves: 0, bonus: 0, fake: 1 };
                } else {
                    inviteData[inviterKey].fake += 1;
                }
            } else {
                // Handle normal account scenarios
                if (!inviteData[inviterKey]) {
                    inviteData[inviterKey] = { invites: 1, leaves: 0, bonus: 0, fake: 0 };
                } else {
                    inviteData[inviterKey].invites += 1;
                }
            }

            // Update userInvs with the new member ID
            if (!userInvs[inviterKey]) {
                userInvs[inviterKey] = [member.id];
            } else {
                userInvs[inviterKey].push(member.id);
            }

            // Save updated data to files
            saveInviteData(inviteData);
            saveInvitedUsers(userInvs);
    } catch (err) {
        console.log(err);
    }


})

client.on("memberLeave",async(member,inviter,invite) => {
    try {
        if (member.guild.id !== '1234569536913543268') return;

            const inviteData = loadInviteData();
            const userInvs = loadInvitedUsers();
            if (invite.code === member.guild.vanityURLCode) return;

            const inviterKey = `${inviter.id}-${member.guild.id}`;
            
            // Update invite data
            if (inviteData[inviterKey]) {
                inviteData[inviterKey].leaves += 1;
                inviteData[inviterKey].invites -= 1;


            }

            
            // Update userInvs with the new member ID
            if (userInvs[inviterKey]) {
                const index = userInvs[inviterKey].indexOf(member.id);
                if (index > -1) {
                    userInvs[inviterKey].splice(index, 1);


                }



            }
            // Save updated data to files
            saveInviteData(inviteData);
            saveInvitedUsers(userInvs);
    } catch (err) {
        console.log(err);
    }

})

client.on('interactionCreate', async message => {
    

        if (!message.isButton()) return;
        if (message.customId != 'check_invites') return;



        const inviteData = loadInviteData();
        const ID = message.member.id;
        await message.deferReply({ephemeral: true});
        if (!inviteData[`${ID}-${message.guild.id}`]) {
            inviteData[`${ID}-${message.guild.id}`] = {
                invites: 0,
                leaves: 0,
                bonus: 0,
                fake: 0,                  
            }
            saveInviteData(inviteData);


        }
        else {
            guildInvs = inviteData[`${ID}-${message.guild.id}`];
            embed = new EmbedBuilder()
            .setTitle('Invite Data')
            .setDescription(`You have ${guildInvs.invites} invites (**${guildInvs.fake} fake, ${guildInvs.leaves} leaves, ${guildInvs.leaves+guildInvs.fake+guildInvs.bonus+guildInvs.invites} joins and ${guildInvs.bonus} bonus **)`)
            .setColor('#206694');
            message.followUp({embeds: [embed], ephemeral: true});



        }

    }

)    

client.once('ready', async () => { 
    try {
        console.log('Ready!');
        const mg = client.guilds.cache.get('1234569536913543268')
        const channel = mg.channels.cache.get('1236380292046917733')
        const msgs = await channel.messages.fetch();
        if (msgs.has('1236646726404935720')) return console.log('Already sent message')


        const embed = new EmbedBuilder()
        .setTitle('Check your invites!')
        .setDescription("- Make sure the people invited accept the invite!\n- Use the <#1234867605320372285> channel to earn invites fast!\n- Send a photo of this channel after presing the button with your invites to <@976409222499668028> to claim!")
        .setImage('https://media.discordapp.net/attachments/983402064703012907/1010190658222436362/robuxlol.png?ex=66383d9d&is=6636ec1d&hm=f3e750bcd5fe5fb239b4164576e0a7c438d39cb8c6d61339841e514c07f70d8e&format=webp&quality=lossless&width=1440&height=480&')
        .setThumbnail(mg.iconURL())
        .setColor('#206694');

        const b = new ButtonBuilder()
        .setStyle('1')
        .setLabel('Check Invites')
        .setCustomId('check_invites')
        .setEmoji('📝');
        const row = new ActionRowBuilder().addComponents(b);


        await channel.send({embeds: [embed], components: [row]});


    }
    catch (err) {
        console.log(err);
    }
});





client.login(token);

