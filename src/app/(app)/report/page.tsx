import { LineChart } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function ReportPage() {
  return (
    <div className="pt-6">
      <ComingSoon
        icon={LineChart}
        title="Report"
        description="Generate and export clinic performance reports here. This page is a placeholder ready for you to build out."
      />
    </div>
  );
}
