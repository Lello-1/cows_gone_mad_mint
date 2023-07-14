import "./styles/Reset.css";

export const metadata = {
  title: 'Mint your own Cows Gone Mad NFT',
  description: 'NFTs available by Metapolyclinic, disrupting the medical industry.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
