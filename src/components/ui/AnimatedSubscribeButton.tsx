"use client";

import { FC, ReactNode, ButtonHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedSubscribeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	buttonTextColor?: string;
	initialText: ReactNode;
	changeText: ReactNode;
}

export const AnimatedSubscribeButton: FC<AnimatedSubscribeButtonProps> = ({
	buttonTextColor,
	initialText,
	changeText,
	className,
	...props
}) => {
	const [isSubscribed, setIsSubscribed] = useState(false);
	return (
		<button
			onClick={(e) => { setIsSubscribed(!isSubscribed); if (props.onClick) props.onClick(e); }}
			className={cn("relative flex w-[200px] items-center justify-center rounded-md border-2 border-black bg-white p-4 font-semibold", className)}
			style={{ color: buttonTextColor }}
			{...props}
		>
			{isSubscribed ? changeText : initialText}
		</button>
	);
};
