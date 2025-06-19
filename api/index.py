import logging
import sys
from dataclasses import dataclass

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_settings import BaseSettings

load_dotenv(".env.local")


class Settings(BaseSettings):
    openai_api_key: str | None = None
    vercel_url: str | None = None
    model: str = "ollama:llama3.2"
    base_url: str = "http://localhost:11434/v1"

    model_config = {
        "env_prefix": "",
        "env_file": ".env.local",
        "env_file_encoding": "utf-8",
        "extra": "allow",
    }


try:
    settings = Settings()
except ValidationError as e:
    print("Configuration error:\n", e, file=sys.stderr)
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Translation API",
    docs_url="/api/ai/docs",
    openapi_url="/api/ai/openapi.json",
    version="1.0.0",
)

if settings.vercel_url is None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

[model_provider, model_name] = settings.model.split(":")

provider = (
    OpenAIProvider(base_url=settings.base_url)
    if model_provider == "ollama"
    else OpenAIProvider(api_key=settings.openai_api_key)
)

model = OpenAIModel(
    model_name,
    provider=provider,
)


@dataclass
class Deps:
    from_language: str
    to_language: str


translate_agent = Agent(
    model,
    deps_type=Deps,
    output_type=str,
    system_prompt="""
Example:
  Input: Hello, world!
  Target: French
  Output: Bonjour, le monde!

You are a professional translation assistant.
When given any text, translate it into the target language exactly as requested.
• Preserve meaning, tone, punctuation and formatting (including line-breaks).
• If the text contains code snippets, keep code fences and syntax intact.
• Only output the translated text—do not include the source, explanations, or any extra characters.
""",
)


@translate_agent.system_prompt
def add_users_language(ctx: RunContext[Deps]) -> str:
    return (
        f"You must translate from {ctx.deps.from_language} to {ctx.deps.to_language}. "
        "If the source uses idioms or cultural references, render an equivalent expression "
        "that feels natural to a native speaker. "
        "Do not alter formatting or add any commentary."
    )


class TranslateRequest(BaseModel):
    text: str
    to_language: str
    from_language: str = "en"


class TranslateResponse(BaseModel):
    translation: str


class HealthResponse(BaseModel):
    status: str
    vercel_url: str
    python_version: str
    pydantic_ai_installed: bool


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.error("Validation error: %s", exc)
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.get("/api/ai/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        vercel_url=settings.vercel_url or "not set",
        python_version=sys.version,
        pydantic_ai_installed="pydantic_ai" in sys.modules,
    )


@app.post(
    "/api/ai/translate",
    summary="Translate text from one language to another",
    response_description="The translated text",
)
async def translate(request_data: TranslateRequest) -> TranslateResponse:
    logger.info("Translation request: %s", request_data)
    try:
        result = await translate_agent.run(
            request_data.text,
            deps=Deps(
                from_language=request_data.from_language or "en",
                to_language=request_data.to_language,
            ),
        )
        return TranslateResponse(translation=result.output)
    except ValidationError as ve:
        logger.error("Validation error during translation: %s", ve)
        raise HTTPException(status_code=422, detail=ve.errors()) from ve
    except Exception as e:
        logger.exception("Translation failed")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}") from e
