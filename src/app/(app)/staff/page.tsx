import { ClipboardList } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function StaffPage() {
  return (
    <div className="pt-6">
      <ComingSoon
        icon={ClipboardList}
        title="Staff List"
        description="Manage clinic staff, roles, and schedules here. This page is a placeholder ready for you to build out."
      />
    </div>
  );
}
