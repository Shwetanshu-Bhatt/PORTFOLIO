import Head from 'next/head';
import World3D from '@/components/World3D';

export default function WorldPage() {
  return (
    <>
      <Head>
        <title>3D World | Shwetanshu Bhatt</title>
        <meta name="description" content="Explore my 3D interactive portfolio world. Drive around and discover more about me." />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href="https://shwetanshubhatt.sifakalabs.in/world/" />
        <link rel="alternate" hrefLang="en-IN" href="https://shwetanshubhatt.sifakalabs.in/world/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="3D World | Shwetanshu Bhatt" />
        <meta property="og:description" content="Explore Shwetanshu Bhatt's interactive 3D portfolio world and discover selected work, skills, and experiments." />
        <meta property="og:url" content="https://shwetanshubhatt.sifakalabs.in/world/" />
      </Head>
      <World3D onBack={() => window.history.back()} />
    </>
  );
}
