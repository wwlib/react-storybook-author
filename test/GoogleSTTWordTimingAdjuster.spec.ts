import { expect } from 'chai';
import 'mocha';

import GoogleSTTWordTimingAdjuster from '../src/renderer/googlecloud/GoogleSTTWordTimingAdjuster';

const actualText: string = 'once upon a time there was an ogre who loved a princess';
const googleTranscript: string = 'once upon a time there was an ogre Who Loved a princess';
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

const actualTextSimple: string = 'once upon a time';
const googleTranscriptSimple: string = 'once upon a time';
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
    it('word distance should equal 0', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, actualTextSimple);
        let wordDistance: number = googleSTTWordTimingAdjuster.wordDistance("hello", "hello");
        expect(wordDistance).to.equal(0);
    });

    it('word distance should not equal 0', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, actualTextSimple);
        let wordDistance: number = googleSTTWordTimingAdjuster.wordDistance("hello", "goodbye");
        expect(wordDistance).to.not.equal(0);
    });

    it('ops should deep equal [2,2,2,2]', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, actualTextSimple);
        expect(googleSTTWordTimingAdjuster.ops).to.deep.equal([2,2,2,2]);
    });

    it('ops should deep equal [2,2,2,1,2]', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a moon time');
        expect(googleSTTWordTimingAdjuster.ops).to.deep.equal([2,2,2,1,2]);
    });

    it('transformResult should equal expectedResult', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a time');
        let expectedResult: any = {
            result:
                [ [ 0, 0.7, 1.2 ],
                [ 1, 1.2, 1.5 ],
                [ 2, 1.5, 1.6 ],
                [ 3, 1.6, 2 ] ],
            should_trim_audio: false,
            trimmed_end_time: undefined
            }
        expect(googleSTTWordTimingAdjuster.transformResult).to.deep.equal(expectedResult);
    });

    it('transformResult should equal expectedResult', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a moon time');
        let expectedResult: any = {
            result:
                [ [ 0, 0.7, 1.2 ],
                [ 1, 1.2, 1.5 ],
                [ 2, 1.5, 1.5750000000000002 ],
                [ 3, 1.5750000000000002, 1.75 ],
                [ 4, 1.75, 2 ] ],
            should_trim_audio: false,
            trimmed_end_time: undefined
         }
        expect(googleSTTWordTimingAdjuster.transformResult ).to.deep.equal(expectedResult);
    });

    it('align result should equal expectedResult', () => {
        let googleSTTWordTimingAdjuster = new GoogleSTTWordTimingAdjuster(googleWordsSimple, 'once upon a time');
        let expectedResult: any = {
            timestamped_words:
                [ [ 0, 0.7, 1.2 ],
                [ 1, 1.2, 1.5 ],
                [ 2, 1.5, 1.6 ],
                [ 3, 1.6, 2 ] ],
            should_trim_audio: false,
            trimmed_end_time: undefined
        }
        // console.log( googleSTTWordTimingAdjuster.alignedWords);
        expect(googleSTTWordTimingAdjuster.alignedWords ).to.deep.equal(expectedResult);
    });

});
