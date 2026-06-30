import { decryptResponse } from "~/helpers/helper";
import ErrorResponse from "./ErrorResponse";

const ApiHandler = async <T,>(
  promise: (data?: any) => Promise<{ data: APIResponse<T> }>,
  data?: any,
): Promise<[APIResponse<T> | null, string | null]> => {
  try {
    const response = data ? await promise(data) : await promise();
    const res = decryptResponse(response.data);

    return [res, null];
  } catch (error) {
    const message = ErrorResponse(error);
    return [null, message];
  }
};

const withoutProtection = async <T,>(
  promise: (data?: any) => Promise<{ data: APIResponse<T> }>,
  data?: any,
): Promise<[APIResponse<T> | null, string | null]> => {
  try {
    const response = data ? await promise(data) : await promise();
    const res = response.data;
    return [res, null];
  } catch (error) {
    const message = ErrorResponse(error);
    return [null, message];
  }
};

export { ApiHandler, withoutProtection };
