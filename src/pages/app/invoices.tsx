import Invoices from "~/components/invoices/Invoices";
import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";

const invoices = () => {
  return (
    <Layout title="Invoices">
      <Invoices />
    </Layout>
  );
};

export default withAuth(invoices);
