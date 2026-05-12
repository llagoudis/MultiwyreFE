import Button from "../../common/Button";
import ExchangeInput from "../../common/ExchangeInput";
import { useForm } from "react-hook-form";
import CloseBtn from "~/assets/general/close.svg";
import Image, { type StaticImageData } from "next/image";

interface VerifyEmailProps {
  close: () => void;
  handleChangeScreen: (screen: string) => void;
  onSubmit: (password: string) => void;
  loading: boolean;
}

interface Form {
  password: string;
}

const SetPassword: React.FC<VerifyEmailProps> = ({
  close,
  onSubmit,
  loading,
}) => {
  const { handleSubmit, control } = useForm<Form>();

  const submit = (data: any) => {
    onSubmit(data.password);
  };

  return (
    <div>
      <div className="mb-2 flex items-center">
        <div className="text-2xl font-bold">Company Profile creation</div>
        <button className="ml-auto" onClick={close}>
          <Image
            className="scale-125 cursor-pointer"
            src={CloseBtn as StaticImageData}
            alt="close"
          />
        </button>
      </div>

      <p className=" my-6">Set your password</p>
      <form onSubmit={handleSubmit(submit)}>
        <div className="mb-4">
          <ExchangeInput
            control={control}
            label="Enter password"
            name="password"
            type="password"
            placeholder="********"
            rules={{
              required: "Password is required",
              validate: (value: string) => {
                const hasSmallLetter = /[a-z]/.test(value);
                const hasCapitalLetter = /[A-Z]/.test(value);
                const hasNumber = /\d/.test(value);
                const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

                return (
                  (value.length >= 6 &&
                    hasSmallLetter &&
                    hasCapitalLetter &&
                    hasNumber &&
                    hasSymbol) ||
                  "Password should meet the specified criteria"
                );
              },
            }}
          />
        </div>

        <div className="mt-4 flex">
          <button type="button" className="font-bold" onClick={close}>
            Cancel
          </button>
          <Button
            type="submit"
            className="ml-auto px-10 py-3"
            title="Next"
            loading={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default SetPassword;
