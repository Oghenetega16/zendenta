import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function SettingsPage() {
  return (
    <div className="pt-6">
      <ComingSoon
        icon={Settings}
        title="Account settings"
        description="Manage notification preferences, security, and workspace settings here. This page is a placeholder ready for you to build out."
      />
    </div>
  );
}
