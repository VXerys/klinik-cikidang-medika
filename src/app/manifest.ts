import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Klinik Pratama Cikidang Medika',
    short_name: 'Cikidang Medika',
    description:
      'Sistem informasi manajemen pasien, rekam medis, dan laporan keuangan Klinik Pratama Cikidang Medika.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // A clinic clerk may use a narrow phone at the counter and a wide monitor in
    // the office, so the layout is free to follow the device.
    orientation: 'any',
    background_color: '#f8fafc',
    theme_color: '#134e4a',
    lang: 'id',
    dir: 'ltr',
    categories: ['medical', 'health', 'productivity'],
    icons: [
      { src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/assets/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
