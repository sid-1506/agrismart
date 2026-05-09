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
  constructor(language = 'en-US') {
    // Language codes: en-US, hi-IN, mr-IN, gu-IN
    this.language = language;
    this.isListening = false;
    this.transcript = '';
    this.isFinal = false;

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
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.language = language;

    // Callbacks
    this.onStart = null;
    this.onResult = null; // (transcript, isFinal)
    this.onError = null; // (errorMessage)
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
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.transcript += transcript + ' ';
          this.isFinal = true;
        } else {
          interim += transcript;
        }
      }

      // Combine final and interim
      const fullTranscript = this.transcript + interim;
      if (this.onResult) this.onResult(fullTranscript.trim(), this.isFinal);
    };

    this.recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not available. Check device settings.',
        'not-allowed': 'Microphone permission denied. Allow access in browser settings.',
        'network': 'Network error. Check your internet connection.',
        'default': `Speech error: ${event.error}`,
      };
      const message = errorMessages[event.error] || errorMessages['default'];
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
    this.isFinal = false;
    try {
      this.recognition.start();
    } catch (e) {
      if (this.onError) this.onError('Could not start microphone. Please try again.');
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
      this.recognition.language = language;
    }
  }

  isSupported() {
    return this.recognition !== null;
  }
}

export default SpeechRecognizer;
