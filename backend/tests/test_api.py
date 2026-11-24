import pytest
import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Use dedicated SQLite test db
test_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "test_app.db"))
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"
os.environ["LLM_API_KEYS"] = "test_key_1,test_key_2"
os.environ["ENABLE_FAILURE_SIMULATION"] = "true"
os.environ["LITELLM_LOCAL_MODEL_COST_MAP"] = "True"

from database import db
db.db_path = test_db_path

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    db.init_db()
    with db.get_connection() as conn:
        conn.execute("DELETE FROM messages")
        conn.commit()
    yield

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["keys_configured"] >= 2
    assert data["cache_enabled"] is True

def test_chat_validation_missing_session_id():
    response = client.post("/chat", json={"message": "Hello"})
    assert response.status_code == 422
    assert "detail" in response.json()

def test_chat_validation_empty_session_id():
    response = client.post("/chat", json={"session_id": "   ", "message": "Hello"})
    assert response.status_code == 422
    assert "detail" in response.json()

def test_chat_validation_empty_message():
    response = client.post("/chat", json={"session_id": "s-1", "message": "   "})
    assert response.status_code == 422
    assert "detail" in response.json()

def test_chat_validation_oversized_message():
    long_msg = "a" * 4001
    response = client.post("/chat", json={"session_id": "s-1", "message": long_msg})
    assert response.status_code == 422
    assert "detail" in response.json()

def test_chat_live_inference():
    session_id = "s-test-live-1"
    response = client.post("/chat", json={
        "session_id": session_id,
        "message": "What is the capital of France?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id
    assert "Paris" in data["reply"] or len(data["reply"]) > 0
    meta = data["metadata"]
    assert meta["resolution_source"] == "LIVE_INFERENCE"
    assert meta["key_id"] == "key_1"
    assert meta["fallback_attempts"] == 0
    assert meta["input_tokens"] > 0
    assert meta["output_tokens"] > 0
    assert meta["latency_ms"] >= 0

def test_chat_response_caching():
    # Sending the same first message in a brand new session must return LLM_CACHE
    session_1 = "s-cache-session-1"
    session_2 = "s-cache-session-2"
    unique_msg = "Tell me an interesting fact about Jupiter"

    # Request 1 (Live Inference)
    res1 = client.post("/chat", json={"session_id": session_1, "message": unique_msg})
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["metadata"]["resolution_source"] == "LIVE_INFERENCE"
    assert data1["metadata"]["key_id"] == "key_1"

    # Request 2 with same message in new session (Must hit cache!)
    res2 = client.post("/chat", json={"session_id": session_2, "message": unique_msg})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["metadata"]["resolution_source"] == "LLM_CACHE"
    assert data2["reply"] == data1["reply"] # Identical reply text
    assert data2["metadata"]["key_id"] is None # null on LLM_CACHE
    assert data2["metadata"]["fallback_attempts"] == 0 # 0 on LLM_CACHE
    assert data2["metadata"]["input_tokens"] == data1["metadata"]["input_tokens"]
    assert data2["metadata"]["output_tokens"] == data1["metadata"]["output_tokens"]

def test_different_message_never_comes_from_cache():
    session_id = "s-diff-test"
    res1 = client.post("/chat", json={"session_id": session_id, "message": "First message"})
    res2 = client.post("/chat", json={"session_id": session_id, "message": "A completely different message"})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["metadata"]["resolution_source"] == "LIVE_INFERENCE"
    assert data2["metadata"]["key_id"] == "key_1"

def test_failover_simulation_key_1_429():
    session_id = "s-failover-429"
    headers = {"X-Simulate-Failure": "key_1=429"}
    response = client.post(
        "/chat",
        json={"session_id": session_id, "message": "Trigger failover test"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    meta = data["metadata"]
    # Failover to key_2
    assert meta["key_id"] == "key_2"
    assert meta["fallback_attempts"] == 1
    assert meta["resolution_source"] == "LIVE_INFERENCE"
    assert len(data["reply"]) > 0

def test_failover_simulation_key_1_500():
    session_id = "s-failover-500"
    headers = {"X-Simulate-Failure": "key_1=500"}
    response = client.post(
        "/chat",
        json={"session_id": session_id, "message": "Trigger 500 failover"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    meta = data["metadata"]
    assert meta["key_id"] == "key_2"
    assert meta["fallback_attempts"] == 1

def test_failover_simulation_all_keys_failed():
    session_id = "s-all-fail"
    headers = {"X-Simulate-Failure": "*=429"}
    response = client.post(
        "/chat",
        json={"session_id": session_id, "message": "All keys down"},
        headers=headers
    )
    # Must return 503 {"detail": "all providers unavailable"}
    assert response.status_code == 503
    assert response.json() == {"detail": "all providers unavailable"}

    # Nothing must be added to history
    hist_response = client.get(f"/sessions/{session_id}/messages")
    assert hist_response.status_code == 404 # Session was never created

def test_session_history_flow():
    session_id = "s-history-flow"
    # Send message 1
    res1 = client.post("/chat", json={"session_id": session_id, "message": "What is 2 + 2?"})
    assert res1.status_code == 200

    # Send message 2
    res2 = client.post("/chat", json={"session_id": session_id, "message": "What is 3 + 3?"})
    assert res2.status_code == 200

    # Retrieve history
    hist_res = client.get(f"/sessions/{session_id}/messages")
    assert hist_res.status_code == 200
    hist = hist_res.json()
    assert hist["session_id"] == session_id
    messages = hist["messages"]
    assert len(messages) == 4
    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "What is 2 + 2?"
    assert messages[1]["role"] == "assistant"
    assert "metadata" in messages[1]
    assert messages[2]["role"] == "user"
    assert messages[2]["content"] == "What is 3 + 3?"
    assert messages[3]["role"] == "assistant"
    assert "metadata" in messages[3]

def test_unknown_session_returns_404():
    response = client.get("/sessions/unknown-session-12345/messages")
    assert response.status_code == 404
    assert response.json() == {"detail": "session not found"}
