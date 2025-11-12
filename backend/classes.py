from pydantic import BaseModel, Field

class User(BaseModel):
    name: str
    password: str

class LoginedUser(BaseModel):
    id: int
    name: str

class Room(BaseModel):
    name: str = Field(..., pattern=r"^H\d{3}$")
    tables: int
    chairs: int
    filename: str