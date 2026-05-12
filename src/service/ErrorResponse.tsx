const ErrorResponse = (error: any) => {
  const data = error?.response?.data;
  const message = data?.message
    ? (data?.message as string)
    : "Something went wrong!! please try again";
  return message;
};

export default ErrorResponse;
