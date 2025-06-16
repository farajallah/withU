## Inspiration

The inspiration for withU stems from a desire to enhance personal safety and provide peace of mind in a world where emergencies can occur unexpectedly. We envisioned a tool that could act as a vigilant companion, especially for those who might be vulnerable or alone, by intelligently recognizing signs of distress and facilitating quick responses. The idea was to leverage technology to create an accessible and easy-to-use safety net, offering reassurance to users and their loved ones.

## What it does

withU is a mobile application designed to enhance user safety by providing intelligent sound monitoring and manual status reporting. Key features include:
- **Emergency Sound Detection:** Actively listens for sounds like fire alarms, smoke detectors, and sirens (currently with web-based analysis, with plans for mobile).
- **Manual Safety Status:** Allows users to quickly update and share their safety status (e.g., 'I'm Safe,' 'Need Help,' 'Emergency'), optionally with a custom message.
- **Configurable Alerts:** When a potential emergency is detected or triggered, the app can activate vibration, flash the screen/camera light, and play an audio alert.
- **Automated Assistance Message:** Plays a pre-defined (or configurable) assistance message to guide the user or alert others nearby.
- **Multilingual Interface:** Supports multiple languages (English, Turkish, Arabic) for broader accessibility.
- **Intuitive Navigation:** Features a clear tab-based interface for easy access to protection controls, monitoring, settings, and status updates.

## How we built it

withU is built using a modern stack for mobile application development:
- **Core Framework:** React Native with Expo, enabling rapid development and cross-platform deployment for iOS and Android from a single codebase.
- **Language:** TypeScript, providing static typing for more robust and maintainable code.
- **Audio Processing:**
    - Expo AV: Utilized for audio playback (e.g., assistance messages) and planned for native audio recording/processing on mobile.
    - Web Audio API: Currently powers the real-time sound analysis features in the web version of the app.
- **User Feedback:** Expo Haptics is integrated to provide tactile feedback for user interactions and alerts.
- **UI and Styling:**
    - `lucide-react-native` for a comprehensive set of clean and consistent icons.
    - `expo-linear-gradient` and `expo-blur` for enhanced visual effects.
    - Standard React Native components (View, Text, TouchableOpacity, ScrollView) and Expo's file-system based routing for structuring the user interface.
- **Internationalization:** `i18next` and `react-i18next` are used to support multiple languages, making the app accessible to a wider audience.
- **State Management:** Primarily uses React's built-in state management (useState, useEffect) and component props.

## Challenges we ran into

Developing withU came with its set of challenges:
- **Reliable Sound Classification:** Creating a sound detection system that is both accurate (identifying real emergencies) and robust (minimizing false positives) across diverse environments and sound profiles is complex. The current implementation uses frequency analysis, primarily on the web, and we acknowledge that a more sophisticated Machine Learning approach would be needed for production-grade reliability on mobile.
- **Cross-Platform Hardware Access:** Ensuring consistent behavior for features like camera flash alerts and background audio processing across both iOS, Android, and web platforms requires careful native module integration and handling of platform-specific APIs.
- **Permissions Management:** Requesting and handling permissions (especially for microphone access) in a user-friendly way, while ensuring the app functions correctly based on the granted permissions, was a key consideration.
- **Battery Optimization:** For features like continuous sound monitoring, optimizing for battery life while maintaining effectiveness is a significant challenge, particularly on mobile devices.
- **Alert System Integrity:** Designing an alert system that is dependable in critical situations yet doesn't trigger unnecessarily required careful thought about thresholds and user controls.
- **UI/UX for Stressful Situations:** Crafting an interface that is intuitive and easy to navigate, especially when a user might be in distress, was a priority and an ongoing design consideration.

## Accomplishments that we're proud of

Despite the challenges, we're proud of several accomplishments with withU:
- **Functional Safety Prototype:** We successfully built a working application that demonstrates the core concepts of emergency sound detection and user status reporting.
- **Real-Time Sound Analysis (Web):** Implemented a system capable of analyzing audio input in real-time (on web platforms) to identify potential emergency sounds like sirens and alarms, laying the groundwork for more advanced mobile detection.
- **Multi-Modal Alert System:** Developed a comprehensive alert system that uses sound, vibration, and visual cues (screen flash) to notify the user, increasing the chances of an alert being noticed.
- **Internationalization:** Integrated support for multiple languages (English, Turkish, and Arabic) from an early stage, enhancing the app's accessibility and potential reach.
- **Intuitive User Interface:** Designed a clean, tab-based navigation that makes it easy for users to control protection, monitor sounds, adjust settings, and update their safety status.
- **User-Configurable Settings:** Provided a detailed settings screen allowing users to customize alert behaviors and monitoring options to their preferences.
- **Privacy-Conscious Design:** Emphasized user privacy in the app's design, particularly concerning microphone usage and data handling, as highlighted in the settings.

## What we learned

The development of withU has been a valuable learning experience:
- **Audio Processing Nuances:** We gained a deeper understanding of the complexities of real-time audio analysis. Distinguishing specific emergency sounds from ambient noise reliably is a non-trivial task that often requires sophisticated techniques beyond simple frequency analysis.
- **Cross-Platform Development Realities:** We learned firsthand the importance of addressing platform-specific APIs and behaviors early in the development cycle, especially for features interacting with device hardware like audio inputs and haptic feedback. What works seamlessly on one platform (e.g., Web Audio API) may require entirely different native solutions for mobile.
- **User Trust and Safety Apps:** Building an application intended for safety and emergency situations underscored the importance of clear communication, transparent permission requests, and building user trust through predictable and reliable behavior.
- **Iterative Prototyping:** The project reinforced the value of starting with a simpler implementation (like the web-based sound analysis) to understand core challenges before tackling more complex native mobile solutions, such as machine learning models for sound classification.
- **Internationalization Workflow:** Implementing multilingual support provided insights into managing translation files, context-specific translations, and testing across different languages within a React Native (Expo) environment.
- **Expo Ecosystem Benefits:** We learned to leverage various Expo libraries and tools (Expo AV, Expo Haptics, file-system routing) to accelerate development and manage native functionalities more easily.

## What's next for withU

We have many ideas for the future development of withU to make it an even more powerful safety companion:
- **On-Device Machine Learning for Sound Detection:** Transition from the current web-based/simplified sound analysis to a robust, on-device Machine Learning model for highly accurate and responsive emergency sound detection on mobile platforms (iOS and Android), enabling offline functionality.
- **Full Native Mobile Feature Set:** Implement native mobile solutions for all alert types, including camera flash, and optimize background audio monitoring for efficiency and reliability on iOS and Android.
- **Emergency Contact Notifications:** Introduce a system for automatically notifying pre-set emergency contacts with location data and alert details when an emergency is detected or triggered by the user.
- **Customizable Sound Alerts:** Allow users to potentially train the app to recognize other specific sounds that are important for their safety or environment.
- **Wearable Device Integration:** Extend functionality to smartwatches for quick status updates, alerts, and haptic feedback.
- **Geofenced Safety Zones:** Implement features to define safety zones and trigger alerts or notifications if a user unexpectedly leaves a defined area.
- **Improved Assistance Message Customization:** Offer more options for customizing the automated assistance message, perhaps with dynamic information.
- **Data Backup and Sync:** Allow users to back up their settings and history, and synchronize across devices if applicable.
- **Accessibility Enhancements:** Continuously improve accessibility features to ensure the app is usable by people with diverse needs and disabilities.
