from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import Ocorrencia
import shutil, uuid, os

router = APIRouter()

@router.post("/")
async def criar_ocorrencia(
    usuario_id: int = Form(...),
    categoria: str = Form(...),
    descricao: str = Form(""),
    risco: str = Form("moderado"),
    latitude: float = Form(...),
    longitude: float = Form(...),
    foto: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    foto_path = None
    if foto:
        ext = foto.filename.split(".")[-1]
        nome_arquivo = f"{uuid.uuid4()}.{ext}"
        caminho = f"uploads/{nome_arquivo}"
        with open(caminho, "wb") as f:
            shutil.copyfileobj(foto.file, f)
        foto_path = caminho

    ocorrencia = Ocorrencia(
        usuario_id=usuario_id,
        categoria=categoria,
        descricao=descricao,
        risco=risco,
        latitude=latitude,
        longitude=longitude,
        foto=foto_path
    )
    db.add(ocorrencia)
    db.commit()
    db.refresh(ocorrencia)
    return ocorrencia

@router.get("/")
def listar_ocorrencias(db: Session = Depends(get_db)):
    return db.query(Ocorrencia).filter(Ocorrencia.status == "ativo").all()

@router.delete("/{ocorrencia_id}")
def deletar_ocorrencia(ocorrencia_id: int, db: Session = Depends(get_db)):
    ocorrencia = db.query(Ocorrencia).filter(Ocorrencia.id == ocorrencia_id).first()
    if not ocorrencia:
        raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
    db.delete(ocorrencia)
    db.commit()
    return {"message": "Ocorrência excluída com sucesso"}