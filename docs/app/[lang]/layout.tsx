import type { ReactNode } from 'react';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import '../globals.css';

export const metadata = {
  title: {
    default: 'react-stateful-hooks',
    template: '%s – react-stateful-hooks',
  },
  description:
    'SSR-first React hooks for browser state — zero hydration mismatches, built on useSyncExternalStore.',
};

const repo = 'https://github.com/eugenepokalyuk/react-stateful-hooks';

const i18n = [
  { locale: 'en', name: 'English' },
  { locale: 'ru', name: 'Русский' },
];

export async function generateStaticParams() {
  return i18n.map(({ locale }) => ({ lang: locale }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const navbar = (
    <Navbar logo={<b>react-stateful-hooks</b>} projectLink={repo} />
  );
  const footer = (
    <Footer>MIT {new Date().getFullYear()} © Evgenii Pokalyuk</Footer>
  );

  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap(`/${lang}`)}
          i18n={i18n}
          editLink={null}
          feedback={{ content: null }}
          navigation={false}
          sidebar={{ defaultMenuCollapseLevel: 2, toggleButton: false }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
