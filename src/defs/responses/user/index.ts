import {
  ACCESS_DENIED,
  EMAIL_AVAILABLE,
  EMAIL_NOT_AVAILABLE,
  ERROR_INSERTING_USER,
  COULD_NOT_UPDATE,
  INVALID_PASSWORD,
  INVALID_REQUEST,
  INVALID_USERNAME_OR_EMAIL_AND_PASSWORD,
  MISSING_BODY_FIELDS,
  MISSING_PARAMETERS,
  RESOURCE_NOT_FOUND,
  ROUTE_NOT_FOUND,
  SUCCESS,
  USERNAME_AVAILABLE,
  USERNAME_NOT_AVAILABLE,
  USERNAME_OR_EMAIL_ALREADY_REGISTERED,
  USERS_NOT_FOUND,
  USER_NOT_FOUND,
} from "../../constants";
import { EMessageType } from "../../enums";
import { ISanitizedUser, IJournal } from "../../interfaces";
import {
  IResponse,
  IGenericResponses,
  responses as genericResponses,
  statusCodes as genericStatusCodes,
} from "../generic";

// export interface IResponseWithUser extends IResponse {
//   message: EMessageType;
//   description: string;
//   code: number;
//   data: ISanitizedUser | ISanitizedUser[] | undefined;
// }

// export interface IResponseWithJournals {
//   message: EMessageType;
//   description: string;
//   code: number;
//   data: IJournal | IJournal[] | undefined;
// }

// export interface IUsernameAvailableResponse extends IResponse {
//   message: EMessageType;
//   description: string;
//   code: number;
//   usernameAvailable: boolean | undefined;
// }

// export interface IEmailAvailableResponse extends IResponse {
//   message: EMessageType;
//   description: string;
//   code: number;
//   emailAvailable: boolean | undefined;
// }

export interface IResponses {
  user_not_found: (description?: string) => IResponse;
  users_not_found: (description?: string) => IResponse;
  invalid_usernameOrEmail_and_password: (description?: string) => IResponse;
  invalid_password: (description?: string) => IResponse;
  username_or_email_already_registered: (description?: string) => IResponse;
  username_available: (
    usernameAvailable: boolean,
    description?: string
  ) => IResponse;
  email_available: (emailAvailable: boolean, description?: string) => IResponse;
  error_inserting_user: (description?: string) => IResponse;
  could_not_update: (description?: string) => IResponse;
  success: (user?: ISanitizedUser | ISanitizedUser[]) => IResponse;
}

export const responses: IResponses = {
  ...genericResponses,
  user_not_found: (description) => ({
    message: EMessageType.error,
    description: description || USER_NOT_FOUND,
    code: 1000,
    data: undefined,
  }),
  users_not_found: (description) => ({
    message: EMessageType.error,
    description: description || USERS_NOT_FOUND,
    code: 1001,
    data: undefined,
  }),
  invalid_usernameOrEmail_and_password: (description) => ({
    message: EMessageType.error,
    description: description || INVALID_USERNAME_OR_EMAIL_AND_PASSWORD,
    code: 1003,
    data: undefined,
  }),
  invalid_password: (description) => ({
    message: EMessageType.error,
    description: description || INVALID_PASSWORD,
    code: 1004,
    data: undefined,
  }),
  username_or_email_already_registered: (description) => ({
    message: EMessageType.error,
    description: description || USERNAME_OR_EMAIL_ALREADY_REGISTERED,
    code: 1010,
    data: undefined,
  }),
  username_available: (usernameAvailable: boolean, description) => ({
    message: EMessageType.success,
    description:
      description ||
      (usernameAvailable ? USERNAME_AVAILABLE : USERNAME_NOT_AVAILABLE),
    code: 1011,
    data: usernameAvailable || undefined,
  }),
  email_available: (emailAvailable: boolean, description?: string) => ({
    message: EMessageType.success,
    description:
      description || (emailAvailable ? EMAIL_AVAILABLE : EMAIL_NOT_AVAILABLE),
    code: 1012,
    data: emailAvailable || undefined,
  }),
  error_inserting_user: (description) => ({
    message: EMessageType.error,
    description: description || ERROR_INSERTING_USER,
    code: 1015,
    data: undefined,
  }),
  could_not_update: (description) => ({
    message: EMessageType.error,
    description: description || COULD_NOT_UPDATE,
    code: 1015,
    data: undefined,
  }),
  success: (
    user?: ISanitizedUser | ISanitizedUser[],
    description?: string
  ) => ({
    message: EMessageType.success,
    description: description || SUCCESS,
    code: 2000,
    data: user,
  }),
};

export const statusCodes = {
  ...genericStatusCodes,
  user_not_found: 404,
  users_not_found: 404,
  invalid_usernameOrEmail_and_password: 401,
  invalid_password: 401,
  missing_parameters: 400,
  missing_body_fields: 422,
  username_or_email_already_registered: 409,
  username_available: 409,
  email_available: 409,
  error_inserting_user: 500,
  could_not_update: 500,
  success: 200,
};
