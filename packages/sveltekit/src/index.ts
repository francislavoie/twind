/**
 * [[include:packages/sveltekit/README.md]]
 *
 * @packageDocumentation
 * @module
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  Twind,
  BaseTheme,
  TwindConfig,
  TwindUserConfig,
  Preset,
  ExtractThemes,
  Sheet,
} from 'twind'

import { defineConfig as defineConfig$, setup as setup$, virtual, cssom, dom } from 'twind'

import { dev, browser } from '$app/env'

export function defineConfig<Theme extends BaseTheme = BaseTheme>(
  config?: TwindConfig<Theme>,
): TwindConfig<Theme & BaseTheme>

export function defineConfig<Theme = BaseTheme, Presets extends Preset<any>[] = Preset[]>(
  config?: TwindUserConfig<Theme, Presets>,
): TwindConfig<BaseTheme & ExtractThemes<Theme, Presets>>

export function defineConfig(config: TwindConfig | TwindUserConfig = {}): TwindConfig {
  return defineConfig$({ hash: !dev, ...config } as TwindUserConfig)
}

export function setup<Theme extends BaseTheme = BaseTheme, SheetTarget = unknown>(
  config?: TwindConfig<Theme>,
  sheet?: Sheet<SheetTarget>,
  target?: HTMLElement,
): Twind<Theme & BaseTheme, SheetTarget>

export function setup<
  Theme = BaseTheme,
  Presets extends Preset<any>[] = Preset[],
  SheetTarget = unknown,
>(
  config?: TwindUserConfig<Theme, Presets>,
  sheet?: Sheet<SheetTarget>,
  target?: HTMLElement,
): Twind<BaseTheme & ExtractThemes<Theme, Presets>, SheetTarget>

export function setup(
  config: TwindConfig | TwindUserConfig = {} as TwindUserConfig,
  sheet: Sheet = browser ? (dev ? dom() : cssom()) : virtual(),
  target?: HTMLElement,
): Twind {
  return setup$(defineConfig(config as TwindUserConfig), sheet, target)
}
