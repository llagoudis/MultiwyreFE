import LoginPage from "~/components/login/LoginForm";
import Layout from "~/components/layout";

const Login = () => {
  return (
    <Layout title="">
      <div className="bg-black">
        <LoginPage />
      </div>
    </Layout>
  );
};

export default Login;
