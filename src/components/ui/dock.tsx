"use client";

import { cn } from "@/lib/utils";
import React, { FC, HTMLAttributes } from "react";

export interface DockProps extends HTMLAttributes<HTMLDivElement> {
	magnification?: number;
	distance?: number;
	direction?: "top" | "middle" | "bottom";
}

export const Dock = React.forwardRef<HTMLDivElement, DockProps>(
	({ className, children, magnification, distance, direction, ...props }, ref) => {
		return (
			<div ref={ref} className={cn("flex items-center gap-2 p-2 rounded-xl bg-background/10 backdrop-blur-sm border", className)} {...props}>
				{children}
			</div>
		);
	}
);
Dock.displayName = "Dock";

export interface DockIconProps extends HTMLAttributes<HTMLDivElement> {
	size?: number;
	magnification?: number;
	distance?: number;
}

export const DockIcon = React.forwardRef<HTMLDivElement, DockIconProps>(
	({ className, children, size, magnification, distance, ...props }, ref) => {
		return (
			<div ref={ref} className={cn("flex items-center justify-center p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10", className)} {...props}>
				{children}
			</div>
		);
	}
);
DockIcon.displayName = "DockIcon";
