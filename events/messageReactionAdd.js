const { MessageEmbed } = require("discord.js")
module.exports = async (client, reaction, user) => {
    let responses = []
    let imageResponse = false;
    for (post of client.config.posts) {
        if (reaction.message.id === post.message && (reaction.emoji.name === post.reaction || reaction.emoji.id === post.reaction)) {
            reaction.users.remove(user.id)
            await user.send({ embed: post.startMessage });
            for (let i = 0; i < post.questions.length; i++) {
                let sent = await user.send(new MessageEmbed().setDescription(post.questions[i].question).setColor("GREEN"))
                let collected = await sent.channel.awaitMessages(x=> x.author.id === user.id, {max: 1})
                let response = collected.first()
                if (post.questions[i].type.toLowerCase() === "file") {
                    let attachment = response.attachments.first()
                    if (attachment) imageResponse = attachment.proxyURL
                }
                else responses.push({question: post.questions[i].question, response: response.content})
            }
            await user.send({embed: post.endMessage});
            let channel = client.channels.cache.get(post.channel);
            let embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle(post.title.replace("{{USER}}", user.tag))
            .setFooter(post.footer.replace("{{USER}}", user.tag), post.footerImage.replace("{{USER AVATAR}}", user.displayAvatarURL()))
            .setThumbnail(user.displayAvatarURL())
            for (let i = 0; i < responses.length; i++) {
                let response = responses[i]
                embed.addField(response.question, response.response)
            }
            if (imageResponse) embed.setImage(imageResponse);
            channel.send(embed)

        }
    }
}