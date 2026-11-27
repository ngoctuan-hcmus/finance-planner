"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { checkAndNotifyMilestones } from "@/app/wishlist/actions";

// Tự động kiểm tra mốc 50% / 75% / 100% và bật Toast chúc mừng (không lặp lại)
export function MilestoneNotifier({ trigger }: { trigger: string }) {
  useEffect(() => {
    let active = true;
    checkAndNotifyMilestones().then((messages) => {
      if (!active) return;
      for (const msg of messages) {
        toast.success(msg, { duration: 6000 });
      }
    });
    return () => {
      active = false;
    };
  }, [trigger]);

  return null;
}