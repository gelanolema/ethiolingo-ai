import re

# Frequently used phrases with reviewed translations.
PHRASES = {
    "good morning.": {
        "gaz_Latn": "Akkam bulte?",
        "amh_Ethi": "እንደምን አደሩ?"
    },
    "how are you?": {
        "gaz_Latn": "Akkam jirta?",
        "amh_Ethi": "እንዴት ነህ?"
    },
    "welcome to ethiolingo ai.": {
        "gaz_Latn": "Baga gara EthioLingo AI dhuftan.",
        "amh_Ethi": "ወደ ኢትዮሊንጎ AI እንኳን ደህና መጡ።"
    },
    "i am a student.": {
        "gaz_Latn": "Ani barataa dha.",
        "amh_Ethi": "እኔ ተማሪ ነኝ።"
    }
}


def normalize_text(text):
    return re.sub(r"\s+", " ", text).strip()


def split_sentences(text):
    return [
        sentence.strip()
        for sentence in re.findall(
            r"[^.!?]+[.!?]*", text
        )
        if sentence.strip()
    ]


def glossary_translation(text, target_code):
    key = normalize_text(text).casefold()
    return PHRASES.get(key, {}).get(target_code)


def clean_translation(text, target_code):
    text = text.strip()
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s+([,.!?።፣])", r"\1", text)

    # Normalize repeated punctuation.
    text = re.sub(r"([.!?።])\1+", r"\1", text)

    return text
