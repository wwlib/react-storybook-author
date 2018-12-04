
const speech = require('@google-cloud/speech');
const fs = require('fs');

export type ClientCredentials = {
    private_key: string;
    client_email: string;
}

export type ClientConfig = {
    credentials: ClientCredentials;
    projectId: string;
}

export type GoogleSTTControllerOptions = {
    audioFilename?: string;
    audioBase64Data?: string;
}

export type WordTime = {
    seconds: string;
    nanos: number;
}

export type WordResult = {
    startTime: WordTime;
    endTime: WordTime;
    word: string;
}

export type GoogleSTTResponse = {
    transcript: string;
    words: WordResult[];
}

export default class GoogleSTTController {

    public client: any;
    // public fileName: string;
    // public file: any;
    // public audioBytes: any;
    private _clientConfig: ClientConfig;
    private _options: GoogleSTTControllerOptions;

    constructor(clientConfig: ClientConfig, options: GoogleSTTControllerOptions) {

        this._clientConfig = clientConfig || {
            credentials: {
                private_key: '',
                client_email: '',
            },
            projectId: ''
        }
        this._options = options || {
            audioFilename: undefined,
            audioBase64Data: undefined
        }
    }

    processAudioFile(): Promise<GoogleSTTResponse> {
        return new Promise<GoogleSTTResponse>((resolve, reject) => {
            let speechClientOptions: any = {
                clientConfig: this._clientConfig,
                credentials: this._clientConfig.credentials,
                projectId: this._clientConfig.projectId
            }

            this.client = new speech.SpeechClient(speechClientOptions);

            let audioBytes;
            if (this._options.audioBase64Data) {
                audioBytes = this._options.audioBase64Data;
            } else if (this._options.audioFilename) {
                // The name of the audio file to transcribe
                let fileName = this._options.audioFilename; // './assets/onceuponatime.wav';
                // Reads a local audio file and converts it to base64
                let file = fs.readFileSync(fileName);
                audioBytes = file.toString('base64');
            }
            if (audioBytes) {
                // The audio file's encoding, sample rate in hertz, and BCP-47 language code
                const audio = {
                  content: audioBytes,
                };
                const config = {
                  encoding: 'LINEAR16',
                  // sampleRateHertz: 16000,
                  languageCode: 'en-US',
                  enableWordTimeOffsets: true
                };
                const request = {
                  audio: audio,
                  config: config,
                };

                // Detects speech in the audio file
                this.client
                  .recognize(request)
                  // .longRunningRecognize(request)
                  .then(data => {
                      console.log(data);
                    const response = data[0];
                    const words = response.results[0].alternatives[0].words;
                    console.log(JSON.stringify(words, null, 2));
                    const transcript = response.results
                      .map(result => result.alternatives[0].transcript)
                      .join('\n');
                    console.log(`transcript: ${transcript}`);
                    resolve({transcript: transcript, words: words})
                  })
                  .catch(err => {
                    // console.error('ERROR:', err);
                    reject(err);
                  });
            } else {
                reject('audiobytes is undefined.');
            }
        });
    }
}

// constructor(opts) {
//     this._descriptors = {};
//
//     // Ensure that options include the service address and port.
//     opts = Object.assign(
//       {
//         clientConfig: {},
//         port: this.constructor.port,
//         servicePath: this.constructor.servicePath,
//       },
//       opts
//     );

// /**
//  * Construct an instance of SpeechClient.
//  *
//  * @param {object} [options] - The configuration object. See the subsequent
//  *   parameters for more details.
//  * @param {object} [options.credentials] - Credentials object.
//  * @param {string} [options.credentials.client_email]
//  * @param {string} [options.credentials.private_key]
//  * @param {string} [options.email] - Account email address. Required when
//  *     using a .pem or .p12 keyFilename.
//  * @param {string} [options.keyFilename] - Full path to the a .json, .pem, or
//  *     .p12 key downloaded from the Google Developers Console. If you provide
//  *     a path to a JSON file, the projectId option below is not necessary.
//  *     NOTE: .pem and .p12 require you to specify options.email as well.
//  * @param {number} [options.port] - The port on which to connect to
//  *     the remote host.
//  * @param {string} [options.projectId] - The project ID from the Google
//  *     Developer's Console, e.g. 'grape-spaceship-123'. We will also check
//  *     the environment variable GCLOUD_PROJECT for your project ID. If your
//  *     app is running in an environment which supports
//  *     {@link https://developers.google.com/identity/protocols/application-default-credentials Application Default Credentials},
//  *     your project ID will be detected automatically.
//  * @param {function} [options.promise] - Custom promise module to use instead
//  *     of native Promises.
//  * @param {string} [options.servicePath] - The domain name of the
//  *     API remote host.
//  */
