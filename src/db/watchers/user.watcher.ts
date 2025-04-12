import { MongoClient, ChangeStream, ChangeStreamDocument } from "mongodb";
import { getClient, usersCollection } from "@/db";
import { EmailController } from "@/router/routes/auth/send-verification-email/email.controller";
import { Request, Response } from "express";

export class UserWatcher {
  private changeStream: ChangeStream | null = null;
  private isWatching: boolean = false;

  async startWatching() {
    if (this.isWatching) return;

    const client = await getClient();
    try {
      await client.connect();
      const collection = usersCollection(client);

      // Create a change stream that watches for insert operations with a pipeline filter
      const changeStream = collection.watch([
        {
          $match: {
            operationType: "insert",
            "fullDocument.username": { $exists: true }, // Ensure it's a user document
            "fullDocument.email": { $exists: true }     // Ensure it's a user document
          }
        }
      ], {
        fullDocument: "updateLookup",
      });

      this.changeStream = changeStream;

      changeStream.on("change", async (change: ChangeStreamDocument) => {
        if (change.operationType === "insert") {
          const user = change.fullDocument;

          // Create mock request and response objects
          const mockReq = {
            body: { email: user.email }
          } as Request;

          const mockRes = {
            status: (code: number) => ({
              json: (data: any) => {
                console.log(`Verification email sent to ${user.email}`);
              }
            })
          } as Response;

          // Send verification email
          await EmailController.sendVerification(mockReq, mockRes);
        }
      });

      this.isWatching = true;
      console.log("Started watching for user creation events");
    } catch (error) {
      console.error("Error setting up user watcher:", error);
      await client.close();
    }
  }

  async stopWatching() {
    if (this.changeStream) {
      await this.changeStream.close();
      this.isWatching = false;
      console.log("Stopped watching for user creation events");
    }
  }
} 