import type { BrandConfig } from './types'

/**
 * Default brand configuration values
 */
export const defaultBrandConfig: BrandConfig = {
  name: 'Garza OS',
  logoUrl: undefined,
  faviconUrl: undefined,
  customCssUrl: undefined,
  supportEmail: 'help@garza-os.com',
  documentationUrl: undefined,
  termsUrl: undefined,
  privacyUrl: undefined,
  theme: {
    primaryColor: '#701ffc',
    primaryHoverColor: '#802fff',
    accentColor: '#9d54ff',
    accentHoverColor: '#a66fff',
    backgroundColor: '#0c0c0c',
  },
  isWhitelabeled: false,
}
