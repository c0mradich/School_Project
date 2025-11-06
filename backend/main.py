from fastapi import FastAPI, Request, Response, Depends, HTTPException, UploadFile, File, Form
import os, uuid, json
from fastapi.staticfiles import StaticFiles
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

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # создаем папку, если нет


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

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

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
    
@app.post("/create-room")
def create_room(
    name: str = Form(...),
    tables: int = Form(...),
    chairs: int = Form(...),
    fileNames: str = Form(...)
):
    file_names_list = json.loads(fileNames)  # теперь это Python list

    with Session(engine) as session:
        stmt = select(Rooms).where(Rooms.name == name)
        existing = session.exec(stmt).first()
        if existing:
            raise HTTPException(status_code=400, detail="Комната уже существует")

        # создаем записи для каждой комнаты/файла или просто одну запись с массивом в JSON
        db_room = Rooms(
            name=name,
            tables=tables,
            chairs=chairs,
            photo=json.dumps(file_names_list)  # если хочешь хранить массив в поле DB
        )
        session.add(db_room)
        session.commit()
        session.refresh(db_room)

        return {"id": db_room.id, "name": db_room.name, "files": file_names_list}
    

@app.post("/file")
async def upload_file(
    roomPhoto: UploadFile = File(...),
    username: str = Form(...),
    userId: str = Form(...)
):
    # проверка пользователя через БД
    with Session(engine) as session:
        stmt = select(Users).where(Users.id == int(userId))
        existing_user = session.exec(stmt).first()

        if not existing_user or existing_user.name != username:
            raise HTTPException(status_code=401, detail="Invalid user")

    # сохраняем файл

    file_ext = roomPhoto.filename.split(".")[-1]  # jpg, png и тп
    new_filename = f"{uuid.uuid4()}.{file_ext}"


    file_location = os.path.join(UPLOAD_DIR, new_filename)

    with open(file_location, "wb") as f:
        f.write(await roomPhoto.read())

    return {"filename": new_filename}
        

@app.get("/dashboard")
def Dashboard():
    with Session(engine) as session:
        
        # fetch all rooms
        stmt_rooms = select(Rooms)
        rooms = session.exec(stmt_rooms).all()

        return {
            "rooms": rooms
        }

@app.post("/fetchRoomData")
async def fetchRoomData(request: Request):
    data = await request.json()
    room = data.get("room")

    with Session(engine) as session:
        stmt_room = select(Rooms).where(Rooms.name == room)
        current_room = session.exec(stmt_room).first()

        if current_room:
            # Преобразуем в словарь
            room_dict = {
                "id": current_room.id,
                "name": current_room.name,
                "tables": current_room.tables,
                "chairs": current_room.chairs,
                "photo": current_room.photo
            }
            return JSONResponse(content={"room": room_dict, "status": "ok"})

        return JSONResponse(content={"error": "Room not found"})

