'use client'

import { useMotionValue, useTransform, animate, motion } from 'framer-motion'
import { useEffect } from 'react'
import Image from 'next/image'

interface LogoItem {
  src: string
  alt: string
}

const LOGOS: LogoItem[] = [
  { src: '/logos/github.png', alt: 'GitHub' },
  { src: '/logos/notion.png', alt: 'Notion' },
  { src: '/logos/confluence.png', alt: 'Confluence' },
  { src: '/logos/google-drive.png', alt: 'Google Drive' },
  { src: '/logos/bitbucket.png', alt: 'Bitbucket' },
  { src: '/logos/dropbox.png', alt: 'Dropbox' },
]

const ORBIT_RADIUS = 160
const LOGO_SIZE = 40
const CENTER_SIZE = 72

/** Shared motion value for the ring rotation — all elements sync to this. */
export function useRingRotation() {
  const rotation = useMotionValue(0)

  useEffect(() => {
    const controls = animate(rotation, 360, {
      ease: 'linear',
      duration: 35,
      repeat: Infinity,
    })
    return controls.stop
  }, [rotation])

  return rotation
}

interface LogoOrbitProps {
  className?: string
}

export function LogoOrbit({ className }: LogoOrbitProps) {
  const ringRotation = useRingRotation()
  // Counter-rotation computed once at top level (not inside map!)
  const counterRotation = useTransform(ringRotation, (v) => -v)

  return (
    <div className={`relative flex items-center justify-center ${className ?? ''}`}>
      {/* Rotating ring container — everything inside rotates together */}
      <motion.div
        className="relative"
        style={{ rotate: ringRotation }}
      >
        {/* Connecting lines SVG */}
        <svg
          width={ORBIT_RADIUS * 2 + 60}
          height={ORBIT_RADIUS * 2 + 60}
          viewBox={`0 0 ${ORBIT_RADIUS * 2 + 60} ${ORBIT_RADIUS * 2 + 60}`}
          className="absolute"
        >
          <circle
            cx={ORBIT_RADIUS + 30}
            cy={ORBIT_RADIUS + 30}
            r={ORBIT_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          {LOGOS.map((_, i) => {
            const angle = (360 / LOGOS.length) * i - 90
            const rad = (angle * Math.PI) / 180
            const cx = ORBIT_RADIUS + 30 + Math.cos(rad) * ORBIT_RADIUS
            const cy = ORBIT_RADIUS + 30 + Math.sin(rad) * ORBIT_RADIUS
            return (
              <line
                key={i}
                x1={ORBIT_RADIUS + 30}
                y1={ORBIT_RADIUS + 30}
                x2={cx}
                y2={cy}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            )
          })}
          {/* Small dots at each orbit position */}
          {LOGOS.map((_, i) => {
            const angle = (360 / LOGOS.length) * i - 90
            const rad = (angle * Math.PI) / 180
            const cx = ORBIT_RADIUS + 30 + Math.cos(rad) * ORBIT_RADIUS
            const cy = ORBIT_RADIUS + 30 + Math.sin(rad) * ORBIT_RADIUS
            return (
              <circle
                key={`dot-${i}`}
                cx={cx}
                cy={cy}
                r={2}
                fill="rgba(255,255,255,0.15)"
              />
            )
          })}
        </svg>

        {/* Orbiting logos — positioned via rotate + translateX so they rotate with the ring */}
        {LOGOS.map((logo, i) => {
          const angle = (360 / LOGOS.length) * i
          return (
            <div
              key={logo.alt}
              className="absolute"
              style={{
                left: `calc(50% - ${LOGO_SIZE / 2}px)`,
                top: `calc(50% - ${LOGO_SIZE / 2}px)`,
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                transformOrigin: `${LOGO_SIZE / 2}px ${LOGO_SIZE / 2}px`,
                // Position: rotate to angle, then translate out by radius
                transform: `rotate(${angle}deg) translateX(${ORBIT_RADIUS}px)`,
              }}
            >
              <motion.div
                className="flex items-center justify-center w-full h-full rounded-full bg-white/10 backdrop-blur-sm"
                style={{ rotate: counterRotation }}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={24}
                  height={24}
                  className="rounded-sm object-contain"
                />
              </motion.div>
            </div>
          )
        })}
      </motion.div>

      {/* Center logo — static (doesn't rotate), explicitly centered via absolute positioning */}
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{
          width: CENTER_SIZE,
          height: CENTER_SIZE,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="absolute inset-0 rounded-full bg-white/5 blur-xl" />
        <div className="absolute inset-0 rounded-full bg-white/10 blur-sm" />
        <Image
          src="/favicon.svg"
          alt="ConFuse"
          width={CENTER_SIZE}
          height={CENTER_SIZE}
          className="relative z-10 drop-shadow-lg"
          priority
        />
      </div>
    </div>
  )
}
