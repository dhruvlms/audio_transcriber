import os
import uuid
from flask import Flask, request, jsonify
from pydub import AudioSegment
import whisper
from flask_cors import CORS


from dotenv import load_dotenv
from google import genai


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=GEMINI_API_KEY)


app = Flask(__name__)
CORS(app)


UPLOAD_FOLDER = "uploads"
CHUNK_FOLDER = "chunks"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CHUNK_FOLDER, exist_ok=True)

# Load whisper model once
model = whisper.load_model("base")

# -------- Helper: Transcribe Single Chunk --------
def transcribe_chunk(chunk_path):
    """
    Transcribe a single audio chunk using Whisper
    """
    result = model.transcribe(chunk_path, fp16=False)
    return result["text"]


# -------- Helper: Gemini Summary --------
def summarize_with_gemini(full_transcript):
    """
    Send full transcript to Gemini and get bullet-point summary
    """
    prompt = f"""
You are an expert note-maker.

Summarize the following transcript into clear, important bullet points.
Be concise. Avoid filler. Focus on key ideas.

Transcript:
{full_transcript}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()

# -------- API Endpoint --------
@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]

    file_id = str(uuid.uuid4())
    audio_path = os.path.join(UPLOAD_FOLDER, f"{file_id}.wav")
    audio_file.save(audio_path)

    audio = AudioSegment.from_file(audio_path)

    chunk_length_ms = 10 * 1000  # 10 seconds
    chunks = []

    for i, start in enumerate(range(0, len(audio), chunk_length_ms)):
        end = start + chunk_length_ms
        chunk = audio[start:end]

        chunk_path = os.path.join(
            CHUNK_FOLDER, f"{file_id}_chunk_{i}.wav"
        )
        chunk.export(chunk_path, format="wav")

        text = transcribe_chunk(chunk_path)

        chunks.append({
            "chunk_index": i,
            "start_time_sec": start // 1000,
            "end_time_sec": min(end, len(audio)) // 1000,
            "transcript": text
        })
    print(f"Processed chunk {i} | {start//1000}s → {min(end, len(audio))//1000}s")
    # -------- FULL TRANSCRIPT --------
    full_transcript = " ".join(c["transcript"] for c in chunks)

    # -------- GEMINI SUMMARY (SAFE) --------
    try:
        summary_points = summarize_with_gemini(full_transcript)
    except Exception as e:
        summary_points = "Summary generation failed"
        print("Gemini error:", e)

    return jsonify({
        "file_id": file_id,
        "total_chunks": len(chunks),
        "chunks": chunks,
        "full_transcript": full_transcript,
        "summary_points": summary_points
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
