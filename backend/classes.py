from pydantic import BaseModel

class User(BaseModel):
    name: str
    password: str

class LoginedUser(BaseModel):
    id: int
    name: str

class Room(BaseModel):
    name: str
    tables: int
    chairs: int
    filename: str
