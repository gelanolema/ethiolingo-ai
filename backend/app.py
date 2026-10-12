
from contextlib import asynccontextmanager
from threading import Lock

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from backend.quality import (
    normalize_text,
    split_sentences,
    glossary_translation,
    clean_translation,
)
MODEL_NAME = "facebook/nllb-200-distilled-600M"


LANGUAGES = {
    "Afaan Oromoo": "gaz_Latn",
    "Amharic": "amh_Ethi",
}


tokenizer = None
model = None
translation_lock = Lock()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global tokenizer, model

    print("Loading NLLB translation model...")
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME,
        src_lang="eng_Latn"
    )
    model = AutoModelForSeq2SeqLM.from_pretrained(
        MODEL_NAME
    )
    model.eval()
    print("EthioLingo AI model is ready!")

    yield


app = FastAPI(
    title="EthioLingo AI API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    target_language: str


@app.get("/")
def home():
    return {
        "message": "EthioLingo AI backend is running!",
        "status": "success"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }



def translate_one(text: str, target_code: str) -> str:
    if tokenizer is None or model is None:
        raise HTTPException(
            status_code=503,
            detail="Translation model is not ready."
        )

    text = normalize_text(text)
    sentences = split_sentences(text)

    if not sentences:
        raise HTTPException(
            status_code=400,
            detail="Please enter valid text."
        )

    translations = []

    with translation_lock:
        for sentence in sentences:
            # Use reviewed translations for common phrases.
            reviewed = glossary_translation(
                sentence, target_code
            )

            if reviewed:
                translations.append(reviewed)
                continue

            inputs = tokenizer(
                sentence,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )

            target_id = tokenizer.convert_tokens_to_ids(
                target_code
            )

            if target_id == tokenizer.unk_token_id:
                raise HTTPException(
                    status_code=400,
                    detail="Unsupported language code."
                )

            with torch.inference_mode():
                output = model.generate(
                    **inputs,
                    forced_bos_token_id=target_id,
                    max_new_tokens=256,
                    num_beams=4,
                    repetition_penalty=1.1
                )

            translated = tokenizer.batch_decode(
                output,
                skip_special_tokens=True
            )[0]

            translations.append(
                clean_translation(
                    translated, target_code
                )
            )

    return " ".join(translations)



@app.post("/translate")
def translate(request: TranslationRequest):
    text = request.text.strip()
    language = request.target_language.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Please enter text to translate."
        )

    if language not in ("Afaan Oromoo", "Amharic", "Both"):
        raise HTTPException(
            status_code=400,
            detail="Unsupported target language."
        )

    try:
        if language == "Both":
            oromo = translate_one(
                text, LANGUAGES["Afaan Oromoo"]
            )
            amharic = translate_one(
                text, LANGUAGES["Amharic"]
            )
            result = (
                f"Afaan Oromoo:\n{oromo}\n\n"
                f"Amharic:\n{amharic}"
            )
        else:
            result = translate_one(
                text, LANGUAGES[language]
            )

        return {
            "translation": result,
            "target_language": language,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as error:
        print("Translation error:", repr(error))
        raise HTTPException(
            status_code=500,
            detail="Local translation failed. Check backend logs."
        )
