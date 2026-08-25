import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/Navbar'
import GlobalLoader from '../components/GlobalLoader'
import { ThemeProvider } from '../components/ThemeProvider'
import { GlobalThemeToggle } from '../components/GlobalThemeToggle'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

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
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="bg-primary text-primary font-body antialiased min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '600',
              padding: '16px 24px',
              maxWidth: '400px'
            }
          }} />
          <GlobalLoader />
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
