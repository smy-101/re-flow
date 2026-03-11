"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={sizeStyles[size]}>
        {title ? (
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle>{title}</DialogTitle>
              <DialogClose className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <X className="size-4" />
                <span className="sr-only">关闭</span>
              </DialogClose>
            </div>
          </DialogHeader>
        ) : null}
        <div className="min-h-0 overflow-y-auto pr-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
