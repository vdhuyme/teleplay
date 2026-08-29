import { isNil } from '@teleplay/core';

export const Environment = {
  development: 'development',
  production: 'production',
  test: 'test',
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];

const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  SOCKET_PATH: process.env.SOCKET_PATH,
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  AUTH_USERNAME: process.env.AUTH_USERNAME,
  AUTH_PASSWORD: process.env.AUTH_PASSWORD,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
} satisfies Record<string, string | undefined>;

type EnvKey = keyof typeof ENV;

/**
 * A utility class for managing application environment variables and providing
 * convenience methods for checking the current runtime environment.
 *
 * This class abstracts direct access to `process.env` and provides
 * a centralized, type-safe API for:
 * - Checking the current environment
 * - Reading environment variables
 * - Conditionally executing code based on environment
 *
 * @example
 * if (App.isProduction()) {
 *   // Production-specific logic
 * }
 *
 * @example
 * const appUrl = App.get('APP_URL');
 *
 * @example
 * const jwtSecret = App.getOrThrow('JWT_SECRET');
 *
 * @example
 * App.when(Environment.development, () => {
 *   console.log('Development mode');
 * });
 *
 * @example
 * App.unless(Environment.test, () => {
 *   console.log('Runs outside test environment');
 * });
 */
export class App {
  /**
   * The current runtime environment derived from `NODE_ENV`.
   */
  private static readonly env = ENV.NODE_ENV ?? Environment.development;

  /**
   * Checks whether the current environment matches the provided environment(s).
   *
   * @param env - A single environment or an array of environments.
   *
   * @returns `true` if the current environment matches, otherwise `false`.
   *
   * @example
   * App.environment(Environment.production);
   *
   * @example
   * App.environment([
   *   Environment.development,
   *   Environment.test,
   * ]);
   */
  public static environment(env: Environment | Environment[]): boolean {
    if (Array.isArray(env)) {
      return env.includes(App.env);
    }

    return App.env === env;
  }

  /**
   * Determines whether the application is running in production mode.
   *
   * @returns `true` if `NODE_ENV === 'production'`.
   */
  public static isProduction(): boolean {
    return App.environment(Environment.production);
  }

  /**
   * Determines whether the application is running in development mode.
   *
   * @returns `true` if `NODE_ENV === 'development'`.
   */
  public static isDevelopment(): boolean {
    return App.environment(Environment.development);
  }

  /**
   * Determines whether the application is running in test mode.
   *
   * @returns `true` if `NODE_ENV === 'test'`.
   */
  public static isTest(): boolean {
    return App.environment(Environment.test);
  }

  /**
   * Retrieves the current runtime environment.
   *
   * @returns The current environment.
   *
   * @example
   * const env = App.get();
   */
  public static get(): Environment;

  /**
   * Retrieves an environment variable value from `process.env`.
   *
   * @param key - The environment variable key.
   *
   * @returns The environment variable value or `undefined`.
   *
   * @example
   * const appUrl = App.get('APP_URL');
   *
   * @example
   * const expiresIn = App.get<JwtSignOptions['expiresIn']>(
   *   'ACCESS_TOKEN_EXPIRATION',
   * );
   */
  public static get<T = string>(key: EnvKey): T | undefined;

  /**
   * Retrieves an environment variable value from `process.env`
   * with a fallback default value.
   *
   * @param key - The environment variable key.
   * @param defaultValue - The fallback value if env is undefined.
   *
   * @returns The environment variable value or the fallback value.
   *
   * @example
   * const appUrl = App.get('APP_URL', 'http://localhost:3000');
   */
  public static get<T = string>(key: EnvKey, defaultValue: T): T;

  public static get<T = string>(
    key?: EnvKey,
    defaultValue?: T,
  ): Environment | T | undefined {
    if (isNil(key)) {
      return App.env;
    }

    return (ENV[key] ?? defaultValue) as T | undefined;
  }

  /**
   * Retrieves an environment variable value from `process.env`.
   *
   * Throws an error if the variable does not exist.
   *
   * @param key - The environment variable key.
   *
   * @returns The environment variable value.
   *
   * @throws Error if the environment variable is missing.
   *
   * @example
   * const jwtSecret = App.getOrThrow('JWT_SECRET');
   */
  public static getOrThrow<T = string>(key: EnvKey): T;
  public static getOrThrow<T = string>(key: EnvKey, defaultValue: T): T;
  public static getOrThrow<T = string>(key: EnvKey, defaultValue?: T): T {
    const value = App.get(key, defaultValue);

    if (isNil(value)) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
  }

  /**
   * Executes a callback if the current environment matches
   * the provided environment(s).
   *
   * @param env - A single environment or an array of environments.
   * @param callback - The callback to execute.
   *
   * @returns The callback result if executed, otherwise `undefined`.
   *
   * @example
   * App.when(Environment.development, () => {
   *   console.log('Development only');
   * });
   */
  public static when<T>(
    env: Environment | Environment[],
    callback: () => T,
  ): T | undefined {
    if (App.environment(env)) {
      return callback();
    }
  }

  /**
   * Executes a callback if the current environment does NOT match
   * the provided environment(s).
   *
   * @param env - A single environment or an array of environments.
   * @param callback - The callback to execute.
   *
   * @returns The callback result if executed, otherwise `undefined`.
   *
   * @example
   * App.unless(Environment.test, () => {
   *   console.log('Not running in test');
   * });
   */
  public static unless<T>(
    env: Environment | Environment[],
    callback: () => T,
  ): T | undefined {
    if (!App.environment(env)) {
      return callback();
    }
  }
}
