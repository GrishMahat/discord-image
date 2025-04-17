# Welcome Card Generator Examples

This document provides detailed examples of how to use the welcome card generator for Discord server greetings.

## Basic Usage

The simplest way to create a welcome card:

```typescript
import { welcomeCard } from 'discord-image-utils';
import { AttachmentBuilder } from 'discord.js';

// When a new member joins
client.on('guildMemberAdd', async (member) => {
  try {
    // Generate a welcome card
    const welcomeImg = await welcomeCard({
      username: member.user.username,
      avatar: member.user.displayAvatarURL({ extension: 'png', size: 512 }),
      servername: member.guild.name,
      memberCount: member.guild.memberCount
    });

    // Create an attachment from the welcome image
    const attachment = new AttachmentBuilder(welcomeImg, { name: 'welcome.png' });

    // Send to the welcome channel
    const welcomeChannel = member.guild.channels.cache.find(
      channel => channel.name === 'welcome'
    );

    if (welcomeChannel?.isTextBased()) {
      await welcomeChannel.send({
        content: `Welcome to the server, ${member}!`,
        files: [attachment]
      });
    }
  } catch (error) {
    console.error('Error creating welcome card:', error);
  }
});
```

## Using Different Themes

The welcome card generator comes with several built-in themes:

```typescript
import { welcomeCard } from 'discord-image-utils';

// Creating welcome cards with different themes
async function generateWelcomeCards(username, avatarURL) {
  // Default theme
  const defaultCard = await welcomeCard({
    username,
    avatar: avatarURL,
    servername: "My Discord Server",
    theme: "default" // Blue accents on dark background
  });

  // Dark theme
  const darkCard = await welcomeCard({
    username,
    avatar: avatarURL,
    servername: "My Discord Server",
    theme: "dark" // Discord purple accents on dark background
  });

  // Light theme
  const lightCard = await welcomeCard({
    username,
    avatar: avatarURL,
    servername: "My Discord Server",
    theme: "light" // Discord purple accents on light background
  });

  // Colorful theme
  const colorfulCard = await welcomeCard({
    username,
    avatar: avatarURL,
    servername: "My Discord Server",
    theme: "colorful" // Orange accents on blue background
  });

  // Minimal theme
  const minimalCard = await welcomeCard({
    username,
    avatar: avatarURL,
    servername: "My Discord Server",
    theme: "minimal" // Clean white design
  });

  // Tech theme
  const techCard = await welcomeCard({
    username,
    avatar: avatarURL,
    servername: "My Discord Server",
    theme: "tech" // Futuristic HUD-like design with cyan text
  });

  return {
    defaultCard,
    darkCard,
    lightCard,
    colorfulCard,
    minimalCard,
    techCard
  };
}
```

## Using the Builder API

The builder API provides a more fluent interface for creating welcome cards:

```typescript
import { WelcomeCardBuilder } from 'discord-image-utils';
import { AttachmentBuilder } from 'discord.js';

async function createCustomWelcomeCard(member) {
  // Create a new welcome card builder
  const builder = new WelcomeCardBuilder()
    .setUsername(member.user.username)
    .setAvatar(member.user.displayAvatarURL({ extension: 'png', size: 512 }))
    .setServerName(member.guild.name)
    .setMemberCount(member.guild.memberCount)
    .setTheme('tech')
    .setMessage(`Welcome aboard ${member.user.username}! Enjoy your stay!`);

  // Add a custom background image (optional)
  if (member.guild.bannerURL()) {
    builder.setBackground(member.guild.bannerURL({ extension: 'png', size: 1024 }));
  }

  // Custom colors based on member's highest role color
  const roleColor = member.displayHexColor;
  if (roleColor !== '#000000') {
    builder
      .setTextColor(roleColor)
      .setAvatarBorderColor(roleColor);
  }

  // Render the card
  const welcomeImg = await builder.render();

  // Create an attachment
  return new AttachmentBuilder(welcomeImg, { name: 'welcome.png' });
}
```

## Advanced Customization

You can fully customize the appearance of the welcome card:

```typescript
import { welcomeCard } from 'discord-image-utils';

// Create a fully customized welcome card
async function createBrandedWelcomeCard(username, avatarURL, brandInfo) {
  const customCard = await welcomeCard({
    username,
    avatar: avatarURL,
    servername: brandInfo.serverName,
    memberCount: brandInfo.memberCount,
    background: brandInfo.backgroundImage,
    message: brandInfo.customMessage || `Welcome to ${brandInfo.serverName}!`,
    customization: {
      textColor: brandInfo.primaryColor || "#FFFFFF",
      borderColor: brandInfo.secondaryColor || "#3498db",
      backgroundColor: brandInfo.bgColor || "rgba(23, 23, 23, 0.8)",
      avatarBorderColor: brandInfo.accentColor || "#3498db",
      font: brandInfo.fontFamily || "sans-serif",
      fontSize: brandInfo.fontSize || 28
    }
  });

  return customCard;
}
```

## Using with Discord.js Events

Complete example integrating with Discord.js:

```typescript
import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import { WelcomeCardBuilder } from 'discord-image-utils';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  try {
    // Get welcome channel from guild settings or default to "welcome"
    const welcomeChannelId = getWelcomeChannelId(member.guild.id);
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

    if (!welcomeChannel?.isTextBased()) return;

    // Get guild settings
    const settings = getGuildSettings(member.guild.id);

    // Create welcome card using builder
    const cardBuilder = new WelcomeCardBuilder()
      .setUsername(member.user.username)
      .setAvatar(member.user.displayAvatarURL({ extension: 'png', size: 512 }))
      .setServerName(member.guild.name)
      .setMemberCount(member.guild.memberCount);

    // Apply guild-specific settings if available
    if (settings) {
      if (settings.theme) cardBuilder.setTheme(settings.theme);
      if (settings.welcomeMessage) cardBuilder.setMessage(settings.welcomeMessage);
      if (settings.backgroundColor) cardBuilder.setBackgroundColor(settings.backgroundColor);
      if (settings.textColor) cardBuilder.setTextColor(settings.textColor);
      if (settings.backgroundImage) cardBuilder.setBackground(settings.backgroundImage);
    }

    // Render the card
    const welcomeImg = await cardBuilder.render();

    // Create and send attachment
    const attachment = new AttachmentBuilder(welcomeImg, { name: 'welcome.png' });
    await welcomeChannel.send({
      content: settings?.welcomeText?.replace('{user}', `${member}`) || `Welcome to the server, ${member}!`,
      files: [attachment]
    });

  } catch (error) {
    console.error('Error creating welcome card:', error);
  }
});

// Helper functions to get guild settings (implementation depends on your database)
function getWelcomeChannelId(guildId) {
  // In a real bot, you would fetch this from your database
  return guildSettings[guildId]?.welcomeChannelId || 'welcome';
}

function getGuildSettings(guildId) {
  // In a real bot, you would fetch this from your database
  return guildSettings[guildId] || null;
}

// Example guild settings (replace with your database implementation)
const guildSettings = {
  '123456789012345678': {
    welcomeChannelId: '876543210987654321',
    theme: 'tech',
    welcomeMessage: 'Welcome aboard! We hope you enjoy your stay!',
    welcomeText: 'Hey {user}, welcome to our awesome community!',
    backgroundColor: 'rgba(10, 20, 30, 0.8)',
    textColor: '#00FFFF',
    backgroundImage: 'https://example.com/guild-background.png'
  }
};

client.login(process.env.DISCORD_TOKEN);
```

## Error Handling

Proper error handling when generating welcome cards:

```typescript
import { welcomeCard } from 'discord-image-utils';

async function safeGenerateWelcomeCard(username, avatarURL, servername) {
  try {
    // Validate inputs
    if (!username) throw new Error('Username is required');
    if (!avatarURL) throw new Error('Avatar URL is required');

    // Generate welcome card
    return await welcomeCard({
      username,
      avatar: avatarURL,
      servername: servername || 'Discord Server'
    });
  } catch (error) {
    console.error('Failed to generate welcome card:', error);

    // Handle different error types
    if (error.message.includes('valid avatar URL')) {
      // Fall back to default avatar
      return await welcomeCard({
        username,
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
        servername: servername || 'Discord Server'
      });
    }

    // Return a fallback image or re-throw
    throw error;
  }
}
```

## Customization Tips

- **For consistent branding**: Store your server's theme preferences in a database
- **For seasonal themes**: Rotate welcome card themes based on holidays or events
- **For role-based customization**: Use different themes or colors based on the member's assigned roles
- **For advanced customization**: Extend the WelcomeCardBuilder class with your own methods

## Resources

- Discord.js Guide: [Working with Images](https://discordjs.guide/popular-topics/canvas.html)
- Canvas Documentation: [npm canvas package](https://www.npmjs.com/package/canvas)
