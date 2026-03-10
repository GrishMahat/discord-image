# Level Card Guide

Use `level(...)` to generate rank cards for profile, XP, and leaderboard commands.

## Best Starting Point

This is the cleanest default setup for most bots:

```ts
import { AttachmentBuilder } from "discord.js";
import { level } from "discord-image-utils";

const image = await level({
  name: interaction.user.username,
  level: user.level,
  avatar: interaction.user.displayAvatarURL({ extension: "png", size: 512 }),
  xp: user.xp,
  maxXp: user.maxXp,
  theme: "default",
  layout: "classic",
});

const attachment = new AttachmentBuilder(image, { name: "level.png" });
await interaction.reply({ files: [attachment] });
```

## Themes

Built-in themes:

- `default`
- `futuristic`
- `neon`
- `minimal`
- `aurora`
- `sunset`

Example:

```ts
const image = await level({
  name: "Nory",
  level: 18,
  avatar: "https://example.com/avatar.png",
  xp: 720,
  maxXp: 1000,
  theme: "aurora",
});
```

## Layouts

Built-in layouts:

- `classic`
- `futuristicHUD`
- `split`
- `ribbon`
- `diagonal`
- `stacked`

Example:

```ts
const image = await level({
  name: "Pilot",
  level: 34,
  avatar: "https://example.com/avatar.png",
  xp: 4400,
  maxXp: 5000,
  layout: "futuristicHUD",
  theme: "futuristic",
});
```

## Recommended Presets

Use these combinations when you want a good-looking card quickly:

- `default` + `classic`: safe default for general bots
- `futuristic` + `futuristicHUD`: best match for sci-fi or gaming bots
- `minimal` + `split`: cleaner and more restrained
- `aurora` + `stacked`: softer, more decorative look
- `sunset` + `ribbon`: warmer, more playful presentation

## Rich Styling Example

```ts
const image = await level({
  name: "Commander_01",
  level: 42,
  avatar: "https://example.com/avatar.png",
  xp: 8750,
  maxXp: 10000,
  nextLevelXp: 12000,
  levelUpXp: 3250,
  showNextLevelXp: true,
  showLevelUpXp: true,
  theme: "neon",
  layout: "split",
  progressBarGradient: [
    { color: "#FF00FF", position: 0 },
    { color: "#00FFFF", position: 1 },
  ],
  textColor: "#FFFFFF",
  avatarGlow: "#FF00FF",
  avatarGlowIntensity: 20,
  avatarBorder: "#00FFFF",
  avatarBorderWidth: 4,
});
```

## XP Command Pattern

This pattern keeps the progress bar scoped to the current level instead of total lifetime XP.

```ts
import { level } from "discord-image-utils";

function xpForLevel(targetLevel: number): number {
  return targetLevel * 300;
}

const currentLevelXp = xpForLevel(user.level);
const nextLevelXp = xpForLevel(user.level + 1);

const image = await level({
  name: target.username,
  level: user.level,
  avatar: target.displayAvatarURL({ extension: "png", size: 512 }),
  xp: user.xp - currentLevelXp,
  maxXp: nextLevelXp - currentLevelXp,
  nextLevelXp,
  levelUpXp: nextLevelXp - user.xp,
  theme: "default",
  layout: "classic",
});
```

## What To Pass

Common fields:

- `name`
- `level`
- `avatar`
- `xp`
- `maxXp`
- `theme`
- `layout`

Useful optional fields:

- `nextLevelXp`
- `levelUpXp`
- `showNextLevelXp`
- `showLevelUpXp`
- `progressBarGradient`
- `textColor`
- `avatarGlow`
- `avatarBorder`

## Notes

- `level(...)` is the main public API for rank cards.
- `RankCard` at the package root is a compatibility alias of `level(...)`.
- The runtime options use `name`, `xp`, and `maxXp`. Older examples using `username`, `currentXP`, or `requiredXP` are stale.
- Use Discord avatar URLs with `extension: "png"` and `size: 512` for reliable output quality.
