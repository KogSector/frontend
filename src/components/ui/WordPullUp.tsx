"use client";

import { cn } from "@/lib/utils";
import { FC, HTMLAttributes } from "react";

interface WordPullUpProps extends HTMLAttributes<HTMLHeadingElement> {
	words: string;
	delay?: number;
	wrapperFramerProps?: any;
	variants?: any;
}

export const WordPullUp: FC<WordPullUpProps> = ({
	words,
	wrapperFramerProps,
	variants,
	className,
	...props
}) => {
	return (
		<h1
			className={cn(
				"text-center font-display text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm dark:text-white md:text-4xl md:leading-[5rem]",
				className,
			)}
			{...props}
		>
			{words}
		</h1>
	);
};
