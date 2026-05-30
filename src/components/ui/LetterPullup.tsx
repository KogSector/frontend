"use client";

import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";

interface LetterPullupProps extends HTMLAttributes<HTMLHeadingElement> {
	words: string;
	delay?: number;
}

export const LetterPullup: FC<LetterPullupProps> = ({ words, delay, className, ...props }) => {
	return (
		<h1 className={cn("text-center font-display text-4xl font-bold", className)} {...props}>
			{words}
		</h1>
	);
};
