import { redirect } from "next/navigation";

export default function PusatRedirectPage() {
  redirect(
    "https://docs.google.com/forms/d/1UTIIlUvfbKUw9iNeogKFu4OuQCykoXh_nir7uK_GVo4/viewform?edit_requested=true"
  );
}
