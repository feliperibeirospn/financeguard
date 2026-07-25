import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuração do Capacitor — ponte entre o bundle web (Vite → `dist/`)
 * e o shell nativo Android gerado em `android/`.
 *
 * Dicas:
 *  - `webDir` DEVE apontar para a pasta gerada pelo `npm run build`
 *    (Vite emite em `dist/`). Após qualquer mudança no front, rode
 *    `npm run prod:android` para reempacotar o app nativo.
 *  - `server.androidScheme: 'https'` evita bugs de cross-origin no
 *    WebView (recomendação oficial do Capacitor para apps offline-first
 *    que dependem de `localStorage` e Service Workers).
 *  - `server.cleartext: false` mantém o app seguro por padrão
 *    (necessário somente se você usar HTTP plain, o que não é o caso).
 */
const config: CapacitorConfig = {
  appId: 'com.felipecleones.financeguard',
  appName: 'Finance',
  webDir: 'dist',
  android: {
    // Permite que arquivos `file://` carreguem recursos remotos só
    // quando explicitamente necessário (default seguro: false).
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
};

export default config;
