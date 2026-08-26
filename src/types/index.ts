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

export interface Account {
  id: string;
  name: string;
  isDefault?: boolean;
  colorClass: string;
}
