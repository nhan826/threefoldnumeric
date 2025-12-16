import '../styles/globals.css'
import '../public/tailwind.css'
import { Layout } from '../components/Layout'
import { NumericProvider } from '../context/NumericContext'

export default function MyApp({ Component, pageProps }) {
  return (
    <NumericProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </NumericProvider>
  )
}
