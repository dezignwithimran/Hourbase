"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Archive02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
  ChartHistogramIcon,
  Clock01Icon,
  ComputerIcon,
  Copy01Icon,
  Delete02Icon,
  DollarSignIcon,
  Download01Icon,
  File01Icon,
  FolderKanbanIcon,
  GaugeIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  Logout03Icon,
  MailCheckIcon,
  Menu01Icon,
  Moon02Icon,
  MoreHorizontalIcon,
  PartyPopperIcon,
  PauseIcon,
  PencilEdit02Icon,
  PlayIcon,
  PlusSignIcon,
  Search01Icon,
  Settings01Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
  SparklesIcon,
  StopIcon,
  Sun03Icon,
  Target01Icon,
  Tick02Icon,
  UserMultipleIcon,
  ViewIcon,
  ViewOffIcon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function sizeFromClass(className?: string): number {
  if (!className) return 18;
  if (/\bh-5\b/.test(className)) return 20;
  if (/\bh-4\.5\b/.test(className)) return 18;
  if (/\bh-4\b/.test(className)) return 16;
  if (/\bh-3\.5\b/.test(className)) return 14;
  if (/\bh-3\b/.test(className)) return 12;
  return 18;
}

function icon(glyph: IconSvgElement) {
  return function Icon({ className }: IconProps) {
    return (
      <HugeiconsIcon
        icon={glyph}
        size={sizeFromClass(className)}
        strokeWidth={1.75}
        color="currentColor"
        className={className}
      />
    );
  };
}

export const Archive = icon(Archive02Icon);
export const ArrowLeft = icon(ArrowLeft01Icon);
export const ArrowRight = icon(ArrowRight01Icon);
export const BarChart3 = icon(ChartHistogramIcon);
export const CalendarRange = icon(Calendar03Icon);
export const Check = icon(Tick02Icon);
export const ChevronLeft = icon(ArrowLeft01Icon);
export const ChevronRight = icon(ArrowRight01Icon);
export const Clock = icon(Clock01Icon);
export const Copy = icon(Copy01Icon);
export const DollarSign = icon(DollarSignIcon);
export const Download = icon(Download01Icon);
export const Eye = icon(ViewIcon);
export const EyeOff = icon(ViewOffIcon);
export const FileText = icon(File01Icon);
export const FolderKanban = icon(FolderKanbanIcon);
export const Gauge = icon(GaugeIcon);
export const HelpCircle = icon(HelpCircleIcon);
export const LayoutDashboard = icon(LayoutDashboardIcon);
export const LogOut = icon(Logout03Icon);
export const MailCheck = icon(MailCheckIcon);
export const Menu = icon(Menu01Icon);
export const Monitor = icon(ComputerIcon);
export const Moon = icon(Moon02Icon);
export const MoreHorizontal = icon(MoreHorizontalIcon);
export const PanelLeftClose = icon(SidebarLeft01Icon);
export const PanelLeftOpen = icon(SidebarRight01Icon);
export const PartyPopper = icon(PartyPopperIcon);
export const Pause = icon(PauseIcon);
export const Pencil = icon(PencilEdit02Icon);
export const Play = icon(PlayIcon);
export const Plus = icon(PlusSignIcon);
export const Search = icon(Search01Icon);
export const Settings = icon(Settings01Icon);
export const Sparkles = icon(SparklesIcon);
export const Square = icon(StopIcon);
export const Sun = icon(Sun03Icon);
export const Target = icon(Target01Icon);
export const Trash2 = icon(Delete02Icon);
export const Users = icon(UserMultipleIcon);
export const X = icon(Cancel01Icon);
export const Zap = icon(ZapIcon);
