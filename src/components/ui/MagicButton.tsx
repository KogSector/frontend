"use client";

import { cn } from "@/lib/utils";
import { FC, ButtonHTMLAttributes } from "react";

interface MagicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

export const MagicButton: FC<MagicButtonProps> = ({ children, className, ...props }) => {
	return (
		<button className={cn("px-4 py-2 bg-primary text-primary-foreground rounded-md", className)} {...props}>
			{children}
		</button>
	);
};
