from sqlmodel import SQLModel, Field
from typing import Optional

class Users(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    password: str

class Rooms(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    tables: int
    chairs: int
    level: Optional[int] = Field(default=0)
    photo: str