import { Wallet } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function AccountsPage() {
  return (
    <div className="pt-6">
      <ComingSoon
        icon={Wallet}
        title="Accounts"
        description="View and manage clinic financial accounts here. This page is a placeholder ready for you to build out."
      />
    </div>
  );
}
