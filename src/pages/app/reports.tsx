import Layout from "~/components/layout";
import Reports from "~/components/reports/Reports";
import withAuth from "~/components/withAuth";

const ReportsPage = () => {
  return (
    <Layout title="History">
      <Reports />
    </Layout>
  );
};

export default withAuth(ReportsPage);
