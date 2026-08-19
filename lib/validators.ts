import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit faire au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  phone: z.string().min(8, "Le numéro de téléphone doit faire au moins 8 chiffres"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Veuillez confirmer votre mot de passe"),
  ifu: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "La ville est requise"),
  country: z.string().min(2, "Le pays est requis"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  identifier: z.string().min(3, "Veuillez entrer votre email ou téléphone"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const onboardingCompanySchema = z.object({
  name: z.string().min(2, "Le nom de l'entreprise doit faire au moins 2 caractères"),
  legalName: z.string().optional(),
  country: z.string().min(2, "Veuillez spécifier le pays"),
  city: z.string().min(2, "Veuillez spécifier la ville"),
  phone: z.string().min(8, "Numéro de téléphone professionnel obligatoire"),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  activityType: z.string().min(2, "Le type d'activité est requis"),
  legalForm: z.string().optional().or(z.literal("")),
});
