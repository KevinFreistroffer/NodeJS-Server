// import {
//   ACCESS_DENIED,
//   EMAIL_NOT_AVAILABLE,
//   ERROR_INSERTING_USER,
//   COULD_NOT_UPDATE,
//   INVALID_PASSWORD,
//   INVALID_REQUEST,
//   INVALID_USERNAME_OR_EMAIL_AND_PASSWORD,
//   MISSING_BODY_FIELDS,
//   MISSING_PARAMETERS,
//   RESOURCE_NOT_FOUND,
//   ROUTE_NOT_FOUND,
//   SUCCESS,
//   USERNAME_NOT_AVAILABLE,
//   USERNAME_OR_EMAIL_ALREADY_REGISTERED,
//   USERS_NOT_FOUND,
//   USER_NOT_FOUND,
// } from "../constants";
// import { EMessageType } from "../enums";
// import { ISanitizedUser } from "../interfaces";
// import { IResponse, IResponseBase } from "./generic_responses";

// export interface IUsernameAvailableResponse extends IResponseBase {
//   usernameAvailable: boolean;
// }

// export interface IEmailAvailableResponse extends IResponseBase {
//   emailAvailable: boolean;
// }

// export interface IResponseBodies {
//   user_not_found: (description?: string) => IResponse;
//   users_not_found: (description?: string) => IResponse;
//   resource_not_found: (description?: string) => IResponse;
//   invalid_usernameOrEmail_and_password: (description?: string) => IResponse;
//   invalid_password: (description?: string) => IResponse;
//   invalid_request: (description?: string) => IResponse; // TODO is this going to get used?
//   missing_parameters: (description?: string) => IResponse;
//   missing_body_fields: (description?: string) => IResponse;
//   access_denied: (description?: string) => IResponse;
//   username_or_email_already_registered: (description?: string) => IResponse;
//   username_not_available: (description?: string) => IResponse;
//   email_not_available: (description?: string) => IResponse;
//   caught_error: (error: unknown) => IResponse;
//   error_inserting_user: (description?: string) => IResponse;
//   could_not_update: (description?: string) => IResponse;
//   success: (user?: ISanitizedUser | ISanitizedUser[]) => IResponse;
// }

// export const responses: IResponseBodies = {
//   user_not_found: (description) => ({
//     message: EMessageType.error,
//     description: description || USER_NOT_FOUND,
//     code: 1000,
//     data: undefined,
//   }),
//   users_not_found: (description) => ({
//     message: EMessageType.error,
//     description: description || USERS_NOT_FOUND,
//     code: 1001,
//     data: undefined,
//   }),
//   resource_not_found: (description) => ({
//     message: EMessageType.error,
//     description: description || RESOURCE_NOT_FOUND,
//     code: 1002,
//     data: undefined,
//   }),
//   invalid_usernameOrEmail_and_password: (description) => ({
//     message: EMessageType.error,
//     description: description || INVALID_USERNAME_OR_EMAIL_AND_PASSWORD,
//     code: 1003,
//     data: undefined,
//   }),
//   invalid_password: (description) => ({
//     message: EMessageType.error,
//     description: description || INVALID_PASSWORD,
//     code: 1004,
//     data: undefined,
//   }),
//   invalid_request: (description) => ({
//     message: EMessageType.error,
//     description: description || INVALID_REQUEST,
//     code: 1005,
//     data: undefined,
//   }),
//   missing_parameters: (description) => ({
//     message: EMessageType.error,
//     description: description || MISSING_PARAMETERS,
//     code: 1006,
//     data: undefined,
//   }),
//   missing_body_fields: (description) => ({
//     message: EMessageType.error,
//     description: description || MISSING_BODY_FIELDS,
//     code: 1007,
//     data: undefined,
//   }),
//   access_denied: (description) => ({
//     message: EMessageType.error,
//     description: description || ACCESS_DENIED,
//     code: 1008,
//     data: undefined,
//   }),
//   username_or_email_already_registered: (description) => ({
//     message: EMessageType.error,
//     description: description || USERNAME_OR_EMAIL_ALREADY_REGISTERED,
//     code: 1010,
//     data: undefined,
//   }),
//   username_not_available: (description) => ({
//     message: EMessageType.error,
//     description: description || USERNAME_NOT_AVAILABLE,
//     code: 1011,
//     data: undefined,
//   }),
//   email_not_available: (description) => ({
//     message: EMessageType.error,
//     description: description || EMAIL_NOT_AVAILABLE,
//     code: 1012,
//     data: undefined,
//   }),
//   caught_error: (error: unknown) => ({
//     message: EMessageType.error,
//     description: `Caught error: ${
//       error instanceof Error ? error.message : String(error)
//     }`,
//     code: 1013,
//     data: undefined,
//   }),
//   error_inserting_user: (description) => ({
//     message: EMessageType.error,
//     description: description || ERROR_INSERTING_USER,
//     code: 1015,
//     data: undefined,
//   }),
//   could_not_update: (description) => ({
//     message: EMessageType.error,
//     description: description || COULD_NOT_UPDATE,
//     code: 1016,
//     data: undefined,
//   }),
//   success: (
//     user?: ISanitizedUser | ISanitizedUser[],
//     description?: string
//   ) => ({
//     message: EMessageType.success,
//     description: description || SUCCESS,
//     code: 2000,
//     data: user,
//   }),
// };
