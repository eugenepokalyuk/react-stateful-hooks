import type { ComponentType, ReactNode } from 'react';
import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents as getMDXComponents } from '../../../mdx-components';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

type PageParams = { lang: string; mdxPath: string[] };

export async function generateMetadata(props: {
  params: Promise<PageParams>;
}) {
  const { lang, mdxPath } = await props.params;
  const { metadata } = await importPage(mdxPath, lang);
  return metadata;
}

const Wrapper = getMDXComponents().wrapper as ComponentType<{
  toc: unknown;
  metadata: unknown;
  children: ReactNode;
}>;

export default async function Page(props: { params: Promise<PageParams> }) {
  const params = await props.params;
  const { lang, mdxPath } = params;
  const result = await importPage(mdxPath, lang);
  const { default: MDXContent, toc, metadata } = result;
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
