import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlaylingState } from "../atoms/songAtom";
import useSongInfo from "../hooks/useSongInfo";
import useSpotify from "../hooks/useSpotify";

import {
    SwitchHorizontalIcon,
    HeartIcon,
    VolumeUpIcon as VolumeDownIcon,
} from "@heroicons/react/outline";
import {
    RewindIcon,
    FastForwardIcon,
    PauseIcon,
    PlayIcon,
    ReplyIcon,
    VolumeUpIcon,
} from "@heroicons/react/solid";

const Player = () => {
    const spotifyApi = useSpotify();
    const { data: session, status } = useSession();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlayling] = useRecoilState(isPlaylingState);
    const [volume, setVolume] = useState(50);

    const songInfo = useSongInfo();

    const fetchCurrentSong = () => {
        if (!songInfo) {
            spotifyApi.getMyCurrentPlayingTrack().then((data) => {
                console.log(`Now playling: ${data.body?.item}`);
                setCurrentTrackId(data.body?.item.id);

                spotifyApi.getMyCurrentPlaybackState().then((data) => {
                    setIsPlayling(data.body?.is_playing);
                });
            });
        }
    };

    const handlePlayPause = () => {
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
            if (data.body.is_playing) {
                spotifyApi.pause();
                setIsPlayling(false);
            } else {
                spotifyApi.play();
                setIsPlayling(true);
            }
        });
    };
    useEffect(() => {
        if (spotifyApi.getAccessToken() && !currentTrackId) {
            fetchCurrentSong();
            setVolume(50);
        }
    }, [currentTrackId, spotifyApi, session]);

    useEffect(() => {
        if (volume > 0 && volume < 100) {
            debouncedAdjustVolume(volume);
        }
    }, [volume]);

    //using debounce to minify the amount of api calls
    const debouncedAdjustVolume = useCallback(
        debounce((volume) => {
            spotifyApi.setVolume(volume).catch((err) => {});
        }, 500),
        []
    );

    return (
        <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8">
            {/* Left section - Track*/}
            <div className="flex items-center space-x-4">
                <img
                    src={songInfo?.album.images?.[0].url}
                    alt=""
                    className="hidden md:inline h-10 w-10"
                />
                <div>
                    <h3>{songInfo?.name}</h3>
                    <p>{songInfo?.artists?.[0]?.name}</p>
                </div>
            </div>

            {/* Center - Player */}
            <div className="flex items-center justify-evenly">
                <SwitchHorizontalIcon className="button" />
                <RewindIcon
                    onClick={() => spotifyApi.skipToPrevious()}
                    className="button"
                />
                {isPlaying ? (
                    <PauseIcon onClick={handlePlayPause} className="button w-10 h-10" />
                ) : (
                    <PlayIcon onClick={handlePlayPause} className="button w-10 h-10" />
                )}

                <FastForwardIcon
                    className="button"
                    onClick={() => spotifyApi.skipToNext()}
                />
                <ReplyIcon className="button" />
            </div>

            {/* Right - Volume */}
            <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
                <VolumeDownIcon
                    className="button"
                    onClick={() => volume > 0 && setVolume(volume - 10)}
                />
                <input
                    className="w-14 md:w-28"
                    type="range"
                    value={volume}
                    min={0}
                    max={100}
                    onChange={(e) => setVolume(Number(e.target.value))}
                />
                <VolumeUpIcon
                    className="button"
                    onClick={() => volume < 100 && setVolume(volume + 10)}
                />
            </div>
        </div>
    );
};

export default Player;
