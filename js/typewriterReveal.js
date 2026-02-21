/**
 * Typewriter-style reveal: show API reply at a controlled rate so the user
 * can read along in the limited visible area ("对方实时打印").
 *
 * Usage (after script load):
 *   revealTextAtRate(containerElement, fullText, { charsPerSecond: 25, ... });
 */
(function (global) {
    'use strict';

    /**
     * Reveal text into a container at a configurable rate (character or word).
     * Newlines create new line nodes for FIFO layout.
     *
     * @param {HTMLElement} listInner - The scrollable list inner (FIFO lines go here).
     * @param {string} text - Full reply text from API.
     * @param {Object} options
     * @param {'char'|'word'} [options.unit='char'] - Reveal by character or by word.
     * @param {number} [options.charsPerSecond=28] - Target characters per second (comfortable reading).
     * @param {number} [options.wordsPerMinute] - If set with unit='word', used for word delay.
     * @param {boolean} [options.newlineAsNewLine=true] - On \n, append a new line node.
     * @param {string} [options.lineClassName='effigy-result-line'] - Class for each line node.
     * @param {function} [options.scrollToBottom] - Called after each tick to keep latest in view.
     * @param {function} [options.onLineCreated] - Called when a new line node is created.
     * @returns {Promise<void>} Resolves when full text has been revealed.
     */
    function revealTextAtRate(listInner, text, options) {
        options = options || {};
        var unit = options.unit || 'char';
        var charsPerSecond = options.charsPerSecond != null ? options.charsPerSecond : 28;
        var wordsPerMinute = options.wordsPerMinute;
        var newlineAsNewLine = options.newlineAsNewLine !== false;
        var lineClassName = options.lineClassName || 'effigy-result-line';
        var scrollToBottom = options.scrollToBottom;
        var onLineCreated = options.onLineCreated;

        var msPerChar = unit === 'word' && wordsPerMinute
            ? (60 * 1000) / (wordsPerMinute * 5)
            : 1000 / Math.max(1, charsPerSecond);

        return new Promise(function (resolve) {
            if (!text || !listInner) {
                resolve();
                return;
            }

            var line = document.createElement('div');
            line.className = lineClassName;
            listInner.appendChild(line);
            if (onLineCreated) onLineCreated(line);

            var segments = unit === 'word'
                ? text.split(/(\s+|\n)/).filter(Boolean)
                : text.split('');

            var i = 0;
            var delay = 0;

            function appendToLine(str) {
                line.appendChild(document.createTextNode(str));
            }

            function tick() {
                if (i >= segments.length) {
                    if (scrollToBottom) scrollToBottom();
                    resolve();
                    return;
                }

                var seg = segments[i];
                i += 1;

                if (newlineAsNewLine && (seg === '\n' || (unit === 'word' && /^\n+$/.test(seg)))) {
                    line = document.createElement('div');
                    line.className = lineClassName;
                    listInner.appendChild(line);
                    if (onLineCreated) onLineCreated(line);
                    if (scrollToBottom) scrollToBottom();
                    delay += msPerChar;
                    setTimeout(tick, delay);
                    return;
                }

                if (unit === 'word' && /^\s+$/.test(seg)) {
                    appendToLine(seg);
                } else {
                    appendToLine(seg);
                    delay += unit === 'word' ? msPerChar * Math.max(1, seg.length) : msPerChar;
                }

                if (scrollToBottom) scrollToBottom();
                setTimeout(tick, delay);
            }

            tick();
        });
    }

    /** Comfortable reading in small panel: ~28 chars/sec. */
    var DEFAULT_READING_RATE = { unit: 'char', charsPerSecond: 28, newlineAsNewLine: true };

    global.revealTextAtRate = revealTextAtRate;
    global.DEFAULT_READING_RATE = DEFAULT_READING_RATE;
})(typeof window !== 'undefined' ? window : this);
