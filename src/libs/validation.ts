import * as yup from "yup";

export const RegisterSchema = yup.object({
  userName: yup
    .string()
    .required("Username is required")
    .min(3, "Minimum 3 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "At least 6 characters"),
});

export const LoginRegister = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "At least 6 characters"),
});
