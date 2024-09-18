// import { SUCCESS } from "../../constants";
// import { EMessageType } from "../../enums";
// import {
//   IResponse,
//   IGenericResponses,
//   responses as genericResponses,
//   statusCodes as genericStatusCodes,
// } from "../generic";

// export interface IResponses extends IGenericResponses {
//   success: (jwtToken: string | undefined) => IResponse;
// }

// export const responses: IResponses = {
//   ...genericResponses,
//   success: (jwtToken: string | undefined, description?: string) => ({
//     message: EMessageType.success,
//     description: description || SUCCESS,
//     code: 2000,
//     data: jwtToken,
//   }),
// };

// export const statusCodes = {
//   ...genericStatusCodes,
//   success: 200,
// };
