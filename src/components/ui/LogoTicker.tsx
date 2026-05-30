"use client";

import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";

export const LogoTicker: FC<HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
	return (
		<div className={cn("flex gap-4 overflow-hidden", className)} {...props}>
			{children}
		</div>
	);
};
