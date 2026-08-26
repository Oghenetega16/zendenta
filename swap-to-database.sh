#!/usr/bin/env bash
# swap-to-database.sh
#
# Replaces Zendenta's in-memory data layer (src/lib/server/store.ts) with a
# real SQLite database via Prisma. Same DB engine requires zero setup (no
# server to run) but the schema is trivial to point at Postgres/MySQL later
# by changing the `provider` and `DATABASE_URL` in prisma/schema.prisma.
#
# Usage: run this from your project root (the folder with package.json),
# e.g. via Git Bash or WSL on Windows:
#   bash swap-to-database.sh
#
# Safe to run more than once - it backs up your existing store.ts once,
# and every other step (schema write, seed, package.json patch) is
# idempotent.

set -e

trap 'echo; echo "Something failed above - the project is left as-is up to that point. Re-run this script after fixing the issue; it is safe to re-run."; exit 1' ERR

# --- Sanity check: are we in the right place? ------------------------------
if [ ! -f package.json ] || [ ! -d src/lib/server ]; then
  echo "Error: run this from the Zendenta project root (the folder containing package.json and src/lib/server)."
  exit 1
fi

echo "==> Installing Prisma"
npm install @prisma/client
npm install -D prisma tsx

echo "==> Writing prisma/schema.prisma"
mkdir -p prisma
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Reservation {
  id                 String   @id
  isNew              Boolean  @default(false)
  patientName        String
  patientInitials    String
  avatarColor        String
  numberOfBillsPaid  Int
  numberOfBillsTotal Int
  reservationDate    String
  totalAmount        Float
  paymentStatus      String
  bills              Bill[]
}

model Bill {
  id            String      @id @default(cuid())
  billId        String
  billNo        String      @unique
  label         String
  amount        Float
  status        String
  billDate      String
  billToName    String
  billToAddress String
  subtotal      Float
  tax           Float
  total         Float
  reservationId String
  reservation   Reservation @relation(fields: [reservationId], references: [id])
  lineItems     LineItem[]
}

model LineItem {
  id     String @id @default(cuid())
  label  String
  qty    Int?
  total  Float
  billId String
  bill   Bill   @relation(fields: [billId], references: [id], onDelete: Cascade)
}
EOF

echo "==> Configuring DATABASE_URL"
if [ ! -f .env ]; then
  touch .env
fi
if ! grep -q "^DATABASE_URL=" .env 2>/dev/null; then
  echo 'DATABASE_URL="file:./dev.db"' >> .env
  echo "   added DATABASE_URL to .env"
else
  echo "   DATABASE_URL already set in .env, leaving it alone"
fi

if [ -f .gitignore ] && ! grep -q "prisma/dev.db" .gitignore 2>/dev/null; then
  {
    echo ""
    echo "# Prisma SQLite database"
    echo "prisma/dev.db"
    echo "prisma/dev.db-journal"
  } >> .gitignore
fi

echo "==> Writing Prisma client singleton (src/lib/server/prisma.ts)"
mkdir -p src/lib/server
cat > src/lib/server/prisma.ts << 'EOF'
import { PrismaClient } from "@prisma/client";

// Cached on globalThis so dev-mode hot reloads reuse one connection
// instead of opening a new one on every file edit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
EOF

echo "==> Writing prisma/seed.ts (seeds from your existing mock data)"
cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from "@prisma/client";
import { reservations } from "../src/lib/data";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${reservations.length} reservations...`);

  for (const r of reservations) {
    await prisma.reservation.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        isNew: r.isNew ?? false,
        patientName: r.patientName,
        patientInitials: r.patientInitials,
        avatarColor: r.avatarColor,
        numberOfBillsPaid: r.numberOfBillsPaid,
        numberOfBillsTotal: r.numberOfBillsTotal,
        reservationDate: r.reservationDate,
        totalAmount: r.totalAmount,
        paymentStatus: r.paymentStatus,
        bills: {
          create: r.bills.map((b) => ({
            billId: b.id,
            billNo: b.billNo,
            label: b.label,
            amount: b.amount,
            status: b.status,
            billDate: b.billDate,
            billToName: b.billTo.name,
            billToAddress: b.billTo.address,
            subtotal: b.subtotal,
            tax: b.tax,
            total: b.total,
            lineItems: {
              create: b.lineItems.map((li) => ({
                label: li.label,
                qty: li.qty ?? null,
                total: li.total,
              })),
            },
          })),
        },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

echo "==> Registering the seed script in package.json"
cat > /tmp/_patch-package-json.mjs << 'EOF'
import { readFileSync, writeFileSync } from "fs";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.prisma = pkg.prisma || {};
pkg.prisma.seed = "tsx prisma/seed.ts";
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("   package.json updated");
EOF
node /tmp/_patch-package-json.mjs
rm -f /tmp/_patch-package-json.mjs

echo "==> Backing up the in-memory store (first run only)"
if [ -f src/lib/server/store.ts ] && ! grep -q "PrismaClient" src/lib/server/store.ts 2>/dev/null; then
  cp src/lib/server/store.ts src/lib/server/store.memory.ts.bak
  echo "   saved old store.ts -> src/lib/server/store.memory.ts.bak"
fi

echo "==> Writing the Prisma-backed store.ts"
cat > src/lib/server/store.ts << 'EOF'
import { prisma } from "@/lib/server/prisma";
import { Bill, LineItem, PaymentStatus, Reservation } from "@/types";

/**
 * Prisma-backed data layer (SQLite by default - see prisma/schema.prisma).
 * Function signatures match the in-memory version this replaced, so the
 * API route handlers under src/app/api didn't need to change at all.
 */

type DbLineItem = { id: string; label: string; qty: number | null; total: number };
type DbBill = {
  id: string;
  billId: string;
  billNo: string;
  label: string;
  amount: number;
  status: string;
  billDate: string;
  billToName: string;
  billToAddress: string;
  subtotal: number;
  tax: number;
  total: number;
  lineItems: DbLineItem[];
};
type DbReservation = {
  id: string;
  isNew: boolean;
  patientName: string;
  patientInitials: string;
  avatarColor: string;
  numberOfBillsPaid: number;
  numberOfBillsTotal: number;
  reservationDate: string;
  totalAmount: number;
  paymentStatus: string;
  bills: DbBill[];
};

function toLineItem(li: DbLineItem): LineItem {
  return { id: li.id, label: li.label, qty: li.qty ?? undefined, total: li.total };
}

function toBill(b: DbBill): Bill {
  return {
    id: b.billId,
    billNo: b.billNo,
    label: b.label,
    amount: b.amount,
    status: b.status as Bill["status"],
    billDate: b.billDate,
    billTo: { name: b.billToName, address: b.billToAddress },
    lineItems: b.lineItems.map(toLineItem),
    subtotal: b.subtotal,
    tax: b.tax,
    total: b.total,
  };
}

function toReservation(r: DbReservation): Reservation {
  return {
    id: r.id,
    isNew: r.isNew || undefined,
    patientName: r.patientName,
    patientInitials: r.patientInitials,
    avatarColor: r.avatarColor,
    numberOfBillsPaid: r.numberOfBillsPaid,
    numberOfBillsTotal: r.numberOfBillsTotal,
    reservationDate: r.reservationDate,
    totalAmount: r.totalAmount,
    paymentStatus: r.paymentStatus as PaymentStatus,
    bills: r.bills.map(toBill),
  };
}

const include = { bills: { include: { lineItems: true } } } as const;

export async function listReservations(): Promise<Reservation[]> {
  const rows = await prisma.reservation.findMany({ include, orderBy: { id: "asc" } });
  return rows.map(toReservation);
}

export async function getReservation(id: string): Promise<Reservation | undefined> {
  const row = await prisma.reservation.findUnique({ where: { id }, include });
  return row ? toReservation(row) : undefined;
}

export async function payBill(
  reservationId: string,
  billNo: string
): Promise<Reservation | null> {
  const bill = await prisma.bill.findUnique({ where: { billNo } });
  if (!bill || bill.reservationId !== reservationId) return null;

  await prisma.bill.update({ where: { billNo }, data: { status: "paid" } });

  const bills = await prisma.bill.findMany({ where: { reservationId } });
  const paidCount = bills.filter((b) => b.status === "paid").length;
  const paymentStatus = paidCount === bills.length ? "fully_paid" : "partially_paid";

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { numberOfBillsPaid: paidCount, paymentStatus },
  });

  return (await getReservation(reservationId)) ?? null;
}

export async function getStats(): Promise<{ revenue: number; profit: number }> {
  // Placeholder aggregate - replace with a real query over paid bills for
  // the current month once you're tracking real transaction timestamps.
  return { revenue: 154, profit: 154 };
}

export async function listPatients() {
  const rows = await prisma.reservation.findMany({ include });

  const byName = new Map<
    string,
    {
      name: string;
      initials: string;
      avatarColor: string;
      visits: number;
      totalBilled: number;
      status: string;
    }
  >();

  for (const r of rows) {
    const paidTotal = r.bills
      .filter((b) => b.status === "paid")
      .reduce((sum, b) => sum + b.total, 0);
    const existing = byName.get(r.patientName);
    if (existing) {
      existing.visits += 1;
      existing.totalBilled += paidTotal;
    } else {
      byName.set(r.patientName, {
        name: r.patientName,
        initials: r.patientInitials,
        avatarColor: r.avatarColor,
        visits: 1,
        totalBilled: paidTotal,
        status: r.paymentStatus,
      });
    }
  }

  return Array.from(byName.values());
}
EOF

echo "==> Generating the Prisma client"
npx prisma generate

echo "==> Creating the SQLite database and applying the schema"
npx prisma db push

echo "==> Seeding the database with your existing mock data"
npx prisma db seed

echo
echo "Done. Your API routes now read from prisma/dev.db instead of memory."
echo "The old in-memory logic is preserved at src/lib/server/store.memory.ts.bak"
echo
echo "Next steps:"
echo "  npm run dev                 # start the app - data now persists across restarts"
echo "  npx prisma studio           # browse/edit the database in a GUI"
echo
echo "To switch to Postgres/MySQL later: change 'provider' and DATABASE_URL"
echo "in prisma/schema.prisma, then re-run 'npx prisma db push'."
