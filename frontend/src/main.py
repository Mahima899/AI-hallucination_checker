
from fastapi import FastAPI, HTTPException

from backend.main import get_db

app = FastAPI()

@app.delete("/history")
def clear_all_history():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM checks")
        db.commit()
        cursor.close()
        db.close()
        return {"message": "All history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))