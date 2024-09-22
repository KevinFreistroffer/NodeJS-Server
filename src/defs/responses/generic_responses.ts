import {
  ACCESS_DENIED,
  INVALID_REQUEST,
  MISSING_BODY_FIELDS,
  MISSING_PARAMETERS,
  RESOURCE_NOT_FOUND,
  ROUTE_NOT_FOUND,
  SUCCESS,
  UNAUTHORIZED,
} from "../constants";
import { EMessageType } from "../enums";
import { ISanitizedUser, IJournal } from "../interfaces";

export interface IResponse {
  message: EMessageType;
  description: string;
  code: number;
  data:
    | ISanitizedUser
    | ISanitizedUser[]
    | IJournal
    | IJournal[]
    | boolean
    | undefined;
}

export interface IResponseBodies {
  resource_not_found: (description?: string) => IResponse;
  invalid_request: (description?: string) => IResponse;
  missing_parameters: (description?: string) => IResponse;
  missing_body_fields: (description?: string) => IResponse;
  unauthorized: (description?: string) => IResponse;
  access_denied: (description?: string) => IResponse;
  route_not_found: (description?: string) => IResponse;
  caught_error: (error: unknown, description?: string) => IResponse;
  something_went_wrong: () => IResponse;
  too_many_requests: () => IResponse;
  success: (
    data?:
      | ISanitizedUser
      | ISanitizedUser[]
      | IJournal
      | IJournal[]
      | boolean
      | undefined,
    description?: string
  ) => IResponse;
}

export const statusCodes = {
  resource_not_found: 404,
  invalid_request: 400,
  missing_parameters: 400,
  missing_body_fields: 422,
  unauthorized: 401,
  access_denied: 403,
  route_not_found: 404,
  caught_error: 500,
  something_went_wrong: 500,
  too_many_requests: 429,
  success: 200,
};

export const responses: IResponseBodies = {
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
  unauthorized: (description) => ({
    message: EMessageType.error,
    description: description || UNAUTHORIZED,
    code: 1008,
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
  caught_error: (error: unknown, description?: string) => ({
    message: EMessageType.error,
    description:
      // TODO: shouldn't return an error. Need to log the actual error
      description ||
      `Caught error: ${error instanceof Error ? error.message : String(error)}`,
    code: 1013,
    data: undefined,
  }),
  something_went_wrong: () => ({
    message: EMessageType.error,
    description: "Something went wrong!",
    code: 1014,
    data: undefined,
  }),
  too_many_requests: () => ({
    message: EMessageType.error,
    description:
      "Too many requests sent from this IP address. Please try again later.",
    code: 429,
    data: undefined,
  }),
  success: (
    data?: ISanitizedUser | ISanitizedUser[] | IJournal | IJournal[] | boolean,
    description?: string
  ) => ({
    message: EMessageType.success,
    description: description || SUCCESS,
    code: 2000,
    data: data || undefined,
  }),
};
