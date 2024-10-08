import React, { useState, useCallback, useRef } from "react";
import { Button, View, Alert } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

export default function App({ videoId }: { videoId: string }) {
    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: any) => {
        if (state === "ended") {
            setPlaying(false);
            Alert.alert("video has finished playing!");
        }
    }, []);

    const togglePlaying = useCallback(() => {
        setPlaying((prev) => !prev);
    }, []);

    return (
        <View>
            <YoutubePlayer
                height={200}
                play={playing}
                videoId={videoId}
                onChangeState={onStateChange}
            />
            {/* <Button title={playing ? "pause" : "play"} onPress={togglePlaying} /> */}
        </View>
    );
}