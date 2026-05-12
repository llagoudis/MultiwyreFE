import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";
import Profile from "~/components/profile/Profile";

const profile = () => {
  return (
    <Layout title="Profile">
      <Profile />
    </Layout>
  );
};

export default withAuth(profile);
