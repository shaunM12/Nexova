import type { Metadata } from "next";
import { ApplicationPageContent } from "@/components/public/ApplicationPageContent";

export const metadata: Metadata = {
  title: "Talent registration",
  description:
    "Join the Nexova talent pool. Register your profile for executive search and career opportunities.",
};

export default function ApplicationPage() {
  return <ApplicationPageContent />;
}
