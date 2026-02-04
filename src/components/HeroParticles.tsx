
import { useCallback, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions, MoveDirection, OutMode } from "@tsparticles/engine";
import { useEffect, useState } from "react";

export default function HeroParticles() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options: ISourceOptions = useMemo(() => ({
        fullScreen: { enable: false },
        background: { color: { value: "transparent" } },
        fpsLimit: 120,
        interactivity: {
            events: {
                onClick: { enable: true, mode: "push" },
                onHover: {
                    enable: true,
                    mode: "grab",
                    parallax: {
                        enable: true,
                        force: 60,
                        smooth: 10
                    }
                },
            },
            modes: {
                push: { quantity: 4 },
                grab: {
                    distance: 180,
                    links: {
                        opacity: 0.8,
                    }
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
            },
        },
        particles: {
            color: {
                value: ["#ec4899", "#f472b6", "#8b5cf6", "#a78bfa", "#6366f1"],
            },
            links: {
                color: "#f472b6",
                distance: 150,
                enable: true,
                opacity: 0.4,
                width: 1.5,
            },
            move: {
                direction: "none" as MoveDirection,
                enable: true,
                outModes: {
                    default: "bounce" as OutMode,
                },
                random: true,
                speed: 1.2,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                },
                value: 100,
            },
            opacity: {
                value: { min: 0.3, max: 0.7 },
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 4 },
            },
        },
        detectRetina: true,
    }), []);

    if (!init) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-0 opacity-50">
            <Particles
                id="tsparticles"
                options={options}
                className="h-full w-full"
            />
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/50 pointer-events-none" />
        </div>
    );
}
