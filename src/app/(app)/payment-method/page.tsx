import { Wrench } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function PaymentMethodPage() {
  return (
    <div className="pt-6">
      <ComingSoon
        icon={Wrench}
        title="Payment Method"
        description="Configure accepted payment methods and processor settings here. This page is a placeholder ready for you to build out."
      />
    </div>
  );
}
