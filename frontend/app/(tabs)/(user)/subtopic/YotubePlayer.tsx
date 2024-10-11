import React, { useState, useCallback } from 'react';
import { Button, View, Alert } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

// Helper function to extract the YouTube video ID from the URL
function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface AppProps {
  uriId: string; // URL string
}

export const App: React.FC<AppProps> = ({ uriId }) => {
  const [playing, setPlaying] = useState(false);

  // Extract YouTube video ID from the provided URI
  const id = getYoutubeVideoId(uriId);

  // Toggle video playback state
  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  if (!id) {
    // Show an alert if the video ID could not be extracted
    Alert.alert('Error', 'Invalid YouTube URL.');
    return null;
  }

  return (
    <View style={{marginTop:40}}>
      <YoutubePlayer
        height={300}
        play={playing}
        videoId={id}
      />
    </View>
  );
};
