import { z } from "zod";

export const TICKET_IDS = ["general", "vip", "student"] as const;
export type TicketId = (typeof TICKET_IDS)[number];

export const step1Schema = z.object({
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

export type Step1Data = z.infer<typeof step1Schema>;
