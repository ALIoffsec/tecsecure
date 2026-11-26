import { redirect } from "next/navigation";

/** Projects and quotes now live with the requests. */
export default function LegacyPage() {
  redirect("/portal/requests");
}
