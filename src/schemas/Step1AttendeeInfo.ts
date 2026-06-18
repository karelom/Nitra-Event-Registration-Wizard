import { z } from "zod";

export const TICKET_ID = {
  GENERAL: "general",
  VIP: "vip",
  STUDENT: "student",
} as const;

export const TICKET_IDS = Object.values(TICKET_ID);
export type TicketId = (typeof TICKET_IDS)[number];

export const attendeeInfoSchema = z.object({
  ticketId: z.enum(TICKET_IDS),
  fullName: z.string().min(1, { error: "Full name is required" }),
  email: z.email({ error: "Please enter a valid email address" }),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, {
      error: "Please enter a valid phone number",
    }),
  company: z.string().min(1, { error: "Company is required" }),
  jobTitle: z.string().min(1, { error: "Job title is required" }),
  shippingAddress: z.string().optional(),
});

export const step1Schema = z.object({
  attendeeInfo: attendeeInfoSchema,
});

export type AttendeeInfo = z.infer<typeof attendeeInfoSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
