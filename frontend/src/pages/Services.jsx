import Layout from "../components/Layout";

export default function Services() {
  return (
    <Layout showTicker={false}>
      <div className="static-page">
        <h1>Services</h1>
        <p>Univista News offers:</p>
        <ul>
          <li><strong>Breaking news coverage</strong> across Nigeria, the US, and the world.</li>
          <li><strong>In-depth reporting</strong> on politics, sports, technology, entertainment, business and health.</li>
          <li><strong>Press partnerships</strong> for organizations that want their stories covered fairly and accurately.</li>
          <li><strong>Advertising & sponsorship</strong> opportunities for brands that want to reach our readership.</li>
        </ul>
        <p>Reach out via our <a href="/contact" style={{ color: "var(--crimson)", fontWeight: 600 }}>Contact page</a> to discuss partnership or advertising opportunities.</p>
      </div>
    </Layout>
  );
}
