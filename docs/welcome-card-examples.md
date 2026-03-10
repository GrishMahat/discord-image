# Welcome Card Guide

Use `welcomeCard(...)` or `WelcomeCardBuilder` to generate join messages for new members.

## Best Starting Point

This is the simplest production-ready setup for most Discord bots:

```ts
import { AttachmentBuilder } from "discord.js";
import { welcomeCard } from "discord-image-utils";

client.on("guildMemberAdd", async (member) => {
  try {
    const image = await welcomeCard({
      username: member.user.username,
      avatar: member.user.displayAvatarURL({ extension: "png", size: 512 }),
      servername: member.guild.name,
      memberCount: member.guild.memberCount,
      theme: "tech",
    });

    const attachment = new AttachmentBuilder(image, { name: "welcome.png" });
    await welcomeChannel.send({ files: [attachment] });
  } catch (error) {
    console.error("Error creating welcome card:", error);
  }
});
```

## Themes

Built-in themes:

- `default`
- `dark`
- `light`
- `colorful`
- `minimal`
- `tech`

Example:

```ts
const image = await welcomeCard({
  username: "grish",
  avatar: "https://example.com/avatar.png",
  servername: "My Discord Server",
  theme: "minimal",
});
```

## Recommended Presets

Use these combinations when you want a better-looking card quickly:

- `tech`: best for gaming, developer, or neon-styled servers
- `default`: balanced general-purpose choice
- `minimal`: cleanest option for community or creator servers
- `dark`: safer choice for darker backgrounds
- `colorful`: better for casual or playful servers

## Branded Card Example

```ts
import { welcomeCard } from "discord-image-utils";

const image = await welcomeCard({
  username: "grish",
  avatar: "./avatar.png",
  servername: "discord-image-utils",
  background: "./banner.png",
  message: "Welcome aboard",
  theme: "tech",
  meta: [
    { label: "Member Count", value: "#101" },
    { label: "Theme", value: "tech" },
    { label: "Server", value: "discord-image-utils" },
  ],
  customization: {
    textColor: "#FFFFFF",
    borderColor: "#3498db",
    backgroundColor: "rgba(23, 23, 23, 0.8)",
    avatarBorderColor: "#00FFFF",
    font: "sans-serif",
    fontSize: 28,
  },
});
```

## Builder API

Use the builder when you want a more readable chainable setup:

```ts
import { AttachmentBuilder } from "discord.js";
import { WelcomeCardBuilder } from "discord-image-utils";

async function createCustomWelcomeCard(member) {
  const builder = new WelcomeCardBuilder()
    .setUsername(member.user.username)
    .setAvatar(member.user.displayAvatarURL({ extension: "png", size: 512 }))
    .setServerName(member.guild.name)
    .setTheme("tech")
    .setMessage(`Welcome aboard ${member.user.username}! Enjoy your stay!`)
    .setMeta([
      { label: "Member Count", value: `#${member.guild.memberCount}` },
      { label: "Theme", value: "tech" },
      { label: "Server", value: member.guild.name },
    ]);

  if (member.guild.bannerURL()) {
    builder.setBackground(member.guild.bannerURL({ extension: "png", size: 1024 }));
  }

  const roleColor = member.displayHexColor;
  if (roleColor !== "#000000") {
    builder.setTextColor(roleColor).setAvatarBorderColor(roleColor);
  }

  const image = await builder.render();
  return new AttachmentBuilder(image, { name: "welcome.png" });
}
```

## Builder Methods

The current builder supports:

- `setUsername`
- `setAvatar`
- `setServerName`
- `setMemberCount`
- `setBackground`
- `setTheme`
- `setMessage`
- `setMeta`
- `addMeta`
- `setTextColor`
- `setBorderColor`
- `setBackgroundColor`
- `setAvatarBorderColor`
- `setFont`
- `setFontSize`
- `render`

## What To Pass

Common fields:

- `username`
- `avatar`
- `servername`
- `memberCount`
- `theme`

Useful optional fields:

- `background`
- `message`
- `meta`
- `customization.textColor`
- `customization.borderColor`
- `customization.backgroundColor`
- `customization.avatarBorderColor`
- `customization.font`
- `customization.fontSize`

## Notes

- Required fields are `username` and `avatar`.
- If `message` is omitted and `servername` is provided, the card uses `Welcome to ${servername}!`.
- Footer metadata is opt-in through `meta`; the generator no longer hardcodes member count, theme, or server badges for you.
- If `background` fails to load, the generator falls back to the default dark background.
- Use Discord avatar URLs with `extension: "png"` and `size: 512` for the best results.
