/*
This script is run in the authoring interface web app.

It is a similar script as in PRG_M_Turk/story_labeling/scripts, except here
its IO is through PythonShell (from npm package python-shell), instead of
via reading audio files.

The script takes as input a string representing a json object that has
two fields:

  {
    "google_words": [(word:string, start:float, end:float)],
    "real_words":[word:string]
  }

and outputs a string that is a json object with this format:

{
  "timestamps": [{ index: int, start: float, end: float }],
    "should_trim_audio": bool,
      "trimmed_end_time": float
}

This script is called from the alignGoogleSpeechTimestamps() function
in the util.js file in this directory.

*/

// import DoubleMetaphone from 'double-metaphone';
const DoubleMetaphone = require("double-metaphone");

const BILLION = 1000000000;

// How much of the previous and next words to steal when we insert a new word
// in the middle of the sequence during timestamp interpolation.
const PREV_INTERPOLATION = 2.0 / 8.0;
const NEXT_INTERPOLATION = 3.0 / 8.0;
const END_PREV_INTERPOLATION = 5.0 / 8.0; // For when we are inserting at the end.

// Sketchy stuff - hardcode similar words to fix failure modes...
// Not actually used yet, but maybe will have to, sad.
const HOMONYMS = {
    8: "ate",
};

/*
Enum for the transform operations in min edit distance algorithm.
*/
export enum Op {
    DELETE = 0,
    INSERT = 1,
    KEEP = 2,
    NO_OP = 3,
}

export default class GoogleSpeechWordTimingAdjuster {

    public googleWords: any[];
    public actualText: string;
    public formattedGoogleWords: any[];
    public actualWords: string[];
    public ops: any[];
    public transformResult: any = {};
    public alignedWords: any = {};

    constructor(googleWords: any, actualText: string) {
        this.googleWords = googleWords;
        this.actualText = actualText;
        this.formattedGoogleWords = this.reformatGoogleWords(googleWords);
        this.actualWords = actualText.split(' ');

        this.ops = this.runMinEditDistance(this.formattedGoogleWords, this.actualWords);
        this.transformResult = this.transform(this.formattedGoogleWords, this.actualWords, this.ops);
        this.alignedWords = this.align(this.formattedGoogleWords, this.actualWords);
    }

    reformatGoogleWords(googleWords) {
        var reformatted: any[] = [];
        for (var i = 0; i < googleWords.length; i++) {
            let wordInfo = googleWords[i];
            let start = this.getSeconds(wordInfo.startTime);
            let end = this.getSeconds(wordInfo.endTime);
            reformatted.push([wordInfo.word, start, end]);
        }
        return reformatted;
    }

    getSeconds(wordTimeInfo) {
        var seconds = wordTimeInfo.seconds || 0;
        var nanos = wordTimeInfo.nanos || 0;
        return (seconds * 1.0) + (nanos * 1.0 / BILLION);
    }

    public wordDistance(w1: string, w2: string): number {
        /*
        Used to give scores in min_edit_distance algorithm.
        Returns a score that is 0 if the words are the same, and something higher
        when the words are different, depending on how different they are.
        */
        // Heuristic - check how many consecutive letters are the same.
        // TODO: Not sure if I should make initial score 2?
        // Rationale is that if one letter matches should be better than a remove or edit.
        w1 = w1.toLowerCase();
        w2 = w2.toLowerCase();
        let score: number = 0;
        let idx: number = 0;
        if (w1 === w2) {
            score = 0;
        } else if (w1.length >= 2 && w2.length >= 2 && (DoubleMetaphone(w1) === DoubleMetaphone(w2))) {
            score = 0;
        } else if (w1 in HOMONYMS && HOMONYMS[w1] === w2 || w2 in HOMONYMS && HOMONYMS[w2] === w1) {
            score = 0;
        } else {
            score = 1.25;
            idx = 0;
            while (idx < w1.length && idx < w2.length && w1[idx] === w2[idx]) {
                score *= 0.5;
                idx += 1;
            }
        }
        return score;
    }

    public runMinEditDistance(google_words: string[], real_words: string[]): any {
        /*
        Runs a minimum edit distance DP algorithm to transform google_words into
        real_words.

        Takes into account the fact that words that should be aligned may
        not be identical, and so there is no "replace" operation but instead of
        checking for matches, we check for the edit distance between the two words.

        Returns the changes that were made to google_words, so that the caller can handle
        interpolating timestamps. The changes should only be additions or deletions.
        */

        let m = google_words.length;
        let n = real_words.length;
        let ed: any[][] = []; //[[None for j in xrange(n + 1)] for i in xrange(m + 1)]
        let bt: any[][] = []; // = [[None for j in xrange(n + 1)] for i in xrange(m + 1)]


        for (var i: number = 0; i <= m; i++) {
            let row: any[] = [];
            for (var j: number = 0; j <= n; j++) {
                row[j] = null;
            }
            ed[i] = row;

            row = [];
            for (var j: number = 0; j <= n; j++) {
                row[j] = null;
            }
            bt[i] = row;
        }

        // console.log('ed: \n', ed);
        // console.log('bt: \n', bt);

        // Base cases.
        // Use multiply by 2 because in our application this case is *really* bad?
        // for i in xrange(m + 1):
        //   ed[i][0] = i
        //   bt[i][0] = Op.NO_OP

        for (var i: number = 0; i <= m; i++) {
            ed[i][0] = i;
            bt[i][0] = Op.NO_OP;
        }

        // for j in xrange(n + 1):
        //   ed[0][j] = j
        //   bt[0][j] = Op.NO_OP

        for (var j: number = 0; j <= n; j++) {
            ed[0][j] = j;
            bt[0][j] = Op.NO_OP;
        }

        // console.log('ed: \n', ed);
        // console.log('bt: \n', bt);

        for (var i: number = 1; i <= m; i++) {
            for (var j: number = 1; j <= n; j++) {
                // Either a deletion from google_words, an insertion, or a replacement.
                let best_score = Number.MAX_VALUE;
                let best_op: number[] | undefined = undefined;
                let delete_score = 1 + ed[i - 1][j];
                if (delete_score < best_score) {
                    best_score = delete_score;
                    best_op = [i - 1, j, Op.DELETE];
                }
                let insert_score = 1 + ed[i][j - 1];
                if (insert_score < best_score) {
                    best_score = insert_score;
                    best_op = [i, j - 1, Op.INSERT];
                }
                // Correct for off by one by using i-1, j-1 as indexes to get words,
                // since the table starts with an extra space.
                let google_word = google_words[i - 1][0];
                let real_word = real_words[j - 1];
                // console.log(`google_word: `, google_word);
                // console.log(`real_word: `, real_word);
                let wordDistance = this.wordDistance(google_word, real_word);
                // console.log(`wordDistance: `, wordDistance);
                let keep_score = wordDistance + ed[i - 1][j - 1];
                // console.log(`keep_score: `, keep_score);
                if (keep_score < best_score) {
                    best_score = keep_score;
                    best_op = [i - 1, j - 1, Op.KEEP];
                }
                ed[i][j] = best_score
                bt[i][j] = best_op

            }
        }

        // console.log('ed: \n', ed);
        // console.log('bt: \n', bt);

        // Backtrace through bt table to build list of operations.
        let ops: any[] = [];
        let last_op = bt[m][n];
        let x = m;
        let y = n;
        while (last_op != Op.NO_OP) {
            ops.push(last_op);
            x = last_op[0];
            y = last_op[1];
            last_op = bt[x][y]
        }
        // console.log(`ops: `, ops);
        // Extract only the operations and ignore the i, j values.
        // ops = map(lambda op: op[2], ops)
        let ops2 = ops.map(op => op[2]);
        // console.log(`ops2: `, ops2);
        // For any missing operations, add inserts.
        // for k in xrange(max(x, y)):
        for (var k: number = 0; k < Math.max(x, y); k++) {
            ops2.push(Op.INSERT)
        }
        // console.log(`ops2: `, ops2);
        // Put into the correct order.
        ops2.reverse()
        // print ops
        return ops2
    }

    public transform(google_words: any[], real_words: string[], transform_ops: number[]): any {
        // Given the google transcript and series of operations to perform, transforms
        // the google transcript, with timestamps either copied directly from Google's
        // annotations, or interpolated between consecutive words.
        //
        // Returns an array of tuples (word_idx, start_time, end_time), where start_time
        // and end_time are floats in seconds.

        let result: any[] = [];
        let word_result: string[] = [];
        let next_google_idx = 0;
        let next_result_idx = 0;
        let should_trim_audio = false;


        transform_ops.some((op: number): boolean => {
            if (result.length >= real_words.length) {
                // Reaching here likely means there are extra DELETE operations
                // at the end, which means we need to trim the audio.
                should_trim_audio = true;
                return true;
            } else {
                if (op == Op.KEEP) {
                    let start, end;
                    start = google_words[next_google_idx][1];
                    end = google_words[next_google_idx][2];
                    result.push([next_result_idx, start, end]);
                    word_result.push(google_words[next_google_idx][0]);
                    next_google_idx += 1
                    next_result_idx += 1
                } else if (op == Op.DELETE) {
                    // print "deleting!!"
                    // Adjust the timestamps.
                    if (next_google_idx + 1 >= google_words.length) {
                        // pass
                    } else {
                        if (next_result_idx == 0) {
                            // At the beginning, give all time to next google word.
                            let deleted_start = google_words[next_google_idx][1];
                            let next_next_word = google_words[next_google_idx + 1];
                            google_words[next_google_idx + 1] = [next_next_word[0], deleted_start, next_next_word[2]];
                        } else if (next_google_idx >= google_words.length) {
                            // No more words to skip. Shouldn't get here.
                            throw new Error("something is wrong");
                        } else {
                            // In the middle, split evenly.
                            let prev_result_word = result[result.length - 1];
                            let next_next_word = google_words[next_google_idx + 1];
                            let deleted_start = google_words[next_google_idx][1];
                            let deleted_end = google_words[next_google_idx][2];
                            let middle = deleted_start + .5 * (deleted_end - deleted_start);
                            result[result.length - 1] = [prev_result_word[0], prev_result_word[1], middle];
                            google_words[next_google_idx + 1] = [next_next_word[0], middle, next_next_word[2]];
                        }
                    }
                    word_result.push("DELETED")
                    next_google_idx += 1
                } else if (op == Op.INSERT) {
                    // The trickier case, need to interpolate desired timestamps.
                    // Three cases here. Either we're inserting at the very beginning,
                    // inserting at the very end, or inserting in the middle.
                    let start: number | undefined = undefined;
                    let end: number | undefined = undefined;
                    if (next_result_idx == 0) {
                        // We're at the beginning.
                        // Take the first NEXT_INTERPOLATION fraction of the 0th google word.
                        let google_word = google_words[0]
                        let diff = (google_word[2] - google_word[1]) * NEXT_INTERPOLATION
                        // Replace the timestamps at the 0th google word.
                        google_words[0] = [google_word[0], diff, google_word[2]];
                        start = 0.0;
                        end = diff;
                    } else if (next_google_idx >= google_words.length) {
                        // We're at the end.
                        // Take the last PREV_INTERPOLATION fraction of the last result we have.
                        let prev_result_word = result[result.length - 1];
                        // print prev_result_word
                        let diff = (prev_result_word[2] - prev_result_word[1]) * END_PREV_INTERPOLATION;
                        // Replace the timestamps of our last previous result.
                        let new_prev_end = prev_result_word[2] - diff;
                        result[result.length - 1] = [prev_result_word[0], prev_result_word[1], new_prev_end];
                        start = new_prev_end;
                        end = prev_result_word[2];
                        // print start, end
                    } else {
                        // We're in the middle, we have results already, and there are more
                        // google words upcoming.
                        let prev_result_word = result[result.length - 1];
                        let next_google_word = google_words[next_google_idx];
                        // Replace the timestamps of prev_result_word and next_google_word.
                        // Steal some fraction of the times from the prev and next word.
                        let prev_third = (prev_result_word[2] - prev_result_word[1]) * PREV_INTERPOLATION;
                        let next_third = (next_google_word[2] - next_google_word[1]) * NEXT_INTERPOLATION;
                        if (prev_third <= 0) {
                            // print prev_result_word[2], prev_result_word[1]
                            // pass
                        }
                        if (next_third <= 0) {
                            // print next_google_word[2], next_google_word[1]
                            // pass
                        }
                        //TODO assert prev_third > 0 and next_third > 0
                        if (prev_third > 0 && next_third > 0) {
                            start = prev_result_word[2] - prev_third;
                            end = next_google_word[1] + next_third;
                            result[result.length - 1] = [prev_result_word[0], prev_result_word[1], start];
                            google_words[next_google_idx] = [next_google_word[0], end, next_google_word[2]]
                        } else {
                            throw new Error('prev_third and next_third must be > 0');
                        }
                    }
                    result.push([next_result_idx, start, end]);
                    next_result_idx += 1;
                    word_result.push("INSERT");
                } else {
                    throw new Error("Unknown operation");
                }
                return false;
            }
        });
        // print " ".join(map(str, word_result))
        // If we should trim the audio, trim it to the end of the last result.

        let trimmed_end_time = undefined;
        if (should_trim_audio) {
            // print "Should trim audio!"
            trimmed_end_time = result[result.length - 1][2] + .05
        }
        return { result, should_trim_audio, trimmed_end_time }
    }


    public align(google_words, real_words): any {
        // The argument google_words is an array of (word_idx, start, end) tuples.
        //
        // Returns a modified (word_idx, start, end) based on the transcript we know
        // to be correct, where start and end are floats.
        //
        // Also returns information on potentially trimming the audio.

        // print "Aligning..."
        let timestamped_words: any[] = [];
        let should_trim_audio = false;
        let trimmed_end_time = undefined;
        if (google_words.length == real_words.length) {
            // If lengths are the same, then we're good to go, just copy things over
            // to the correct format.
            for (var i: number = 0; i < google_words.length; i++) {
                let google_word = google_words[i]
                timestamped_words.push([i, google_word[1], google_word[2]])
            }
        } else {
            // Need to run min edit distance DP algorithm.
            // print "Compare google words to real words:"
            // print " ".join(map(lambda x: str(x[0]), google_words))
            // print " ".join(real_words)
            let transform_ops = this.runMinEditDistance(google_words, real_words);
            let transformedWords: any = this.transform(google_words, real_words, transform_ops);
            timestamped_words = transformedWords.result;
            should_trim_audio = transformedWords.should_trim_audio;
            trimmed_end_time = transformedWords.trimmed_end_time;
        }

        //assert len(timestamped_words) == len(real_words)
        return {timestamped_words, should_trim_audio, trimmed_end_time};
    }
}
/*

if __name__ == "__main__":
  input_json_string = sys.argv[1]
  input_content = json.loads(input_json_string)

  google_words = input_content["google_words"]
  real_words = input_content["real_words"]

  timestamped_words, should_trim_audio, trimmed_end_time = align(google_words, real_words)
  result = {
    "timestamps": timestamped_words,
    "should_trim_audio": should_trim_audio,
    "trimmed_end_time": trimmed_end_time
  }
  result_string = json.dumps(result)

  # Printing the result will return it to the javascript function that called
  # this script using the npm package python-shell.
  print result_string

*/
