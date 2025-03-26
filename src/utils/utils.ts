/** @format */

import { get, request } from "https";
import { ImageInput } from "../types";
import { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from "canvas";

export async function validateURL(url: ImageInput): Promise<Buffer | null> {
  if (!url) return null;
  if (Buffer.isBuffer(url)) {
    return url;
  }
  try {
    // if url is not https
    if (!url.startsWith("https")) {
      console.error("The url must be https");
      return null;
    }

    return new Promise<Buffer>((resolve, reject) => {
      const fetchWithRedirects = (currentUrl: string, redirectCount = 0) => {
        // Prevent too many redirects
        if (redirectCount > 5) {
          reject(new Error("Too many redirects"));
          return;
        }

        get(currentUrl, (response) => {
          const statusCode = response.statusCode || 0;

          // Handle redirects (3xx status codes)
          if (statusCode >= 300 && statusCode < 400) {
            const location = response.headers.location;
            if (!location) {
              reject(new Error(`Redirect with no location header (status ${statusCode})`));
              return;
            }

            // Handle relative URLs in location header
            const redirectUrl = location.startsWith('http') ? location :
              new URL(location, currentUrl).toString();

            console.log(`Following redirect (${statusCode}) to: ${redirectUrl}`);
            fetchWithRedirects(redirectUrl, redirectCount + 1);
            return;
          }

          if (statusCode !== 200) {
            console.error(`Invalid status code ${statusCode}`);
            reject(new Error(`Invalid status code ${statusCode}`));
            return;
          }

          const type = response.headers["content-type"];
          // Check if content type exists and is an image, handling potential charset information
          if (!type || !type.split(';')[0].trim().startsWith("image/")) {
            console.error(`Invalid content type ${type}`);
            reject(new Error(`Invalid content type ${type}`));
            return;
          }

          const chunks: Buffer[] = [];
          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () => resolve(Buffer.concat(chunks)));
          response.on("error", reject);
        }).on("error", reject);
      };

      fetchWithRedirects(url.toString());
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Create a responsive text size
 * Code from https://discordjs.guide/popular-topics/canvas.html#adding-in-text
 * @param canvas The canvas object
 * @param text The text to size
 * @param defaultFontSize The starting font size
 * @param width The maximum width
 * @param font The font family
 */
export async function applyText(
  canvas: {
    getContext: (
      contextId: string,
      options?: unknown
    ) => CanvasRenderingContext2D;
  },
  text: string,
  defaultFontSize: number,
  width: number,
  font: string
): Promise<string> {
  const ctx = canvas.getContext("2d");
  do {
    ctx.font = `${defaultFontSize--}px ${font}`;
  } while (ctx.measureText(text).width > width);
  return ctx.font;
}

/**
 * Wrap text to fit within a maximum width
 * @param ctx The canvas rendering context
 * @param text The text to wrap
 * @param maxWidth The maximum width allowed
 */
export async function wrapText(
  ctx: NodeCanvasRenderingContext2D,
  text: string,
  maxWidth: number
): Promise<string[] | null> {
  return new Promise((resolve) => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText("W").width > maxWidth) return resolve(null);

    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";

    while (words.length > 0) {
      let split = false;

      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) {
          words[1] = `${temp.slice(-1)}${words[1]}`;
        } else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }

      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
        line += `${words.shift()} `;
      } else {
        lines.push(line.trim());
        line = "";
      }

      if (words.length === 0) {
        lines.push(line.trim());
      }
    }

    return resolve(lines);
  });
}
