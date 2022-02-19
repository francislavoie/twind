import type { EndpointOutput } from '@sveltejs/kit'

import { img } from '$/image'
import iconPNG from '#/icon.png'

import { twind, virtual } from 'twind'
import config from '$/twind.config'
const tw = twind(config, virtual())

export function get(): EndpointOutput {
  return {
    headers: {
      'content-type': 'text/xml; charset=utf-8',
      'cache-control': 'public, max-age=31536000, immutable',
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <TileColor>${'' + tw.theme('colors.brand.1-dark')}</TileColor>
            <TileImage src="${img({ src: iconPNG, width: 150, format: 'png' })}" />
            <square70x70logo src="${img({ src: iconPNG, width: 70, format: 'png' })}"/>
            <square150x150logo src="${img({ src: iconPNG, width: 150, format: 'png' })}"/>
            <square310x310logo src="${img({ src: iconPNG, width: 310, format: 'png' })}"/>
            <wide310x150logo src="${img({
              src: iconPNG,
              width: 310,
              height: 150,
              fit: 'pad',
              format: 'png',
            })}"/>
        </tile>
    </msapplication>
</browserconfig>`,
  }
}
