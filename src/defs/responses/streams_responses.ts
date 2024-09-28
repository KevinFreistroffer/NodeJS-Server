// import { RESOURCE_NOT_FOUND, SUCCESS } from "../constants";
// import { EMessageType } from "../enums";
// import { ISanitizedUser } from "../interfaces";

// export interface IResponse {
//   message: EMessageType;
//   data: any;
// }

// export interface IResponseBodies {
//   resource_not_found: (description?: string) => IResponse;
//   success: (user?: ISanitizedUser | ISanitizedUser[]) => IResponse;
// }

// export const statusCodes = {
//   resource_not_found: 404,
//   success: 200,
// };

// export const responses: IResponseBodies = {
//   resource_not_found: (description) => ({
//     message: EMessageType.error,
//     data: {
//       description: description || RESOURCE_NOT_FOUND,
//       code: 1002,
//       user: undefined,
//     },
//   }),

//   success: (
//     user?: ISanitizedUser | ISanitizedUser[],
//     description?: string
//   ) => ({
//     message: EMessageType.success,
//     data: {
//       description: description || SUCCESS,
//       code: 2000,
//       user,
//     },
//   }),
// };
