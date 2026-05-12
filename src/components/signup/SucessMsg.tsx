import Link from "next/link";
import React from "react";
import { BsFillPatchCheckFill } from "react-icons/bs";

const SuccessMessage: React.FC = () => {
  return (
    <>
      <div className="flex h-screen items-center justify-center">
        <div className="rounded bg-white p-8 text-center shadow-md">
          <div className="flex justify-center text-green-500">
            <BsFillPatchCheckFill className="h-24 w-24" />
          </div>
          <div className="mb-2 mt-10 text-3xl font-bold">
            Account created successfully
          </div>
          <p className="font-semi-bold mb-2 text-lg">
            Your signup was successful and
            <br /> your account has been created successfully
          </p>
          <Link href="/auth/login">
            <button className="mt-5 rounded bg-blue-500 px-16 py-3 text-white">
              Login
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default SuccessMessage;
