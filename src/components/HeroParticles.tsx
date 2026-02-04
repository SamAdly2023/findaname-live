
import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function HeroParticles() {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <div className="absolute inset-0 z-0 opacity-40">
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={{
                    fullScreen: { enable: false },
                    background: { color: { value: "transparent" } },
                    fpsLimit: 120,
                    interactivity: {
                        events: {
                            onClick: { enable: true, mode: "push" },
                            onHover: { enable: true, mode: "grab" },
                            resize: true,
                        },
                        modes: {
                            push: { quantity: 4 },
                            grab: { distance: 140, links: { opacity: 1 } },
                        },
                    },
                    particles: {
                        color: { value: "#6366f1" },
                        links: {
                            color: "#818cf8",
                            distance: 150,
                            enable: true,
                            opacity: 0.3,
                            width: 1,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: { default: "bounce" },
                            random: false,
                            speed: 1.5,
                            straight: false,
                        },
                        number: {
                            density: { enable: true, area: 800 },
                            value: 80,
                        },
                        opacity: { value: 0.5 },
                        shape: { type: "circle" },
                        size: { value: { min: 1, max: 3 } },
                    },
                    detectRetina: true,
                }}
                className="h-full w-full"
            />
        </div>
    );
};
