import { Stethoscope } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function TreatmentsPage() {
  return (
    <div className="pt-6">
      <ComingSoon
        icon={Stethoscope}
        title="Treatments"
        description="Manage treatment catalogs, pricing, and protocols here. This page is a placeholder ready for you to build out."
      />
    </div>
  );
}
