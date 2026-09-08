import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hourbase",
  description: "Track your time. Know your value. Get paid accurately.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{var a="system";var s=JSON.parse(localStorage.getItem("ftt.session.v1")||"null");var d=JSON.parse(localStorage.getItem("ftt.db.v1")||"null");if(s&&d&&d.profiles){var p=d.profiles.find(function(x){return x.id===s.id});if(p&&p.appearance)a=p.appearance}document.documentElement.classList.toggle("dark",a==="dark"||(a==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))}catch(e){}})();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
