import {
  Archive,
  CalendarCheck2,
  ClipboardList,
  Cpu,
  CreditCard,
  Headphones,
  LayoutGrid,
  LineChart,
  ShoppingBag,
  Stethoscope,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    items: [{ label: "Dashboard", icon: LayoutGrid, href: "/" }],
  },
  {
    label: "Clinic",
    items: [
      { label: "Reservations", icon: CalendarCheck2, href: "/reservations" },
      { label: "Patients", icon: Users, href: "/patients" },
      { label: "Treatments", icon: Stethoscope, href: "/treatments" },
      { label: "Staff List", icon: ClipboardList, href: "/staff" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Accounts", icon: Wallet, href: "/accounts" },
      { label: "Sales", icon: ShoppingBag, href: "/sales" },
      { label: "Purchases", icon: CreditCard, href: "/purchases" },
      { label: "Payment Method", icon: Wrench, href: "/payment-method" },
    ],
  },
  {
    label: "Physical Asset",
    items: [
      { label: "Stocks", icon: Archive, href: "/stocks" },
      { label: "Peripherals", icon: Cpu, href: "/peripherals" },
    ],
  },
];

export const bottomNavItems: NavItem[] = [
  { label: "Report", icon: LineChart, href: "/report" },
  { label: "Customer Support", icon: Headphones, href: "/support" },
];

const allItems = [...navGroups.flatMap((g) => g.items), ...bottomNavItems];

export function getPageTitle(pathname: string): string {
  const match = allItems.find((item) => item.href === pathname);
  return match?.label ?? "Zendenta";
}
