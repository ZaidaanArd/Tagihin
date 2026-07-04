import { z } from "zod";

export const settingsSchema = z.object({
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  business_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  npwp: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  bank_holder: z.string().optional(),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

export const BANKS = [
  "BCA",
  "Mandiri",
  "BNI",
  "BRI",
  "BSI",
  "CIMB Niaga",
  "Danamon",
  "Permata",
  "Maybank",
  "BTN",
  "OCBC NISP",
  "Mega",
  "Other",
] as const;
