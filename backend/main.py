from fastapi import FastAPI, Request, Response, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import Session, SQLModel, create_engine, select
from datetime import datetime
from contextlib import asynccontextmanager
from passlib.context import CryptContext
from classes import *
from models import *

sqlite_url = "sqlite:///database.db"
engine = create_engine(sqlite_url, echo=True)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/addUser")
def add_user(user: User):
    with Session(engine) as session:
        stmt = select(Users).where(Users.name == user.name)
        existing = session.exec(stmt).first()

        if existing:
            raise HTTPException(status_code=400, detail="Пользователь уже существует")

        hashed = pwd_context.hash(user.password)
        db_user = Users(name=user.name, password=hashed)
        
        session.add(db_user)
        session.commit()
        session.refresh(db_user)

        return {"id": db_user.id, "name": db_user.name}

@app.post("/login")
def login(user: User, response: Response):
    with Session(engine) as session:
        stmt = select(Users).where(Users.name == user.name)
        existing = session.exec(stmt).first()

        if not existing or not pwd_context.verify(user.password, existing.password):
            raise HTTPException(status_code=401, detail="Неверный логин или пароль")

        return {"id": existing.id, "name": existing.name}
    
@app.post("/")
def Home(room: Room):
    with Session(engine) as session: 
        stmt = select(Rooms).where(Rooms.name == room.name)
        existing = session.exec(stmt).first()
        if existing:
            raise HTTPException(status_code=400, detail="Комната уже существует")
        db_room = Rooms(name=room.name, tables=room.tables, chairs=room.chairs, photo=room.filename)
        session.add(db_room)
        session.commit()
        session.refresh(db_room)

        return {"id": db_room.id, "name": db_room.name}
        
@app.get("/dashboard")
def Dashboard(user: LoginedUser):
    with Session(engine) as session:
        stmt_user = select(Users).where(
            Users.id == user.id,
            Users.name == user.name
        )
        existing = session.exec(stmt_user).first()
        if not existing:
            raise HTTPException(status_code=400, detail="Данного пользователя не существует")

        # fetch all rooms
        stmt_rooms = select(Rooms)
        rooms = session.exec(stmt_rooms).all()

        return {
            "user": existing,
            "rooms": rooms
        }