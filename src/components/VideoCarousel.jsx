import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
import { useEffect, useRef, useState } from "react";

import { hightlightsSlides } from "../constants";
import { pauseImg, playImg, replayImg } from "../utils";

const VideoCarousel = () => {
    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);

    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false,
    });

    const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

    useGSAP(() => {
        gsap.to("#slider", {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: "power2.inOut",
        });

        gsap.to("#video", {
            scrollTrigger: {
                trigger: "#video",
                toggleActions: "restart none none none",
            },
            onComplete: () => {
                setVideo((pre) => ({
                    ...pre,
                    startPlay: true,
                    isPlaying: true,
                }));
            },
        });
    }, [isEnd, videoId]);

    useEffect(() => {
        let currentProgress = 0;
        let anim;
        let animUpdate;
        const spanEl = videoSpanRef.current[videoId];

        if (spanEl) {
            anim = gsap.to(spanEl, {
                onUpdate: () => {
                    const progress = Math.ceil(anim.progress() * 100);

                    if (progress !== currentProgress) {
                        currentProgress = progress;

                        gsap.to(videoDivRef.current[videoId], {
                            width:
                                window.innerWidth < 760
                                    ? "10vw"
                                    : window.innerWidth < 1200
                                        ? "10vw"
                                        : "4vw",
                        });

                        gsap.to(spanEl, {
                            width: `${currentProgress}%`,
                            backgroundColor: "white",
                        });
                    }
                },

                onComplete: () => {
                    if (isPlaying) {
                        gsap.to(videoDivRef.current[videoId], {
                            width: "12px",
                        });
                        gsap.to(spanEl, {
                            backgroundColor: "#afafaf",
                        });
                    }
                },
            });

            if (videoId === 0) {
                anim.restart();
            }

            animUpdate = () => {
                const currentVideo = videoRef.current[videoId];
                if (currentVideo && currentVideo.duration) {
                    anim.progress(currentVideo.currentTime / currentVideo.duration);
                }
            };

            if (isPlaying) {
                gsap.ticker.add(animUpdate);
            }
        }

        return () => {
            if (animUpdate) gsap.ticker.remove(animUpdate);
            if (anim) anim.kill();
        };
    }, [videoId, startPlay, isPlaying]);

    useEffect(() => {
        videoRef.current.forEach((vid, i) => {
            if (i !== videoId && vid) {
                vid.pause();
            }
        });

        if (videoRef.current[videoId]) {
            if (startPlay && isPlaying) {
                videoRef.current[videoId].play();
            } else {
                videoRef.current[videoId].pause();
            }
        }
    }, [startPlay, videoId, isPlaying]);

    const handleProcess = (type, i) => {
        switch (type) {
            case "video-end":
                if (videoRef.current[i]) {
                    videoRef.current[i].pause();
                }
                setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }));
                break;

            case "video-last":
                if (videoRef.current[i]) {
                    videoRef.current[i].pause();
                }
                setVideo((pre) => ({ ...pre, isLastVideo: true, isPlaying: false }));
                break;

            case "video-reset":
                videoRef.current.forEach((vid) => vid && vid.pause());
                setVideo((pre) => ({
                    ...pre,
                    videoId: 0,
                    isLastVideo: false,
                    startPlay: true,
                    isPlaying: true,
                }));
                break;

            case "pause":
                setVideo((pre) => ({ ...pre, isPlaying: false }));
                break;

            case "play":
                setVideo((pre) => ({ ...pre, isPlaying: true, startPlay: true }));
                break;

            default:
                return video;
        }
    };

    const handleLoadedMetaData = (i, e) => {
    };

    return (
        <>
            <div className="flex items-center">
                {hightlightsSlides.map((list, i) => (
                    <div key={list.id} id="slider" className="sm:pr-20 pr-10">
                        <div className="video-carousel_container">
                            <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                                <video
                                    id="video"
                                    playsInline={true}
                                    className={`${list.id === 2 && "translate-x-44"} pointer-events-none`}
                                    preload="auto"
                                    muted
                                    ref={(el) => (videoRef.current[i] = el)}
                                    onEnded={() =>
                                        i !== 3
                                            ? handleProcess("video-end", i)
                                            : handleProcess("video-last", i)
                                    }
                                    onPlay={() =>
                                        setVideo((pre) => ({ ...pre, isPlaying: true }))
                                    }
                                    onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                                >
                                    <source src={list.video} type="video/mp4" />
                                </video>
                            </div>

                            <div className="absolute top-12 left-[5%] z-10">
                                {list.textLists.map((text, i) => (
                                    <p key={i} className="md:text-2xl text-xl font-medium">
                                        {text}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative flex-center mt-10">
                <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
                    {videoRef.current.map((_, i) => (
                        <span
                            key={i}
                            className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
                            ref={(el) => (videoDivRef.current[i] = el)}
                            onClick={() =>
                                setVideo({
                                    isEnd: false,
                                    startPlay: true,
                                    videoId: i,
                                    isLastVideo: false,
                                    isPlaying: true,
                                })
                            }
                        >
                            <span
                                className="absolute h-full w-full rounded-full"
                                ref={(el) => (videoSpanRef.current[i] = el)}
                            />
                        </span>
                    ))}
                </div>

                <button className="control-btn">
                    <img
                        src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
                        alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
                        onClick={
                            isLastVideo
                                ? () => handleProcess("video-reset")
                                : !isPlaying
                                    ? () => handleProcess("play")
                                    : () => handleProcess("pause")
                        }
                    />
                </button>
            </div>
        </>
    );
};

export default VideoCarousel;
