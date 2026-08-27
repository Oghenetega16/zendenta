export type PaymentStatus = "unpaid" | "partially_paid" | "fully_paid";

export interface LineItem {
  id: string;
  label: string;
  qty?: number;
  total: number;
}

export interface Bill {
  id: string; // e.g. "#1244"
  billNo: string; // e.g. "#BILL00124"
  label: string; // e.g. "Booking Fee" / "2 Treatment(s)"
  amount: number;
  status: "unpaid" | "paid";
  billDate: string;
  billTo: {
    name: string;
    address: string;
  };
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  accountId?: string; // which account a paid bill's funds were routed to
}

export interface Reservation {
  id: string; // e.g. "#RSV001"
  isNew?: boolean;
  patientName: string;
  patientInitials: string;
  avatarColor: string;
  numberOfBillsPaid: number;
  numberOfBillsTotal: number;
  reservationDate: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  bills: Bill[];
}

export type PaymentMethodType = "cash" | "credit_card" | "bank_transfer" | "e_wallet";

export interface PaymentMethodConfig {
  id: PaymentMethodType;
  label: string;
  enabled: boolean;
  processingFee: number; // percent, e.g. 0 for cash, 2.5 for credit card
}

export interface Account {
  id: string;
  name: string;
  isDefault?: boolean;
  colorClass: string;
}

export interface Stock {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderThreshold: number;
}

export interface Purchase {
  id: string;
  item: string;
  supplier: string;
  quantity: number;
  unitCost: number;
  total: number;
  orderDate: string;
  status: "pending" | "received";
  stockId: string; // links to the Stock item this purchase replenishes
}

export type PeripheralStatus = "active" | "maintenance" | "retired";

export interface Peripheral {
  id: string;
  name: string;
  type: string;
  assignedTo: string;
  status: PeripheralStatus;
  lastServiced: string;
}
