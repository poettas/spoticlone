import { ChevronDownIcon } from "@heroicons/react/outline";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { shuffle } from "lodash";
import { useRecoilState, useRecoilValue } from "recoil";
import { playlistState, playlistIdState } from "../atoms/playlistAtom";
import useSpotify from "../hooks/useSpotify";
import Songs from "./Songs";
import { signOut } from "next-auth/react";

const colors = [
    "from-indigo-500",
    "from-blue-500",
    "from-green-500",
    "from-red-500",
    "from-yellow-500",
    "from-pink-500",
    "from-purple-500",
];

const Center = () => {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    const [color, setColor] = useState(null);
    //creates a read-only version of that variable
    const playlistId = useRecoilValue(playlistIdState);
    const [playlist, setPlaylist] = useRecoilState(playlistState);

    useEffect(() => {
        setColor(shuffle(colors).pop());
    }, [playlistId]);

    useEffect(() => {
        spotifyApi
            .getPlaylist(playlistId)
            .then((data) => {
                setPlaylist(data.body);
            })
            .catch((err) => console.log("Something went wrong!", err));
    }, [spotifyApi, playlistId]);

    console.log(playlist);

    return (
        <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide">
            <header className="absolute top-5 right-8">
                <div
                    className="flex items-center bg-black space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full p-1 pr-2 text-white"
                    onClick={signOut}
                >
                    <img
                        src={session?.user.image}
                        alt=""
                        className="rounded-full w-10 h-10 bg-gradient-to-tr from-gray-300 to-red-800"
                    />
                    <h2>{session?.user.name}</h2>
                    <ChevronDownIcon className="h-5 w-5" />
                </div>
            </header>
            <section
                className={`flex items-end space-x-7 bg-gradient-to-b to-black ${color} h-80 text-white p-8`}
            >
                <img
                    src={playlist?.images[0]?.url}
                    alt="picture of the playlist"
                    className="h-44 w-44 shadow-2xl"
                />
                <div>
                    <p>PLAYLIST</p>
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold">
                        {playlist?.name}
                    </h2>
                </div>
            </section>
            <div>
                <Songs />
            </div>
        </div>
    );
};

export default Center;
