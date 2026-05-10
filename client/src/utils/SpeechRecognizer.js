/**
 * Speech Recognition Utility
 * Supports: English, Hindi, Marathi, Gujarati
 * Uses Web Speech API (free, browser-native)
 * 
 * Usage:
 * const recorder = new SpeechRecognizer('hi-IN');
 * recorder.start();
 * recorder.onResult = (text) => console.log(text);
 */

class SpeechRecognizer {
  constructor(language = '') {
    // Empty string = browser auto-detects spoken language
    this.language = language;
    this.isListening = false;
    this.transcript = '';

    // Browser compatibility
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn(
        'Speech Recognition not supported in this browser. Use Chrome, Edge, or Safari.'
      );
      this.recognition = null;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = language;

    // Callbacks
    this.onStart = null;
    this.onResult = null; // (transcript)
    this.onError = null;  // (errorMessage)
    this.onEnd = null;

    this._setupListeners();
  }

  _setupListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.transcript = '';
      if (this.onStart) this.onStart();
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      if (this.onResult) this.onResult(finalTranscript.trim());
    };

    this.recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not available. Check device settings.',
        'not-allowed': 'Microphone permission denied. Allow access in browser settings.',
        'network': 'Network error. Check your internet connection.',
      };
      const message = errorMessages[event.error] || `Speech error: ${event.error}`;
      if (this.onError) this.onError(message);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };
  }

  start() {
    if (!this.recognition) {
      if (this.onError) {
        this.onError('Speech Recognition not supported. Try Chrome, Edge, or Safari.');
      }
      return;
    }
    if (this.isListening) return;
    this.transcript = '';

    // Check mic permission before starting recognition
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          try {
            this.recognition.start();
          } catch (e) {
            if (this.onError) this.onError('Could not start microphone. Please try again.');
          }
        })
        .catch((err) => {
          const msg = err.name === 'NotAllowedError'
            ? 'Microphone permission denied. Allow access in browser settings.'
            : 'Microphone not available. Check device settings.';
          if (this.onError) this.onError(msg);
        });
    } else {
      // Fallback for browsers without getUserMedia
      try {
        this.recognition.start();
      } catch (e) {
        if (this.onError) this.onError('Could not start microphone. Please try again.');
      }
    }
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  abort() {
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  setLanguage(language) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  isSupported() {
    return this.recognition !== null;
  }
}

export default SpeechRecognizer;
