from fastapi import FastAPI, Request, Response, HTTPException, UploadFile, File, Form
import os, uuid, json
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import Session, SQLModel, create_engine, select
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

origins = [
    "http://localhost:3000",  # фронт
    os.environ.get("FRONTEND_URL", "http://127.0.0.1:3000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # можно ["*"] для dev
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
def create_room(room: Room):
    print("Rooms:", room)
    with Session(engine) as session:
        stmt = select(Rooms).where(Rooms.name == room.name)
        existing = session.exec(stmt).first()
        if existing:
            raise HTTPException(status_code=400, detail="Комната уже существует")

        db_room = Rooms(
            name=room.name,
            tables=room.tables,
            chairs=room.chairs,
            level= int(room.name[1])+1,
            photo=room.filename
        )
        session.add(db_room)
        session.commit()
        session.refresh(db_room)

        return db_room
    

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
            room_dict = {
                "id": current_room.id,
                "name": current_room.name,
                "tables": current_room.tables,
                "chairs": current_room.chairs,
                "photo": current_room.photo
            }
            return JSONResponse(content={"room": room_dict, "status": "ok"})

        return JSONResponse(content={"error": "Room not found"})

@app.post("/editRoomDetail")
async def editRoomDetail(request: Request):
    data = await request.json()
    roomName = data.get("roomName")
    msg = data.get("msg")
    #print("MSG", msg)

    with Session(engine) as session:
        stmt_room = select(Rooms).where(Rooms.name == roomName)
        current_room = session.exec(stmt_room).first()

        if not current_room:
            return {"error": "Room not found"}

        # Проходимся по ключам msg и обновляем поля
        for key, value in msg.items():
            if hasattr(current_room, key):
                setattr(current_room, key, value)

        session.add(current_room)
        session.commit()
        session.refresh(current_room)

    return {"ok": True, "updated": msg}

@app.get("/fetchLevelData")
def fetchLevelData(level: int):
    #DEBUG 
    #print("LEVEL", level)

    with Session(engine) as session:
        stmt_rooms = select(Rooms).where(Rooms.level == level)
        level_rooms = session.exec(stmt_rooms).all()
    return {"level_rooms": level_rooms or None}

@app.post("/DeleteRoom")
async def delete_room(request: Request):
    data = await request.json()
    room_id = int(data.get("roomId"))

    if not room_id:
        raise HTTPException(status_code=400, detail="roomId fehlt")

    with Session(engine) as session:
        stmt = select(Rooms).where(Rooms.id == room_id)
        room = session.exec(stmt).first()

        if not room:
            raise HTTPException(status_code=404, detail="Raum nicht gefunden")

        session.delete(room)
        session.commit()

    return {"message": f"Raum {room_id} wurde erfolgreich gelöscht"}