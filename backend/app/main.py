import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv(Path(__file__).parents[1] / ".env", override=False)

from .database import Database
from .kiln import KilnError, KilnInterpreter
from .models import ChainAttachment, DecisionCreate, DecisionReceipt, Mandate, MandateCreate
from .services import ClampService


def create_app(db_path: str | None = None) -> FastAPI:
    resolved_path = db_path or os.getenv("DATABASE_PATH", str(Path(__file__).parents[1] / "clamp.db"))
    database = Database(resolved_path)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        database.initialize()
        yield

    app = FastAPI(title="CLAMP API", version="0.1.0", lifespan=lifespan)
    app.state.service = ClampService(database)
    app.state.interpreter = KilnInterpreter()
    origins = [item.strip() for item in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",") if item.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(KilnError)
    async def kiln_error_handler(request: Request, exc: KilnError):
        if exc.metric:
            request.app.state.service.save_metric(exc.metric, None)
        return JSONResponse(status_code=502, content={"detail": str(exc)})

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.post("/api/mandates", response_model=Mandate, status_code=201)
    def create_mandate(data: MandateCreate, request: Request):
        return request.app.state.service.create_mandate(data)

    @app.get("/api/mandates", response_model=list[Mandate])
    def list_mandates(request: Request):
        return request.app.state.service.list_mandates()

    @app.get("/api/mandates/{mandate_id}", response_model=Mandate)
    def get_mandate(mandate_id: str, request: Request):
        return request.app.state.service.get_mandate(mandate_id)

    @app.post("/api/mandates/{mandate_id}/chain", response_model=Mandate)
    def attach_mandate_chain(mandate_id: str, data: ChainAttachment, request: Request):
        return request.app.state.service.attach_mandate_chain(mandate_id, data)

    @app.post("/api/decisions", response_model=DecisionReceipt, status_code=201)
    def create_decision(data: DecisionCreate, request: Request):
        service = request.app.state.service
        mandate = service.get_mandate(data.mandate_id)
        result = request.app.state.interpreter.interpret(data.request, mandate.currency)
        receipt = service.create_decision(data.mandate_id, data.request, result.purchase)
        service.save_metric(result.metric, receipt.decision_id)
        return receipt

    @app.get("/api/decisions", response_model=list[DecisionReceipt])
    def list_decisions(request: Request):
        return request.app.state.service.list_decisions()

    @app.get("/api/decisions/{decision_id}", response_model=DecisionReceipt)
    def get_decision(decision_id: str, request: Request):
        return request.app.state.service.get_decision(decision_id)

    @app.post("/api/decisions/{decision_id}/approve", response_model=DecisionReceipt)
    def approve_decision(decision_id: str, request: Request):
        return request.app.state.service.approve(decision_id)

    @app.post("/api/decisions/{decision_id}/chain", response_model=DecisionReceipt)
    def attach_chain(decision_id: str, data: ChainAttachment, request: Request):
        return request.app.state.service.attach_chain(decision_id, data)

    @app.get("/api/metrics/summary")
    def metrics_summary(request: Request):
        return request.app.state.service.metrics_summary()

    return app


app = create_app()
