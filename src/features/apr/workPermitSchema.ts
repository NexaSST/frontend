import { z } from "zod";
export const workPermitSchema = z.object({
  referenceCode: z.string().trim().min(1).regex(/^[A-Za-z0-9][A-Za-z0-9_/-]*$/),
  title: z.string().trim().min(2),
  workDescription: z.string().trim().min(3),
  activityId: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  participantIds: z.array(z.string()),
  aprDocumentIds: z.array(z.string()),
});

export type WorkPermitForm = z.infer<typeof workPermitSchema>;
