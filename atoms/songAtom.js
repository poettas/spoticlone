import { atom } from "recoil";

export const currentTrackIdState = atom({
    key: "currentTrackIdState",
    // uniqie ID (with respect to other atom/selectors)
    default: null,
    //default value = initial value
});

export const isPlaylingState = atom({
    key: "isPlaylingState",
    default: false,
});
