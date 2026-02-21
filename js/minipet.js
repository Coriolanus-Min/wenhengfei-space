document.addEventListener('DOMContentLoaded', () => {
    const whisperBox = document.getElementById('effigy-whisper');
    const effigy = document.getElementById('hanging-effigy');
    if (!whisperBox || !effigy) return;

    // Atmospheric quotes inspired by Svidrigailov / Wuthering Heights / Despair
    const whispers = [
        "...the rain never stops...",
        "...it is so cold at the crossroads...",
        "...there are no ghosts, only memories...",
        "...heavy is the damp earth...",
        "...we journey into the dark alone...",
        "...even the wind sounds like weeping...",
        "...a room with spiders in the corners...", // Svidrigailov's vision of eternity
        "...waiting for the dawn..."
    ];

    let lastQuoteIndex = -1;

    effigy.addEventListener('mouseenter', () => {
        // Pick a random quote that isn't the last one
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * whispers.length);
        } while (nextIndex === lastQuoteIndex && whispers.length > 1);
        
        lastQuoteIndex = nextIndex;
        whisperBox.textContent = whispers[nextIndex];
        
        // Add a slight randomized creak/rotation to the element itself on hover
        // to simulate a gust of wind disturbing it
        const gust = (Math.random() - 0.5) * 10; 
        effigy.style.transform = `rotate(${gust}deg)`;
    });

    effigy.addEventListener('mouseleave', () => {
        // Remove the forced transform so the CSS keyframe animation takes over again smoothly
        effigy.style.transform = '';
    });
});