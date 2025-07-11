/** @format */

// Base types
export type ImageInput = string | Buffer;

// Color types
export type HexColor = `#${string}`;
export type RGBColor = `rgb(${number}, ${number}, ${number})`;
export type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;
export type Color = HexColor | RGBColor | RGBAColor | string;

// Position and dimension types
export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Rectangle extends Position, Dimensions {}

// Filter types
export type FilterLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface FilterOptions {
  level?: FilterLevel;
  quality?: number;
}

// Progress bar types
export interface ProgressBarOptions {
  color?: Color;
  backgroundColor?: Color;
  borderColor?: Color;
  borderWidth?: number;
  height?: number;
}

// Music image types
export interface TimeOptions {
  currentTime: number;
  totalTime: number;
}

export interface MusicImageOptions {
  title: string;
  artist: string;
  album?: string;
  image: ImageInput;
  time?: TimeOptions;
  progressBar?: ProgressBarOptions;
}

// Quote types
export type GradientType = "linear" | "radial";
export type PatternType = "dots" | "lines" | "grid" | "waves" | "chevron";

export interface GradientOptions {
  type: GradientType;
  colors: Color[];
}

export interface PatternOptions {
  type: PatternType;
  opacity?: number;
  scale?: number;
}

export interface QuoteResponse {
  quote: string;
  author: string;
  gradient?: GradientOptions;
  pattern?: PatternOptions;
}

// Welcome card types
export type WelcomeTheme = 'default' | 'dark' | 'light' | 'colorful' | 'minimal' | 'tech';

export interface WelcomeCardCustomization {
  textColor?: Color;
  borderColor?: Color;
  backgroundColor?: Color;
  avatarBorderColor?: Color;
  font?: string;
  fontSize?: number;
}

export interface WelcomeCardOptions {
  username: string;
  avatar: ImageInput;
  servername?: string;
  memberCount?: number;
  background?: ImageInput;
  theme?: WelcomeTheme;
  message?: string;
  customization?: WelcomeCardCustomization;
}

// Level/Rank card types
export interface LevelCardOptions {
  username: string;
  avatar: ImageInput;
  level: number;
  currentXP: number;
  requiredXP: number;
  rank?: number;
  background?: ImageInput;
  theme?: WelcomeTheme;
  customization?: WelcomeCardCustomization;
}

// GIF options
export interface GifOptions {
  frameDelay?: number;
  quality?: number;
  frameCount?: number;
}

export interface TriggeredOptions extends GifOptions {
  intensity?: FilterLevel;
}

export interface BlinkOptions extends GifOptions {
  blinkDuration?: number;
}

// Image generation options
export interface WantedOptions {
  currency?: string;
  amount?: number;
}

export interface MemeTextOptions {
  text: string;
  font?: string;
  fontSize?: number;
  color?: Color;
  strokeColor?: Color;
  strokeWidth?: number;
  position?: Position;
}

export interface MemeOptions {
  topText?: string | MemeTextOptions;
  bottomText?: string | MemeTextOptions;
  font?: string;
  fontSize?: number;
  textColor?: Color;
  strokeColor?: Color;
  strokeWidth?: number;
}

// Canvas options
export interface CanvasOptions {
  width: number;
  height: number;
  backgroundColor?: Color;
  quality?: number;
}

// Animation options
export interface AnimationOptions {
  duration?: number;
  fps?: number;
  loop?: boolean;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// Effect options
export interface BlurOptions extends FilterOptions {
  radius?: number;
  sigma?: number;
}

export interface PixelateOptions extends FilterOptions {
  size?: number;
}

export interface WaveOptions extends FilterOptions {
  amplitude?: number;
  frequency?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
}

export interface GlitchOptions extends FilterOptions {
  iterations?: number;
  quality?: number;
  seed?: number;
}

// Text options
export interface TextOptions {
  text: string;
  font?: string;
  fontSize?: number;
  color?: Color;
  backgroundColor?: Color;
  padding?: number;
  borderRadius?: number;
  maxWidth?: number;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

// Validation types
export interface ValidationOptions {
  required?: boolean;
  type?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

// Error types (re-exported for convenience)
export interface ErrorDetails {
  [key: string]: any;
}

export interface ErrorOptions {
  code?: string;
  statusCode?: number;
  details?: ErrorDetails;
}

// Network options
export interface NetworkOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  userAgent?: string;
}

// Processing options
export interface ProcessingOptions {
  quality?: number;
  format?: 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp';
  progressive?: boolean;
  optimize?: boolean;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Function result types
export interface OperationResult<T = Buffer> {
  success: boolean;
  data?: T;
  error?: string;
  details?: ErrorDetails;
}

export interface AsyncOperationResult<T = Buffer> extends Promise<OperationResult<T>> {}

// Module configuration types
export interface ModuleConfig {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  defaultTimeout?: number;
  maxRetries?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}
