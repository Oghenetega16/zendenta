import { Cpu } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function PeripheralsPage() {
  return (
    <div className="pt-6">
      <ComingSoon
        icon={Cpu}
        title="Peripherals"
        description="Manage clinic equipment and devices here. This page is a placeholder ready for you to build out."
      />
    </div>
  );
}
