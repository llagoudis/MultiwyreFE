import Button from "../../common/Button";
import ExchangeInput from "../../common/ExchangeInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import CloseBtn from "~/assets/general/close.svg";
import Image, { type StaticImageData } from "next/image";

interface VerifyEmailProps {
  close: () => void;
  handleChangeScreen: (screen: string) => void;
  email: string;
  onEmailSubmit: (email: string) => void;
  loading: boolean;
}

interface Form {
  email: string;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({
  close,
  email,
  onEmailSubmit,
  loading,
}) => {
  const { handleSubmit, control, reset } = useForm<Form>();

  const onSubmit = (data: any) => {
    onEmailSubmit(data.email);
  };

  useEffect(() => {
    email && reset({ email });
  }, [email]);

  return (
    <div>
      <button className="absolute right-[2.5rem] top-[3rem]" onClick={close}>
        <Image
          className="scale-125 cursor-pointer"
          src={CloseBtn as StaticImageData}
          alt="close"
        />
      </button>
      <div className="text-2xl font-bold">Verify your identity</div>

      <div className="my-8 font-medium">
        We will send you a confirmation to verify your email
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <ExchangeInput
            control={control}
            label="Email"
            name="email"
            type="text"
            placeholder="Sombody@someemail.com"
            rules={{
              required: "Email is required",
              validate: (value: string) => {
                const emailPattern =
                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                if (!emailPattern.test(value)) {
                  return "Invalid email address";
                }
                return true; // Return true to indicate the validation passed
              },
            }}
          />
        </div>
        <div className="mt-8 flex">
          <button type="button" className="font-bold" onClick={close}>
            Cancel
          </button>
          <Button
            type="submit"
            className="ml-auto px-10 py-3"
            title="Continue"
            loading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default VerifyEmail;
