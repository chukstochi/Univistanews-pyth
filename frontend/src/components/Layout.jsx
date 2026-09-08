import Header from "./Header";
import Footer from "./Footer";
import NewsTicker from "./NewsTicker";

export default function Layout({ children, showTicker = true }) {
  return (
    <>
      <Header />
      {showTicker && <NewsTicker />}
      <main>{children}</main>
      <Footer />
    </>
  );
}
