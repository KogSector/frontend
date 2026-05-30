"use client";

import { FC, HTMLAttributes, RefObject } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
	className?: string;
	containerRef: RefObject<HTMLElement>;
	fromRef: RefObject<HTMLElement>;
	toRef: RefObject<HTMLElement>;
	curvature?: number;
	reverse?: boolean;
	pathColor?: string;
	pathWidth?: number;
	pathOpacity?: number;
	gradientStartColor?: string;
	gradientStopColor?: string;
	delay?: number;
	duration?: number;
	startXOffset?: number;
	startYOffset?: number;
	endXOffset?: number;
	endYOffset?: number;
}

export const AnimatedBeam: FC<AnimatedBeamProps> = ({
	className,
	containerRef,
	fromRef,
	toRef,
	...props
}) => {
	return (
		<svg className={cn("pointer-events-none absolute left-0 top-0 w-full h-full", className)}>
			{/* Static path since animations are disabled */}
		</svg>
	);
};
