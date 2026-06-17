import { z } from "zod";

export const step2Schema = z.object({
  selectedSessionIds: z
    .array(z.string())
    .min(1, { error: "Please select at least one session" }),
});

export type Step2Data = z.infer<typeof step2Schema>;
