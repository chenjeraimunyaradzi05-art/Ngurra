// SEO Metadata for About Page
export const metadata = {
  title: 'About Us',
  description: 'Learn about Tinashe - a culturally-grounded platform connecting First Nations job seekers with meaningful employment, education, and mentorship opportunities.',
  keywords: ['about Tinashe', 'Indigenous employment platform', 'First Nations careers', 'Aboriginal job platform'],
  openGraph: {
    title: 'About Tinashe',
    description: 'A culturally-grounded platform connecting First Nations job seekers with meaningful opportunities.',
    url: 'https://ngurrapathways.life/about',
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutLayout({ children }) {
  return children;
}
