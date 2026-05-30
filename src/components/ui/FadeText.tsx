"use client";

import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";

interface FadeTextProps extends HTMLAttributes<HTMLDivElement> {
	text: string;
	direction?: "up" | "down" | "left" | "right";
	framerProps?: any;
}

export const FadeText: FC<FadeTextProps> = ({ text, direction, framerProps, className, ...props }) => {
	return (
		<div className={cn("", className)} {...props}>
			{text}
		</div>
	);
};
