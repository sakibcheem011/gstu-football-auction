import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import GlobalLoader from '../components/GlobalLoader'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas-neue' })

export const metadata: Metadata = {
  title: 'GSTU Liga | Football Franchise & Auction',
  description: 'University Football Franchise & Tournament Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${bebas.variable}`}>
      <body className="bg-transparent text-chalk font-body antialiased min-h-screen flex flex-col overflow-x-hidden">
        <div className="ambient-bg" />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#131622',
            color: '#FAFAFA',
            border: '1px solid rgba(244, 196, 83, 0.3)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600'
          }
        }} />
        <GlobalLoader />
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}
