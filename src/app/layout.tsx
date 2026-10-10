import './globals.css';
import Header from '@/components/shared/Header';
import BottomNav from '@/components/shared/BottomNav';

export const metadata = {
  title: 'NoQ | منصة الحجوزات الذكية (No Queue)',
  description: 'تطبيق NoQ - احجز الشاليهات والملاعب والقاعات والمراكز فورا بدون انتظار في جميع المحافظات',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 min-h-screen text-slate-900 pb-20 md:pb-6">
        <Header />
        <main className="max-w-md mx-auto px-4 pt-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
