/* eslint-env node, browser */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppProps } from 'next/app'

import type { BaseTheme, TwindConfig, TwindUserConfig, Preset } from 'twind'

import { createElement } from 'react'

import { setup } from './index'

export default withTwind

function withTwind<Theme extends BaseTheme = BaseTheme>(
  config: TwindConfig<Theme>,
): React.JSXElementConstructor<AppProps>

function withTwind<Theme = BaseTheme, Presets extends Preset<any>[] = Preset[]>(
  config: TwindUserConfig<Theme, Presets>,
): React.JSXElementConstructor<AppProps>

function withTwind<Props, Component, Theme extends BaseTheme = BaseTheme>(
  config: TwindConfig<Theme>,
  AppComponent: React.JSXElementConstructor<Props> & Component,
): Component

function withTwind<Props, Component, Theme = BaseTheme, Presets extends Preset<any>[] = Preset[]>(
  config: TwindUserConfig<Theme, Presets>,
  AppComponent: React.JSXElementConstructor<Props> & Component,
): Component

function withTwind<Props, Component>(
  config: TwindConfig | TwindUserConfig,
  AppComponent: React.JSXElementConstructor<Props> & Component,
): Component

function withTwind<Props, Component>(
  config: TwindConfig | TwindUserConfig,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  AppComponent: React.JSXElementConstructor<Props> & Component = TwindApp as any,
): Component {
  setup(config as TwindUserConfig)

  return AppComponent
}

function TwindApp(props: AppProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return createElement(props.Component, props.pageProps)
}
