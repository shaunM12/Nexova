import { redirect } from "next/navigation";
import { DEFAULT_AFTER_LOGIN } from "@/lib/backoffice/auth/constants";

export default function BackofficeIndex() {
  redirect(DEFAULT_AFTER_LOGIN);
}
