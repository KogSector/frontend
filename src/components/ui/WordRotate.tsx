"use client";

import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";

interface WordRotateProps extends HTMLAttributes<HTMLDivElement> {
	words: string[];
	duration?: number;
	framerProps?: any;
}

export const WordRotate: FC<WordRotateProps> = ({
	words,
	duration,
	framerProps,
	className,
	...props
}) => {
	return (
		<div className={cn("relative h-10 w-full overflow-hidden", className)} {...props}>
			<div className="absolute inset-0">{words[0]}</div>
		</div>
	);
};
