import {
  EMAIL_AVAILABLE,
  EMAIL_NOT_AVAILABLE,
  ERROR_INSERTING_USER,
  COULD_NOT_UPDATE,
  INVALID_PASSWORD,
  INVALID_USERNAME_OR_EMAIL_AND_PASSWORD,
  SUCCESS,
  USERNAME_AVAILABLE,
  USERNAME_NOT_AVAILABLE,
  USERNAME_OR_EMAIL_ALREADY_REGISTERED,
  USERS_NOT_FOUND,
  USER_NOT_FOUND,
} from "../../constants";
import { EMessageType } from "../../enums";
import { ISanitizedUser } from "../../interfaces";
import {
  IResponse,
  responses as genericResponses,
  statusCodes as genericStatusCodes,
  IResponseBase,
} from "../generic";

export interface IUsernameAvailableResponse
  extends Omit<IResponseBase, "data"> {
  usernameAvailable: boolean;
}

export interface IEmailAvailableResponse extends Omit<IResponseBase, "data"> {
  emailAvailable: boolean;
}

export interface IResponses {
  missing_body_fields: (description?: string) => IResponse;
  user_not_found: (description?: string) => IResponse;
  users_not_found: (description?: string) => IResponse;
  invalid_usernameOrEmail_and_password: (description?: string) => IResponse;
  invalid_password: (description?: string) => IResponse;
  username_or_email_already_registered: (description?: string) => IResponse;
  username_available: (
    usernameAvailable: boolean,
    description?: string
  ) => IUsernameAvailableResponse;
  email_available: (
    emailAvailable: boolean,
    description?: string
  ) => IEmailAvailableResponse;
  error_inserting_user: (description?: string) => IResponse;
  could_not_update: (description?: string) => IResponse;
  could_not_send_email: (description?: string) => IResponse;
  resource_not_found: (description?: string) => IResponse;
  success: (
    user?: ISanitizedUser | ISanitizedUser[],
    description?: string
  ) => IResponse;
}

export type IResponsesWithAvailability = IResponses & {
  username_available: (
    usernameAvailable: boolean,
    description?: string
  ) => IUsernameAvailableResponse;
  email_available: (
    emailAvailable: boolean,
    description?: string
  ) => IEmailAvailableResponse;
};

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
  username_available: (usernameAvailable: boolean, description?: string) => ({
    message: EMessageType.success,
    description:
      description ||
      (usernameAvailable ? USERNAME_AVAILABLE : USERNAME_NOT_AVAILABLE),
    code: 1011,
    usernameAvailable: usernameAvailable,
  }),
  email_available: (emailAvailable: boolean, description?: string) => ({
    message: EMessageType.success,
    description:
      description || (emailAvailable ? EMAIL_AVAILABLE : EMAIL_NOT_AVAILABLE),
    code: 1012,
    emailAvailable: emailAvailable,
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
  could_not_send_email: (description) => ({
    message: EMessageType.error,
    description: description || "Could not send email",
    code: 1017,
    data: undefined,
  }),
  resource_not_found: (description) => ({
    message: EMessageType.error,
    description: description || "Resource not found",
    code: 1016,
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

// Status codes exist to be meaningful while the server is under development.
// TODO: delete these when the server is complete. All status codes should be generic.
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
  could_not_send_email: 500,
  error_inserting_user: 500,
  could_not_update: 500,
  success: 200,
};
