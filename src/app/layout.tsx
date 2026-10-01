import type { Metadata, Viewport } from 'next';
import './globals.css';
import './student-vibrant.css';
import './workspace-settings.css';
import './motion.css';
import './grammar.css';
import './appendix.css';
import './speak.css';
export const metadata: Metadata = { title: 'English Mastery', description: 'Learn English in short, high-energy sessions.' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
const themeScript = `try{var t=localStorage.getItem('em-theme')||localStorage.getItem('em-admin-theme');var map={light:'forest',dark:'forest',mist:'lagoon',paper:'dune',sky:'cobalt',blossom:'wine'};var ok={forest:1,midnight:1,plum:1,ember:1,lagoon:1,dune:1,cobalt:1,wine:1};t=map[t]||t;if(!ok[t])t='forest';document.documentElement.dataset.theme=t;document.documentElement.dataset.themeMode='dark'}catch(e){};try{var f=localStorage.getItem('em-interface-font');document.documentElement.dataset.interfaceFont=['dm','plex','space','system','serif'].includes(f)?f:'dm'}catch(e){};try{var p=localStorage.getItem('em-pattern');document.documentElement.dataset.pattern=['dots','waves','diamond','weave'].includes(p)?p:'dots'}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
