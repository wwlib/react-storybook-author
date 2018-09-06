import { expect } from 'chai';
import 'mocha';

import GoogleSTTWordTimingAdjuster from '../src/renderer/googlecloud/GoogleSTTWordTimingAdjuster';

// const actualText: string = 'once upon a time there was an ogre who loved a princess';
// const googleTranscript: string = 'once upon a time there was an ogre Who Loved a princess';
const googleWords: any[] = [
  {
    "startTime": {
      "seconds": "0",
      "nanos": 700000000
    },
    "endTime": {
      "seconds": "1",
      "nanos": 200000000
    },
    "word": "once"
  },
  {
    "startTime": {
      "seconds": "1",
      "nanos": 200000000
    },
    "endTime": {
      "seconds": "1",
      "nanos": 500000000
    },
    "word": "upon"
  },
  {
    "startTime": {
      "seconds": "1",
      "nanos": 500000000
    },
    "endTime": {
      "seconds": "1",
      "nanos": 600000000
    },
    "word": "a"
  },
  {
    "startTime": {
      "seconds": "1",
      "nanos": 600000000
    },
    "endTime": {
      "seconds": "2",
      "nanos": 0
    },
    "word": "time"
  },
  {
    "startTime": {
      "seconds": "2",
      "nanos": 0
    },
    "endTime": {
      "seconds": "2",
      "nanos": 300000000
    },
    "word": "there"
  },
  {
    "startTime": {
      "seconds": "2",
      "nanos": 300000000
    },
    "endTime": {
      "seconds": "2",
      "nanos": 300000000
    },
    "word": "was"
  },
  {
    "startTime": {
      "seconds": "2",
      "nanos": 300000000
    },
    "endTime": {
      "seconds": "2",
      "nanos": 500000000
    },
    "word": "an"
  },
  {
    "startTime": {
      "seconds": "2",
      "nanos": 500000000
    },
    "endTime": {
      "seconds": "2",
      "nanos": 900000000
    },
    "word": "ogre"
  },
  {
    "startTime": {
      "seconds": "2",
      "nanos": 900000000
    },
    "endTime": {
      "seconds": "3",
      "nanos": 200000000
    },
    "word": "Who"
  },
  {
    "startTime": {
      "seconds": "3",
      "nanos": 200000000
    },
    "endTime": {
      "seconds": "3",
      "nanos": 400000000
    },
    "word": "Loved"
  },
  {
    "startTime": {
      "seconds": "3",
      "nanos": 400000000
    },
    "endTime": {
      "seconds": "3",
      "nanos": 500000000
    },
    "word": "a"
  },
  {
    "startTime": {
      "seconds": "3",
      "nanos": 500000000
    },
    "endTime": {
      "seconds": "4",
      "nanos": 100000000
    },
    "word": "princess"
  }
];

// const actualTextSimple: string = 'once upon a time';
// const googleTranscriptSimple: string = 'once upon a time';
const googleWordsSimple: any[] = [
  {
    "startTime": {
      "seconds": "0",
      "nanos": 700000000
    },
    "endTime": {
      "seconds": "1",
      "nanos": 200000000
    },
    "word": "once"
  },
  {
    "startTime": {
      "seconds": "1",
      "nanos": 200000000
    },
    "endTime": {
      "seconds": "1",
      "nanos": 500000000
    },
    "word": "upon"
  },
  {
    "startTime": {
      "seconds": "1",
      "nanos": 500000000
    },
    "endTime": {
      "seconds": "1",
      "nanos": 600000000
    },
    "word": "a"
  },
  {
    "startTime": {
      "seconds": "1",
      "nanos": 600000000
    },
    "endTime": {
      "seconds": "2",
      "nanos": 0
    },
    "word": "time"
  }
];

describe('GoogleSpeechWordTimingAdjuster', () => {
    // it('word distance should equal 0', () => {
    //     let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a time');
    //     let wordDistance: number = googleSTTWordTimingAdjuster.wordDistance("hello", "hello");
    //     expect(wordDistance).to.equal(0);
    // });
    //
    // it('word distance should not equal 0', () => {
    //     let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a time');
    //     let wordDistance: number = googleSTTWordTimingAdjuster.wordDistance("hello", "goodbye");
    //     expect(wordDistance).to.not.equal(0);
    // });
    //
    it('matching trnascript: ops should deep equal [2,2,2,2]', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a time');
        expect(googleSTTWordTimingAdjuster.ops).to.deep.equal([2,2,2,2]);
    });

    it('missing transcript word: ops should deep equal [2,2,2,1,2]', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a moon time');
        expect(googleSTTWordTimingAdjuster.ops).to.deep.equal([2,2,2,1,2]);
    });

    it('extra transcript word: ops should deep equal [2, 0, 2, 2]', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once a time');
        // console.log(googleSTTWordTimingAdjuster.ops);
        expect(googleSTTWordTimingAdjuster.ops).to.deep.equal([2, 0, 2, 2]);
    });

    it('matching transcript: formattedGoogleWords should deep equal expected result', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a time');
        // console.log(googleSTTWordTimingAdjuster.formattedGoogleWords);
        let expectedResult: any = [
                { index: 0, word: 'once', start: 0.7, end: 1.2 },
                { index: 1, word: 'upon', start: 1.2, end: 1.5 },
                { index: 2, word: 'a', start: 1.5, end: 1.6 },
                { index: 3, word: 'time', start: 1.6, end: 2 }
            ];
        expect(googleSTTWordTimingAdjuster.formattedGoogleWords).to.deep.equal(expectedResult);
    });

    it('matching transcript: transformResult should equal expectedResult', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a time');
        // console.log(googleSTTWordTimingAdjuster.transformResult);
        let expectedResult: any = {
            result:
            [
                { index: 0, word: 'once', start: 0.7, end: 1.2 },
                { index: 1, word: 'upon', start: 1.2, end: 1.5 },
                { index: 2, word: 'a', start: 1.5, end: 1.6 },
                { index: 3, word: 'time', start: 1.6, end: 2 }
            ],
            should_trim_audio: false,
            trimmed_end_time: undefined
        }

        expect(googleSTTWordTimingAdjuster.transformResult).to.deep.equal(expectedResult);
    });

    it('missing transcript word: transformResult should equal expectedResult', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a moon time');
        // console.log(googleSTTWordTimingAdjuster.transformResult);
        let expectedResult: any = {
            result:
            [
                { index: 0, word: 'once', start: 0.7, end: 1.2 },
                { index: 1, word: 'upon', start: 1.2, end: 1.5 },
                { index: 2, word: 'a', start: 1.5, end: 1.5750000000000002 },
                { index: 3, word: 'moon', start: 1.5750000000000002, end: 1.75 },
                { index: 4, word: 'time', start: 1.75, end: 2 }
            ],
            should_trim_audio: false,
            trimmed_end_time: undefined
            }
        expect(googleSTTWordTimingAdjuster.transformResult).to.deep.equal(expectedResult);
    });

    it('extra transcript word: transformResult should equal expectedResult', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once a time');
        // console.log(googleSTTWordTimingAdjuster.transformResult);
        let expectedResult: any = {
            result:
            [
                { index: 0, word: 'once', start: 0.7, end: 1.35 },
                { index: 1, word: 'a', start: 1.35, end: 1.6 },
                { index: 2, word: 'time', start: 1.6, end: 2 }
            ],
            should_trim_audio: false,
            trimmed_end_time: undefined
            }
        expect(googleSTTWordTimingAdjuster.transformResult).to.deep.equal(expectedResult);
    });

    it('extra trailing actual words: transformResult should equal expectedResult', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a time there was an ogre');
        // console.log(googleSTTWordTimingAdjuster.transformResult);
        let expectedResult: any = {
            result:
            [
                { index: 0, word: 'once', start: 0.7, end: 1.2 },
                { index: 1, word: 'upon', start: 1.2, end: 1.5 },
                { index: 2, word: 'a', start: 1.5, end: 1.6 },
                { index: 3, word: 'time', start: 1.6, end: 1.75 },
                { index: 4, word: 'there', start: 1.75, end: 1.84375 },
                { index: 5, word: 'was', start: 1.84375, end: 1.90234375 },
                { index: 6, word: 'an', start: 1.90234375, end: 1.93896484375 },
                { index: 7, word: 'ogre', start: 1.93896484375, end: 2 }
            ],
            should_trim_audio: false,
            trimmed_end_time: undefined
        }
        expect(googleSTTWordTimingAdjuster.transformResult).to.deep.equal(expectedResult);
    });

    it('extra trailing google words: transformResult should equal expectedResult', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWords, 'once upon a time');
        // console.log(googleSTTWordTimingAdjuster.transformResult);
        let expectedResult: any = {
            result:
            [
                { index: 0, word: 'once', start: 0.7, end: 1.2 },
                { index: 1, word: 'upon', start: 1.2, end: 1.5 },
                { index: 2, word: 'a', start: 1.5, end: 1.6 },
                { index: 3, word: 'time', start: 1.6, end: 2 }
            ],
            should_trim_audio: true,
            trimmed_end_time: 2.05
        }
        expect(googleSTTWordTimingAdjuster.transformResult).to.deep.equal(expectedResult);
    });

    it('matching transcript word: alignedWords should equal expectedResult', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a time');
        // console.log(googleSTTWordTimingAdjuster.alignedWords);
        let expectedResult: any = {
            result:
            [
                { index: 0, word: 'once', start: 0.7, end: 1.2 },
                { index: 1, word: 'upon', start: 1.2, end: 1.5 },
                { index: 2, word: 'a', start: 1.5, end: 1.6 },
                { index: 3, word: 'time', start: 1.6, end: 2 }
            ],
            should_trim_audio: false,
            trimmed_end_time: undefined
        }
        expect(googleSTTWordTimingAdjuster.alignedWords).to.deep.equal(expectedResult);
    });

});
