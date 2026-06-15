import { DeviceType, DeviceStatus } from "@/generated/prisma/enums";

// British English display labels for the enums. The keys mirror the Prisma enum.

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  Laptop: "Laptop",
  Desktop: "Desktop",
  Server: "Server",
  Monitor: "Monitor",
  Switch: "Switch",
  Router: "Router",
  Firewall: "Firewall",
  AccessPoint: "Access point",
  Printer: "Printer",
  VoIPPhone: "VoIP phone",
  MobileDevice: "Mobile device",
  Dock: "Dock",
  Peripheral: "Peripheral",
  Other: "Other",
};

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  InStock: "In stock",
  Deployed: "Deployed",
  AwaitingCollection: "Awaiting collection",
  InRepair: "In repair",
  Retired: "Retired",
};

export const DEVICE_TYPE_VALUES = Object.keys(DEVICE_TYPE_LABELS) as DeviceType[];
export const DEVICE_STATUS_VALUES = Object.keys(
  DEVICE_STATUS_LABELS,
) as DeviceStatus[];

export function deviceTypeLabel(type: DeviceType): string {
  return DEVICE_TYPE_LABELS[type] ?? type;
}

export function deviceStatusLabel(status: DeviceStatus): string {
  return DEVICE_STATUS_LABELS[status] ?? status;
}
