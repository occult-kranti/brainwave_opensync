# Live music in Cymatic Studio

Open [Cymatic Studio](https://occult-kranti.github.io/brainwave_opensync/cymatics). The instrument can use audio shared by your browser to drive its sand, liquid, nodal-ink and stereo-trace views. Capture starts only after you select a source and approve the browser prompt.

## YouTube and Spotify web

1. Open YouTube or [Spotify web](https://open.spotify.com/) in another tab of desktop Chrome or Edge and start playback.
2. Return to Cymatic Studio, choose **Browser tab**, then **Capture browser tab**.
3. In the browser picker, select the player tab, enable **Share tab audio** (the label may vary), and confirm sharing.
4. Return to Cymatic Studio to watch the figure. Choose another scene or switch to Lissajous to inspect the stereo waveform.
5. Use **Stop capture** or the browser’s stop-sharing control when finished. Source changes, leaving the instrument, opening the precision lab, and Panic release capture too.

The original player remains responsible for playback, volume and pause. The instrument analyzes the shared audio without sending a second copy to your speakers. A connected source can be silent if playback is paused, audio sharing was omitted, or the browser or source does not expose the audio.

## Spotify desktop and other laptop apps

Choose **Laptop audio**, then **Capture laptop audio**. In the browser picker, choose **Entire screen** and enable system audio **if that option is available**. Sharing a window does not guarantee an audio track.

System-audio availability depends on the browser, operating system, permissions and selected sharing surface. Windows and ChromeOS commonly offer it in Chromium browsers; it cannot be promised on every laptop. On macOS or Linux, prefer the web-player tab. Another option is an audio loopback device that routes playback to a recording input: configure it as the operating system’s default input, then select **Audio input** and **Connect audio input** in the instrument. Creating or installing such a device is an operating-system setup step, not an automatic browser feature. Selecting a physical microphone instead captures the room and speakers, with different acoustic results.

Firefox and Safari may support screen sharing without providing display audio. Use a browser that offers tab audio or an explicitly configured recording input.

## Controls and status

- **Connected** names the selected source; it means the browser returned an audio track, not that music is necessarily present.
- **Audio temporarily muted** reflects a capture track muted by the browser or operating system. Restore the source or reconnect if needed.
- A signal-level meter shows detected amplitude. After approximately five seconds without a detected live signal, the instrument offers playback and sharing checks.
- **Freeze** pauses the visual view; capture remains connected. **Resume** restores live display.
- **Cancel connection** discards an outstanding request. Browsers may keep their native picker open; a later result is released rather than attached.
- **PNG** and **Clip** export the generated visualization. Clips contain the picture without captured audio.

## Local processing and model limits

The Screen Capture API requires a display-sharing request even when an application only needs the audio. The instrument does not render, process, upload or record the shared screen frames. It uses the audio stream in a local Web Audio analysis graph. Screen and audio tracks are released together when capture ends. No account or backend is needed.

Sand and nodal-ink views are idealized virtual-plate responses. Liquid is an artistic interference field. The view is a visualization derived from audio features, not a measurement of a physical plate or a biological effect. Changing the virtual plate changes the geometry for the same music.

## Browser references

- [MDN: `getDisplayMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia): user activation, permissions, requested options and audio compatibility.
- [MDN: Screen Capture API audio capture](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#capturing_shared_audio): display surfaces do not necessarily supply audio.
- [Chrome: Screen sharing controls](https://developer.chrome.com/docs/web-platform/screen-sharing-controls): browser-tab preference, system-audio hints and local playback controls.
- [MDN: `getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia): microphone and recording-device access.

Source restrictions and browser permission decisions still apply. The setup instructions do not imply that every service, browser or protected playback mode supplies capturable audio.
