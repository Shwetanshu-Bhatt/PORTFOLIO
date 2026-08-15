import Head from 'next/head';
import World3D from '@/components/World3D';

export default function WorldPage() {
  return (
    <>
      <Head>
        <title>3D World | Shwetanshu Bhatt</title>
        <meta name="description" content="Explore my 3D interactive portfolio world. Drive around and discover more about me." />
      </Head>
      <World3D onBack={() => window.history.back()} />
    </>
  );
}
