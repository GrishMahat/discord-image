# Level Card Generator Examples

This document provides detailed examples of how to use the level card generator for Discord user progression tracking.

## Basic Usage

The simplest way to create a level card:

```typescript
import { level } from 'discord-image-utils';
import { AttachmentBuilder } from 'discord.js';

// When a command is used or a user gains XP
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== 'level') return;

  try {
    // Get user data from your database
    const userData = await getUserData(interaction.user.id);

    // Generate a level card
    const levelImg = await level({
      name: interaction.user.username,
      level: userData.level,
      avatar: interaction.user.displayAvatarURL({ extension: 'png', size: 512 }),
      xp: userData.xp,
      maxXp: userData.maxXp
    });

    // Create an attachment from the level image
    const attachment = new AttachmentBuilder(levelImg, { name: 'level.png' });

    // Reply to the interaction
    await interaction.reply({
      files: [attachment]
    });
  } catch (error) {
    console.error('Error creating level card:', error);
    await interaction.reply({ content: 'Error creating level card', ephemeral: true });
  }
});
```

## Using Different Themes

The level card generator comes with several built-in themes:

```typescript
import { level } from 'discord-image-utils';

// Creating level cards with different themes
async function generateLevelCards(username, avatarURL, level, xp, maxXp) {
  // Default theme
  const defaultCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    theme: "default" // Red accents on dark background
  });

  // Futuristic theme
  const futuristicCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    theme: "futuristic" // Cyan accents on dark blue background
  });

  // Neon theme
  const neonCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    theme: "neon" // Pink progress bar with green text on black
  });

  // Minimal theme
  const minimalCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    theme: "minimal" // Clean white design with subtle accents
  });

  // Aurora theme
  const auroraCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    theme: "aurora" // Purple accents on dark blue background
  });

  // Sunset theme
  const sunsetCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    theme: "sunset" // Orange accents on brown/red background
  });

  return {
    defaultCard,
    futuristicCard,
    neonCard,
    minimalCard,
    auroraCard,
    sunsetCard
  };
}
```

## Using Different Layouts

The level card generator supports multiple layout styles:

```typescript
import { level } from 'discord-image-utils';

// Create level cards with different layouts
async function generateLayoutExamples(username, avatarURL, level, xp, maxXp) {
  // Classic layout (default)
  const classicCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    layout: "classic"
  });

  // Futuristic HUD layout
  const futuristicHUDCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    layout: "futuristicHUD",
    theme: "futuristic" // This layout works best with the futuristic theme
  });

  // Split layout
  const splitCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    layout: "split"
  });

  // Ribbon layout
  const ribbonCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    layout: "ribbon"
  });

  // Diagonal layout
  const diagonalCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    layout: "diagonal"
  });

  // Stacked layout
  const stackedCard = await level({
    name: username,
    level: level,
    avatar: avatarURL,
    xp: xp,
    maxXp: maxXp,
    layout: "stacked"
  });

  return {
    classicCard,
    futuristicHUDCard,
    splitCard,
    ribbonCard,
    diagonalCard,
    stackedCard
  };
}
```

## Using the Builder API

The builder API provides a more fluent interface for creating level cards:

```typescript
import { RankCard } from 'discord-image-utils';
import { AttachmentBuilder } from 'discord.js';

async function createCustomLevelCard(member, userData) {
  // Create a new level card builder
  const card = new RankCard()
    .setName(member.user.username)
    .setLevel(userData.level)
    .setAvatar(member.user.displayAvatarURL({ extension: 'png', size: 512 }))
    .setXP(userData.currentXP)
    .setMaxXP(userData.requiredXP)
    .setNextLevelXP(userData.nextLevelRequiredXP) // Optional
    .setLevelUpXP(userData.xpNeededForNextLevel) // Optional
    .setTheme('aurora')
    .setLayout('futuristicHUD');

  // Customize progress bar
  card
    .setProgressBarColor('#FF5555')
    .setProgressBarGradient([
      { color: '#FF5555', position: 0 },
      { color: '#FFAA55', position: 0.5 },
      { color: '#55FFAA', position: 1 }
    ])
    .setProgressBarBorderRadius(10)
    .setProgressBarBorderWidth(2);

  // Customize text appearance
  card
    .setTextColor('#FFFFFF')
    .setFontSize(24)
    .setBold(true)
    .setFontFamily('Arial')
    .setTextShadow('#000000', 3, 2, 2)
    .setTextOutline('#000000', 2);

  // Customize background and avatar appearance
  card
    .setBackgroundBlur(5)
    .setBackgroundOverlay('rgba(0,0,0,0.6)')
    .setAvatarGlow('#FF5555')
    .setAvatarGlowIntensity(20)
    .setAvatarSize(120)
    .setAvatarBorder('#FFFFFF')
    .setAvatarBorderWidth(4);

  // Add a custom background image (optional)
  if (member.guild.bannerURL()) {
    card.setBackgroundImage(member.guild.bannerURL({ extension: 'png', size: 1024 }));
  }

  // Render the card
  const levelImg = await card.render();

  // Create an attachment
  return new AttachmentBuilder(levelImg, { name: 'level.png' });
}
```

## Advanced Customization

Example of applying text effects and gradients:

```typescript
import { RankCard } from 'discord-image-utils';

// Create a card with advanced text effects and gradients
async function createAdvancedLevelCard(username, avatarURL, userData) {
  const card = new RankCard()
    .setName(username)
    .setLevel(userData.level)
    .setAvatar(avatarURL)
    .setXP(userData.xp)
    .setMaxXP(userData.maxXp)
    .setTheme('neon');

  // Set progress bar gradient
  card.setProgressBarGradient([
    { color: '#FF00FF', position: 0 },
    { color: '#00FFFF', position: 0.5 },
    { color: '#00FF00', position: 1 }
  ]);

  // Add text effects
  card.setTextOutline('#FF00FF', 2);

  // Enable showing both next level XP and XP needed for level up
  card
    .setShowNextLevelXp(true)
    .setShowLevelUpXp(true)
    .setNextLevelXP(userData.nextLevelThreshold)
    .setLevelUpXP(userData.xpNeeded);

  // Custom avatar styling
  card
    .setAvatarGlow('#FF00FF')
    .setAvatarGlowIntensity(25)
    .setAvatarBorder('#00FFFF')
    .setAvatarBorderWidth(5);

  return card.render();
}
```

## Integration with Discord.js XP System

Complete example integrating with a Discord.js XP system:

```typescript
import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import { RankCard } from 'discord-image-utils';
import { Database } from 'your-database-library';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const db = new Database(/* configuration */);

// XP system constants
const XP_PER_MESSAGE = 15;
const LEVEL_MULTIPLIER = 300;
const COOLDOWN = 60000; // 1 minute cooldown between XP gains
const userCooldowns = new Map();

// Calculate XP needed for a level
function xpForLevel(level) {
  return level * LEVEL_MULTIPLIER;
}

// Calculate level from XP
function levelFromXP(xp) {
  return Math.floor(xp / LEVEL_MULTIPLIER);
}

// XP gain on message
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Check cooldown
  const now = Date.now();
  const cooldownEnd = userCooldowns.get(message.author.id) || 0;

  if (now < cooldownEnd) return;

  // Set new cooldown
  userCooldowns.set(message.author.id, now + COOLDOWN);

  // Get user data or create if doesn't exist
  let userData = await db.getUserData(message.author.id);
  if (!userData) {
    userData = {
      id: message.author.id,
      xp: 0,
      level: 0,
      lastMessageTimestamp: now
    };
  }

  // Add XP
  userData.xp += XP_PER_MESSAGE;
  const newLevel = levelFromXP(userData.xp);

  // Check for level up
  if (newLevel > userData.level) {
    userData.level = newLevel;

    // Create level up card
    const card = new RankCard()
      .setName(message.author.username)
      .setLevel(userData.level)
      .setAvatar(message.author.displayAvatarURL({ extension: 'png', size: 512 }))
      .setXP(userData.xp)
      .setMaxXP(xpForLevel(userData.level + 1))
      .setTheme('aurora')
      .setLayout('futuristicHUD')
      .setProgressBarGradient([
        { color: '#FF00FF', position: 0 },
        { color: '#00FFFF', position: 1 }
      ]);

    const levelUpImg = await card.render();
    const attachment = new AttachmentBuilder(levelUpImg, { name: 'levelup.png' });

    await message.reply({
      content: `🎉 Congratulations ${message.author}! You've leveled up to **level ${userData.level}**!`,
      files: [attachment]
    });
  }

  // Save updated user data
  await db.saveUserData(userData);
});

// Level command
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== 'level') return;

  await interaction.deferReply();

  // Get target user (either mentioned user or command user)
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const userData = await db.getUserData(targetUser.id) || { id: targetUser.id, xp: 0, level: 0 };

  // Calculate XP thresholds
  const currentLevelXP = xpForLevel(userData.level);
  const nextLevelXP = xpForLevel(userData.level + 1);
  const xpNeeded = nextLevelXP - userData.xp;

  // Create level card
  const card = new RankCard()
    .setName(targetUser.username)
    .setLevel(userData.level)
    .setAvatar(targetUser.displayAvatarURL({ extension: 'png', size: 512 }))
    .setXP(userData.xp - currentLevelXP)  // XP in current level
    .setMaxXP(nextLevelXP - currentLevelXP) // XP needed for current level
    .setNextLevelXP(nextLevelXP)
    .setLevelUpXP(xpNeeded)
    .setShowNextLevelXp(true)
    .setShowLevelUpXp(true);

  // Get server config for theme/style
  const serverConfig = await db.getServerConfig(interaction.guildId);
  if (serverConfig?.levelCardTheme) {
    card.setTheme(serverConfig.levelCardTheme);
  }

  if (serverConfig?.levelCardLayout) {
    card.setLayout(serverConfig.levelCardLayout);
  }

  const levelImg = await card.render();
  const attachment = new AttachmentBuilder(levelImg, { name: 'level.png' });

  await interaction.editReply({
    files: [attachment]
  });
});

client.login('YOUR_BOT_TOKEN');
```
