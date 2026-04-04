import { getNavBlogPosts } from '@/lib/blog/registry'
import { getBaseUrl } from '@/lib/core/utils/urls'
import { getBrandConfig } from '@/ee/whitelabeling/branding'
import Footer from '@/app/(home)/components/footer/footer'
import Navbar from '@/app/(home)/components/navbar/navbar'

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const blogPosts = await getNavBlogPosts()
  const baseUrl = getBaseUrl()
  const brand = getBrandConfig()
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: baseUrl,
    logo: `${baseUrl}/logo/primary/small.png`,
    sameAs: ['https://x.com/simdotai'],
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className='flex min-h-screen flex-col bg-[var(--landing-bg)] font-[430] font-season text-[var(--landing-text)]'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <header>
        <Navbar blogPosts={blogPosts} />
      </header>
      <main className='relative flex-1'>{children}</main>
      <Footer />
    </div>
  )
}
