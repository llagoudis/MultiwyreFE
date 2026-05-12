import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";
import Button from "~/components/common/Button";
import axios from "axios";
// import { useRouter } from "next/router";

const ecompayment = () => {
  // const router = useRouter();
  const handlePayment = async () => {
    const paymentData = {
      projectId: "1",
      customerId: "38",
      privateKey: "neGliqugApxmTFQiuv5ZnX4ax9hRC71vuP6skh0A0iU=",
      publicKey: "QuX6yNtgEJzu7R04z0QjSF5A/Ay5J8DjDaiPisUg6ZI=",
      orderId: "123",
      requestedAmount: "125",
      requestedAssetId: "EUR",
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/ecomtransaction/url/create",
        paymentData,
      );
      if (response) {
        window.location.href = response.data.transaction;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout title="Invoices">
      <Button
        className="btn-solid mx-5 my-5 px-12 py-5"
        title="Pay"
        type="button"
        onClick={handlePayment}
      />
    </Layout>
  );
};

export default withAuth(ecompayment);
