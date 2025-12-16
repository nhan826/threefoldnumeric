import { Landing } from '../components/Landing';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Home() {
  return (
    <>
      <Head>
        <title>Numerica — Interactive Evaluation of ML Numeric Systems</title>
        <meta name="description" content="Explore numeric systems for ML" />
      </Head>
      <Landing />
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
