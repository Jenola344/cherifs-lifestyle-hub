import Hero from '@/components/home/Hero';
import About from '@/components/home/About';
import Services from '@/components/home/Services';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import ArtCollection from '@/components/home/ArtCollection';
import Lifestyle from '@/components/home/Lifestyle';
import Testimonials from '@/components/home/Testimonials';

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <FeaturedProjects />
      <ArtCollection />
      <Lifestyle />
      <Testimonials />
    </main>
  );
}
