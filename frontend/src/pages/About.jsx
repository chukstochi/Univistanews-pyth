import Layout from "../components/Layout";

export default function About() {
  return (
    <Layout showTicker={false}>
      <div className="static-page">
        <h1>About Univista News</h1>
        <p>
          Univista News is a digital newsroom bringing readers accurate, timely reporting
          across Nigeria, the United States, and beyond. Our editorial team and contributing
          authors cover politics, sports, technology, entertainment, business and health,
          publishing updates as stories develop.
        </p>
        <p>
          We believe good journalism is built on accuracy, speed, and clarity — every article
          on Univista News carries its author's name and a timestamp so readers always know
          who reported it and when.
        </p>
      </div>
    </Layout>
  );
}
