/**
 * Seed script — clearly fake data for local testing (v0.1).
 *
 * Creates a handful of users, customers, devices and movements that exercise
 * the full status range and the movement/history flow:
 *   - in stock, deployed, awaiting collection, in repair, retired
 *   - an overdue deployment (past its proposed collection date)
 *   - a device with movement history (office -> customer)
 *
 * Run with `npm run db:seed`, or automatically via `npm run db:reset`.
 * Safe to re-run: it clears existing rows first.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  DeviceType,
  DeviceStatus,
  LocationType,
  UserRole,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — cannot seed.");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY);

async function main() {
  // Clear in dependency order (movements/images reference devices and users).
  await prisma.movement.deleteMany();
  await prisma.deviceImage.deleteMany();
  await prisma.device.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // --- Users (fake) ---------------------------------------------------------
  const alex = await prisma.user.create({
    data: { name: "Alex Admin", email: "alex.admin@cybernet.example", role: UserRole.Admin },
  });
  const priya = await prisma.user.create({
    data: { name: "Priya Patel", email: "priya.patel@cybernet.example", role: UserRole.Engineer },
  });
  const sam = await prisma.user.create({
    data: { name: "Sam Okafor", email: "sam.okafor@cybernet.example", role: UserRole.Engineer },
  });

  // --- Customers (fake) -----------------------------------------------------
  const northwind = await prisma.customer.create({
    data: { name: "Northwind Trading", shortCode: "NWT" },
  });
  const acme = await prisma.customer.create({
    data: { name: "Acme Healthcare", shortCode: "ACME" },
  });
  const belmont = await prisma.customer.create({
    data: { name: "Belmont Solicitors", shortCode: "BELM" },
  });
  await prisma.customer.create({
    data: { name: "Old Client Ltd", shortCode: "OLD", isActive: false },
  });

  // 1) Laptop deployed to Northwind, WITH history (was in goods-in first).
  const latitude = await prisma.device.create({
    data: {
      assetTag: "CYB-0001",
      serialNumber: "DL7440-FAKE-001",
      make: "Dell",
      model: "Latitude 7440",
      type: DeviceType.Laptop,
      status: DeviceStatus.Deployed,
      notes: "Business laptop, i7 / 16GB / 512GB.",
    },
  });
  // Closed historical movement: received into the office, later sent out.
  await prisma.movement.create({
    data: {
      deviceId: latitude.id,
      locationType: LocationType.Office,
      officeSubLocation: "Goods-in",
      reason: "Received new stock from supplier.",
      installDate: daysAgo(45),
      actualCollectionDate: daysAgo(30),
      isCurrent: false,
      createdByUserId: sam.id,
    },
  });
  // Current movement: deployed to the customer.
  await prisma.movement.create({
    data: {
      deviceId: latitude.id,
      locationType: LocationType.Customer,
      customerId: northwind.id,
      reason: "Replacement laptop for a new starter.",
      ticketNumber: "T-1001",
      installDate: daysAgo(30),
      proposedCollectionDate: null,
      isCurrent: true,
      createdByUserId: priya.id,
    },
  });

  // 2) Desktop in stock at the office.
  const elitedesk = await prisma.device.create({
    data: {
      assetTag: "CYB-0002",
      serialNumber: "HP800-FAKE-002",
      make: "HP",
      model: "EliteDesk 800 G9",
      type: DeviceType.Desktop,
      status: DeviceStatus.InStock,
    },
  });
  await prisma.movement.create({
    data: {
      deviceId: elitedesk.id,
      locationType: LocationType.Office,
      officeSubLocation: "Shelf B",
      reason: "New stock, awaiting allocation.",
      installDate: daysAgo(10),
      isCurrent: true,
      createdByUserId: sam.id,
    },
  });

  // 3) Server deployed to Acme — OVERDUE (past its proposed collection date).
  const server = await prisma.device.create({
    data: {
      assetTag: "CYB-0003",
      serialNumber: "LN-TS-FAKE-003",
      make: "Lenovo",
      model: "ThinkSystem ST50",
      type: DeviceType.Server,
      status: DeviceStatus.Deployed,
      notes: "Temporary file server during their migration.",
    },
  });
  await prisma.movement.create({
    data: {
      deviceId: server.id,
      locationType: LocationType.Customer,
      customerId: acme.id,
      reason: "Loan server covering their migration window.",
      ticketNumber: "T-1002",
      installDate: daysAgo(60),
      proposedCollectionDate: daysAgo(5),
      isCurrent: true,
      createdByUserId: priya.id,
    },
  });

  // 4) Switch awaiting collection at Belmont (flagged to come back soon).
  const switch2960 = await prisma.device.create({
    data: {
      assetTag: "CYB-0004",
      serialNumber: "CSCO-FAKE-004",
      make: "Cisco",
      model: "Catalyst 2960-X",
      type: DeviceType.Switch,
      status: DeviceStatus.AwaitingCollection,
    },
  });
  await prisma.movement.create({
    data: {
      deviceId: switch2960.id,
      locationType: LocationType.Customer,
      customerId: belmont.id,
      reason: "Temporary loan during their comms-room upgrade.",
      ticketNumber: "T-1003",
      installDate: daysAgo(20),
      proposedCollectionDate: daysFromNow(3),
      isCurrent: true,
      createdByUserId: sam.id,
    },
  });

  // 5) Access point in repair at the office.
  const unifiAp = await prisma.device.create({
    data: {
      assetTag: "CYB-0005",
      serialNumber: "UBNT-FAKE-005",
      make: "Ubiquiti",
      model: "UniFi U6-Pro",
      type: DeviceType.AccessPoint,
      status: DeviceStatus.InRepair,
    },
  });
  await prisma.movement.create({
    data: {
      deviceId: unifiAp.id,
      locationType: LocationType.Office,
      officeSubLocation: "Repair bench",
      reason: "Faulty PoE port — RMA pending with supplier.",
      installDate: daysAgo(7),
      isCurrent: true,
      createdByUserId: sam.id,
    },
  });

  // 6) MacBook deployed to Northwind (within its collection window).
  const macbook = await prisma.device.create({
    data: {
      assetTag: "CYB-0006",
      serialNumber: "APPL-FAKE-006",
      make: "Apple",
      model: "MacBook Pro 14 (M3)",
      type: DeviceType.Laptop,
      status: DeviceStatus.Deployed,
    },
  });
  await prisma.movement.create({
    data: {
      deviceId: macbook.id,
      locationType: LocationType.Customer,
      customerId: northwind.id,
      reason: "Design workstation for a fixed-term project.",
      ticketNumber: "T-1004",
      installDate: daysAgo(14),
      proposedCollectionDate: daysFromNow(45),
      isCurrent: true,
      createdByUserId: priya.id,
    },
  });

  // 7) Monitor in stock.
  const monitor = await prisma.device.create({
    data: {
      assetTag: "CYB-0007",
      make: "Dell",
      model: "UltraSharp U2723QE",
      type: DeviceType.Monitor,
      status: DeviceStatus.InStock,
    },
  });
  await prisma.movement.create({
    data: {
      deviceId: monitor.id,
      locationType: LocationType.Office,
      officeSubLocation: "Shelf A",
      reason: "Spare 4K monitor.",
      installDate: daysAgo(3),
      isCurrent: true,
      createdByUserId: sam.id,
    },
  });

  // 8) Retired laptop awaiting disposal.
  const retired = await prisma.device.create({
    data: {
      assetTag: "CYB-0008",
      serialNumber: "DL-OLD-FAKE-008",
      make: "Dell",
      model: "Latitude 5400",
      type: DeviceType.Laptop,
      status: DeviceStatus.Retired,
      notes: "End of life — battery swollen.",
    },
  });
  await prisma.movement.create({
    data: {
      deviceId: retired.id,
      locationType: LocationType.Office,
      officeSubLocation: "Disposal cage",
      reason: "End of life, awaiting WEEE collection.",
      installDate: daysAgo(2),
      isCurrent: true,
      createdByUserId: alex.id,
    },
  });

  const [users, customers, devices, movements] = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.device.count(),
    prisma.movement.count(),
  ]);
  console.log(
    `Seeded: ${users} users, ${customers} customers, ${devices} devices, ${movements} movements.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
