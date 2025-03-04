import withPWA from 'next-pwa'

const pwaOptions = {
  dest: 'public' // ビルド時に生成される service worker を public フォルダに出力
  // disable: process.env.NODE_ENV === 'development' // 開発環境では無効化
}

const nextConfig = {
  // Next.js のその他の設定をここに記述可能
}

export default withPWA(pwaOptions)(nextConfig)
