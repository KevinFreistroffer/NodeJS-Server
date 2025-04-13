import { Request, Response } from "express";
import { findAllUsers } from "@/db/operations/user_operations";
import { responses as genericResponses, IResponse } from "@/defs/responses/generic";

export class UserController {
  static async getAll(req: Request, res: Response<IResponse>) {
    console.log("GET /user/users");
    const doc = await findAllUsers();
    console.log("DOC", doc);
    return res.json(genericResponses.success(doc));
  }
} 