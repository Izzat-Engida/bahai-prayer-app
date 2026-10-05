import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

export type YoutubeAudioPlayerProps = {
  videoId: string | null;
  play: boolean;
  onEnded?: () => void;
  onError?: (error: string | number) => void;
  onReady?: () => void;
};

const APP_ORIGIN = "https://bahaiprayer.app";

function generateHTML(initialVideoId: string | null): string {
  const vid = initialVideoId || "";
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: #000000;
        overflow: hidden;
      }
      #player {
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script>
      function sendMessage(type, data) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
        }
      }

      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var player = null;
      var isPlayerReady = false;

      function onYouTubeIframeAPIReady() {
        var playerConfig = {
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: "${APP_ORIGIN}"
          },
          events: {
            'onReady': function(event) {
              isPlayerReady = true;
              sendMessage('ready');
            },
            'onStateChange': function(event) {
              if (event.data === YT.PlayerState.PLAYING) {
                sendMessage('playing');
              } else if (event.data === YT.PlayerState.PAUSED) {
                sendMessage('paused');
              } else if (event.data === YT.PlayerState.BUFFERING) {
                sendMessage('buffering');
              } else if (event.data === YT.PlayerState.ENDED) {
                sendMessage('ended');
              }
            },
            'onError': function(event) {
              sendMessage('error', event.data);
            }
          }
        };

        var initVid = "${vid}";
        if (initVid) {
          playerConfig.videoId = initVid;
        }

        player = new YT.Player('player', playerConfig);
      }

      window.handleReactNativeCommand = function(cmdStr) {
        try {
          var cmd = typeof cmdStr === 'string' ? JSON.parse(cmdStr) : cmdStr;
          if (!player || !isPlayerReady) return;

          if (cmd.type === 'load') {
            if (cmd.videoId) {
              if (cmd.play) {
                player.loadVideoById(cmd.videoId);
              } else {
                player.cueVideoById(cmd.videoId);
              }
            } else {
              player.stopVideo();
            }
          } else if (cmd.type === 'play') {
            player.playVideo();
          } else if (cmd.type === 'pause') {
            player.pauseVideo();
          } else if (cmd.type === 'stop') {
            player.stopVideo();
          }
        } catch(e) {
          sendMessage('error', 'command_exception: ' + e.message);
        }
      };
    </script>
  </body>
</html>`;
}

export default function YoutubeAudioPlayer({
  videoId,
  play,
  onEnded,
  onError,
  onReady,
}: YoutubeAudioPlayerProps) {
  const webViewRef = useRef<WebView | null>(null);
  const [isReady, setIsReady] = useState(false);

  const currentVideoIdRef = useRef<string | null>(videoId);
  const currentPlayRef = useRef<boolean>(play);

  const sendCommand = useCallback((cmd: { type: string; videoId?: string | null; play?: boolean }) => {
    if (!webViewRef.current) return;
    const jsonStr = JSON.stringify(cmd);
    const js = `if (window.handleReactNativeCommand) { window.handleReactNativeCommand(${JSON.stringify(jsonStr)}); } true;`;
    webViewRef.current.injectJavaScript(js);
  }, []);

  useEffect(() => {
    if (!isReady || !videoId) return;

    const videoIdChanged = currentVideoIdRef.current !== videoId;
    const playChanged = currentPlayRef.current !== play;

    if (videoIdChanged) {
      currentVideoIdRef.current = videoId;
      currentPlayRef.current = play;
      sendCommand({ type: "load", videoId, play });
    } else if (playChanged) {
      currentPlayRef.current = play;
      if (play) {
        sendCommand({ type: "play" });
      } else {
        sendCommand({ type: "pause" });
      }
    }
  }, [isReady, videoId, play, sendCommand]);

  useEffect(() => {
    return () => {
      if (isReady && webViewRef.current) {
        sendCommand({ type: "pause" });
      }
    };
  }, [isReady, sendCommand]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        switch (message.type) {
          case "ready": {
            setIsReady(true);
            onReady?.();
            if (videoId) {
              currentVideoIdRef.current = videoId;
              currentPlayRef.current = play;
              sendCommand({ type: "load", videoId, play });
            }
            break;
          }
          case "ended": {
            currentPlayRef.current = false;
            onEnded?.();
            break;
          }
          case "error": {
            onError?.(message.data);
            break;
          }
          default:
            break;
        }
      } catch (e) {
        console.warn("Failed to parse WebView message:", e);
      }
    },
    [videoId, play, sendCommand, onReady, onEnded, onError]
  );

  const htmlContent = useRef(generateHTML(videoId)).current;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{
          html: htmlContent,
          baseUrl: APP_ORIGIN,
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={false}
        scrollEnabled={false}
        bounces={false}
        originWhitelist={["*"]}
        mixedContentMode="always"
        onMessage={handleMessage}
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    marginVertical: 4,
    backgroundColor: "#000000",
  },
  webView: {
    width: 300,
    height: 200,
    backgroundColor: "transparent",
  },
});
