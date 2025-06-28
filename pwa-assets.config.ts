import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset: {
    ...minimal2023Preset,
    apple: {
      sizes: [180],
      padding: 0.05,
      resizeOptions: {
        background: '#FFD400'
      }
    },
    maskable: {
      sizes: [512],
      padding: 0.3,
      resizeOptions: {
        background: '#FFD400'
      }
    },
    transparent: {
      sizes: [64, 192, 512],
      padding: 0.05,
      resizeOptions: {
        background: 'transparent'
      }
    }
  },
  images: ['public/lovable-uploads/1424b683-055d-4b5c-bccc-84cd26273e7a.png']
}); 