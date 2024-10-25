import {
  ACCESS_DENIED,
  INVALID_REQUEST,
  MISSING_BODY_FIELDS,
  MISSING_PARAMETERS,
  RESOURCE_NOT_FOUND,
  ROUTE_NOT_FOUND,
  SOMETHING_WENT_WRONG,
  TOO_MANY_REQUESTS,
} from "../../constants";
import { EMessageType } from "../../enums";
import { ISanitizedUser, IJournal } from "../../interfaces";

export interface IResponseBase {
  message: EMessageType;
  description: string;
  code: number;
}

export interface IResponse extends IResponseBase {
  data:
    | ISanitizedUser
    | ISanitizedUser
    | ISanitizedUser[]
    | IJournal
    | IJournal[]
    | boolean
    | string
    | undefined;
}

export interface IGenericResponses {
  resource_not_found: (description?: string) => IResponse;
  invalid_request: (description?: string) => IResponse;
  missing_parameters: (description?: string) => IResponse;
  missing_body_fields: (description?: string) => IResponse;
  access_denied: (description?: string) => IResponse;
  route_not_found: (description?: string) => IResponse;
  caught_error: (error: unknown) => IResponse;
  something_went_wrong: (description?: string) => IResponse;
  success: (
    data?:
      | ISanitizedUser
      | ISanitizedUser[]
      | IJournal
      | IJournal[]
      | boolean
      | string
      | undefined,
    description?: string
  ) => IResponse;
  too_many_requests: (description?: string) => IResponse;
}

export const responses: IGenericResponses = {
  resource_not_found: (description) => ({
    message: EMessageType.error,
    description: description || RESOURCE_NOT_FOUND,
    code: 1002,
    data: undefined,
  }),
  invalid_request: (description) => ({
    message: EMessageType.error,
    description: description || INVALID_REQUEST,
    code: 1005,
    data: undefined,
  }),
  missing_parameters: (description) => ({
    message: EMessageType.error,
    description: description || MISSING_PARAMETERS,
    code: 1006,
    data: undefined,
  }),
  missing_body_fields: (description) => ({
    message: EMessageType.error,
    description: description || MISSING_BODY_FIELDS,
    code: 1007,
    data: undefined,
  }),
  access_denied: (description) => ({
    message: EMessageType.error,
    description: description || ACCESS_DENIED,
    code: 1008,
    data: undefined,
  }),
  route_not_found: (description) => ({
    message: EMessageType.error,
    description: description || ROUTE_NOT_FOUND,
    code: 1009,
    data: undefined,
  }),
  caught_error: (error: unknown) => ({
    message: EMessageType.error,
    description: `Caught error: ${
      error instanceof Error ? error.message : String(error)
    }`,
    code: 1013,
    data: undefined,
  }),
  something_went_wrong: (description?: string) => ({
    message: EMessageType.error,
    description: description || SOMETHING_WENT_WRONG,
    code: 1014,
    data: undefined,
  }),
  success: (
    data:
      | ISanitizedUser
      | ISanitizedUser[]
      | IJournal
      | IJournal[]
      | boolean
      | string
      | undefined,
    description?: string
  ) => ({
    message: EMessageType.success,
    description: description || "Success",
    code: 200,
    data,
  }),
  too_many_requests: (description?: string) => ({
    message: EMessageType.error,
    description: description || TOO_MANY_REQUESTS,
    code: 429,
    data: undefined,
  }),
};

export const statusCodes = {
  resource_not_found: 404,
  invalid_request: 400,
  missing_parameters: 400,
  missing_body_fields: 422,
  access_denied: 403,
  route_not_found: 404,
  caught_error: 500,
  something_went_wrong: 500,
  success: 200,
  too_many_requests: 429,
};
