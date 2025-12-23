import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "경기북서부노인보호전문기관 복지동향",
  description: "복지부, 경기도, 31개 시군의 사회복지 정책 및 소식 모음",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
