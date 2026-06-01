from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import get_db
from models import Usuario

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/cadastro")
def cadastrar(nome: str, email: str, senha: str, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    usuario = Usuario(
        nome=nome,
        email=email,
        senha_hash=pwd_context.hash(senha)
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return {"id": usuario.id, "nome": usuario.nome, "email": usuario.email}

@router.post("/login")
def login(email: str, senha: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario or not pwd_context.verify(senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return {"id": usuario.id, "nome": usuario.nome, "email": usuario.email}