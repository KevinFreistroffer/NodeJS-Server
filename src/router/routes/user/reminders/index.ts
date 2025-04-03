import { Request, Response } from "express";
import { Router } from "express";
import { body } from "express-validator";
import { isValidObjectId } from "mongoose";
import * as nodemailer from "nodemailer";
import { EStage } from "../../../../defs/enums";
import { ObjectId } from "mongodb";
import { updateOne } from "@/operations/user_operations";
import { asyncRouteHandler } from "@/utils";
const router = Router();

// Validation rules for reminder creation
const createReminderValidation = [
  body("userId")
    .notEmpty()
    .withMessage("UserId is required")
    .custom((value) => {
      if (!isValidObjectId(value)) {
        throw new Error("Invalid userId format");
      }
      return true;
    }),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().optional(),
  body("date").isISO8601().withMessage("Invalid date format"),
  body("time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (HH:MM)"),
  body("recurring").isBoolean().withMessage("Recurring must be a boolean"),
  body("recurrenceType")
    .if(body("recurring").equals("true"))
    .isIn(["daily", "weekly", "monthly", "yearly", "custom"])
    .withMessage("Invalid recurrence type"),
  body("customFrequency")
    .if(body("recurrenceType").equals("custom"))
    .isInt({ min: 1 })
    .withMessage("Custom frequency must be a positive number"),
  body("customUnit")
    .if(body("recurrenceType").equals("custom"))
    .isIn(["days", "weeks", "months", "years"])
    .withMessage("Invalid custom unit"),
  body("repeatOn")
    .if(body("recurrenceType").equals("weekly"))
    .isArray()
    .withMessage("RepeatOn must be an array of days")
    .custom((value) => {
      const validDays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      return value.every((day: string) =>
        validDays.includes(day.toLowerCase())
      );
    })
    .withMessage("Invalid days in repeatOn array"),
  body("ends")
    .if(body("recurring").equals("true"))
    .isIn(["never", "on", "after"])
    .withMessage("Invalid ends value"),
  body("endDate")
    .if(body("ends").equals("on"))
    .isISO8601()
    .withMessage("Invalid end date format"),
  body("occurrences")
    .if(body("ends").equals("after"))
    .isInt({ min: 1 })
    .withMessage("Occurrences must be a positive number"),
];

router.post(
  "/",
  createReminderValidation,
  asyncRouteHandler(async (req: Request, res: Response) => {
    console.log("Creating reminder");
    const { userId } = req.body;
    const reminderData = req.body;

    console.log("userId:", userId);
    console.log("reminderData:", reminderData);

    const updateResult = await updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          reminders: {
            _id: new ObjectId(),
            title: reminderData.title,
            description: reminderData.description,
            date: reminderData.date,
            time: reminderData.time,
            recurring: reminderData.recurring,
            recurrenceType: reminderData.recurrenceType,
            customFrequency: reminderData.customFrequency,
            customUnit: reminderData.customUnit,
            repeatOn: reminderData.repeatOn,
            ends: reminderData.ends,
            endDate: reminderData.endDate,
            occurrences: reminderData.occurrences,
          },
        },
      }
    );

    console.log("Update result:", JSON.stringify(updateResult, null, 2));

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        message: "Reminder was not added to user",
      });
    }

    // Send email notification
    const transport = `smtps://${process.env.EMAIL_FROM}:${process.env.EMAIL_APP_PASSWORD}@smtp.gmail.com`;
    const transporter = nodemailer.createTransport(transport);

    const mailOptions = {
      from: `Reminder Notification 📅 <${process.env.EMAIL_FROM}>`,
      to: `${process.env.NODE_ENV === EStage.DEVELOPMENT
        ? process.env.EMAIL_FROM
        : reminderData.email // You'll need to ensure this is available
        }`,
      subject: `Reminder: ${reminderData.title}`,
      text: `
          Your reminder has been set:

          Title: ${reminderData.title}
          ${reminderData.description
          ? `Description: ${reminderData.description}\n`
          : ""
        }
          Date: ${reminderData.date}
          Time: ${reminderData.time}
          ${reminderData.recurring
          ? `
          Recurring: ${reminderData.recurrenceType}
          ${reminderData.ends !== "never" ? `Ends: ${reminderData.ends}` : ""}
          `
          : ""
        }
        `,
      html: `
          <h2>Your reminder has been set</h2>
          <div style="font-family: 'Tahoma', geneva, sans-serif; color: #333; padding: 20px;">
            <p><strong>Title:</strong> ${reminderData.title}</p>
            ${reminderData.description
          ? `<p><strong>Description:</strong> ${reminderData.description}</p>`
          : ""
        }
            <p><strong>Date:</strong> ${reminderData.date}</p>
            <p><strong>Time:</strong> ${reminderData.time}</p>
            ${reminderData.recurring
          ? `
            <p><strong>Recurring:</strong> ${reminderData.recurrenceType}</p>
            ${reminderData.ends !== "never"
            ? `<p><strong>Ends:</strong> ${reminderData.ends}</p>`
            : ""
          }
            `
          : ""
        }
          </div>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Reminder created successfully and notification sent",
      data: { userId, ...reminderData },
    });
  })
);

module.exports = router;
