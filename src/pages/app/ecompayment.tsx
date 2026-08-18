import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";
import Button from "~/components/common/Button";
import {
  createEcomUrlTransaction,
  getMerchantUrlToken,
} from "~/service/ApiRequests";

const ecompayment = () => {
  const handlePayment = async () => {
    const merchantCredentials = {
      projectId: "1",
      privateKey: "neGliqugApxmTFQiuv5ZnX4ax9hRC71vuP6skh0A0iU=",
      publicKey: "QuX6yNtgEJzu7R04z0QjSF5A/Ay5J8DjDaiPisUg6ZI=",
    };

    const paymentData = {
      customerId: "38",
      orderId: "123",
      requestedAmount: "125",
      requestedAssetId: "EUR",
      successRedirectURL:
        process.env.NEXT_PUBLIC_SUCCESS_URL ||
        `${window.location.origin}/buy/success`,
      failedRedirectURL: `${window.location.origin}/buy/failed`,
      customerEmail: "test@example.com",
    };

    try {
      const tokenResponse = await getMerchantUrlToken(merchantCredentials);
      const token = tokenResponse.data.token;

      const response = await createEcomUrlTransaction(paymentData, token);
      if (response?.data?.transaction) {
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
