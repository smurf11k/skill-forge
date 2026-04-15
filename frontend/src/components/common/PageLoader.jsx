import Layout from "../Layout";

export default function PageLoader({ message = "Loading…" }) {
  return (
    <Layout>
      <div className="p-8 text-muted-foreground">{message}</div>
    </Layout>
  );
}
