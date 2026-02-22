document.addEventListener('DOMContentLoaded', function () {
    var whisperBox = document.getElementById('effigy-whisper');
    var effigy = document.getElementById('hanging-effigy');
    var listInner = document.getElementById('effigy-result-list-inner');
    var resultList = document.getElementById('effigy-result-list');
    var chatInput = document.getElementById('effigy-chat-input');
    var sendBtn = document.getElementById('effigy-send-btn');

    var whispers = [
        '...the rain never stops...',
        '...it is so cold at the crossroads...',
        '...there are no ghosts, only memories...',
        '...heavy is the damp earth...',
        '...we journey into the dark alone...',
        '...even the wind sounds like weeping...',
        '...a room with spiders in the corners...',
        '...waiting for the dawn...'
    ];
    var lastQuoteIndex = -1;

    function setWhisper(text) {
        if (whisperBox) whisperBox.textContent = text || '';
    }

    function setInputPlaceholder(text) {
        if (chatInput) chatInput.placeholder = text || '';
    }

    function pickRandomWhisper() {
        if (!whispers.length) return '';
        var nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * whispers.length);
        } while (nextIndex === lastQuoteIndex && whispers.length > 1);
        lastQuoteIndex = nextIndex;
        return whispers[nextIndex];
    }

    function refreshPlaceholderIfEmpty() {
        if (chatInput && !chatInput.value.trim()) setInputPlaceholder(pickRandomWhisper());
    }

    setInputPlaceholder(pickRandomWhisper());

    if (effigy) {
        effigy.addEventListener('mouseenter', function () {
            refreshPlaceholderIfEmpty();
            var gust = (Math.random() - 0.5) * 10;
            effigy.style.transform = 'rotate(' + gust + 'deg)';
        });
        effigy.addEventListener('mouseleave', function () {
            effigy.style.transform = '';
        });
    }

    function scrollResultToBottom() {
        if (resultList) resultList.scrollTop = resultList.scrollHeight;
    }

    function setInputEnabled(enabled) {
        if (chatInput) chatInput.disabled = !enabled;
        if (sendBtn) sendBtn.disabled = !enabled;
    }

    function sendMessage() {
        if (!chatInput || !listInner) return;
        var message = (chatInput.value || '').trim();
        if (!message) return;

        chatInput.value = '';
        setInputEnabled(false);
        setInputPlaceholder('...at the crossroads. go on.');

        var apiUrl = 'https://wenhengfei-space.vercel.app/api/chat';
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                var reply = (data && data.reply) ? String(data.reply) : '';
                if (!reply) {
                    setInputPlaceholder('...nothing this time...');
                    setInputEnabled(true);
                    refreshPlaceholderIfEmpty();
                    return;
                }
                /* Output only in result list; random whisper in input placeholder when empty */
                if (typeof window.revealTextAtRate === 'function') {
                    window.revealTextAtRate(listInner, reply, {
                        unit: 'char',
                        charsPerSecond: 180,
                        newlineAsNewLine: true,
                        lineClassName: 'effigy-result-line',
                        scrollToBottom: scrollResultToBottom
                    }).then(function () {
                        setInputEnabled(true);
                        refreshPlaceholderIfEmpty();
                    });
                } else {
                    var line = document.createElement('div');
                    line.className = 'effigy-result-line';
                    line.textContent = reply;
                    listInner.appendChild(line);
                    scrollResultToBottom();
                    setInputEnabled(true);
                    refreshPlaceholderIfEmpty();
                }
            })
            .catch(function () {
                setInputPlaceholder('...the wind took it...');
                setInputEnabled(true);
                refreshPlaceholderIfEmpty();
            });
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        chatInput.addEventListener('focus', function () {
            if (!chatInput.value.trim()) refreshPlaceholderIfEmpty();
        });
    }
});
